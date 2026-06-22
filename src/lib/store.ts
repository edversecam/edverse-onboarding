"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { Block, Course, Lesson, Module } from "./types";
import { createClient } from "./supabase/client";
import { sampleCourse } from "@/data/sample-course";

/**
 * Supabase-backed course store.
 *
 * Each course is persisted as a single `courses.data` jsonb document that
 * matches the typed `Course` model. The UI keeps using `useCourses` /
 * `useCourse` and the synchronous mutators below; mutations update an
 * in-memory cache optimistically and are persisted to Supabase (debounced).
 */

const supabase = createClient();

const EMPTY: Course[] = [];
let cache: Course[] = EMPTY;
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Ids of courses created locally but whose insert may not have landed yet —
 *  kept across a refetch so a brand-new course never disappears. */
const pendingIds = new Set<string>();

async function fetchCourses(): Promise<Course[] | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("data")
    .order("created_at", { ascending: true });
  if (error || !data) return null;
  return data.map((row) => row.data as Course);
}

function mergeIntoCache(dbCourses: Course[]) {
  const dbIds = new Set(dbCourses.map((c) => c.id));
  // Keep only freshly-created courses the fetch hasn't caught up to yet.
  const localOnly = cache.filter((c) => !dbIds.has(c.id) && pendingIds.has(c.id));
  cache = [...dbCourses, ...localOnly];
  loaded = true;
  emit();
}

async function ensureLoaded() {
  if (loaded || loadPromise) return loadPromise ?? undefined;
  loadPromise = (async () => {
    const db = await fetchCourses();
    if (db) mergeIntoCache(db);
    else {
      loaded = true;
      emit();
    }
    loadPromise = null;
  })();
  return loadPromise;
}

/** Re-fetch courses from Supabase and merge. Call when a course-list view
 *  mounts so newly created/published courses appear without a manual refresh. */
export async function revalidateCourses() {
  const db = await fetchCourses();
  if (db) mergeIntoCache(db);
}

/* ───────────────────────────── Persistence ───────────────────────────── */

const timers = new Map<string, ReturnType<typeof setTimeout>>();

/** Upsert a course, refreshing the session and retrying once if the first
 *  attempt is rejected (e.g. the access token expired while editing). */
async function upsertCourse(course: Course) {
  const payload = { id: course.id, title: course.title, data: course, published: true };
  let { error } = await supabase.from("courses").upsert(payload);
  if (error) {
    await supabase.auth.refreshSession().catch(() => {});
    ({ error } = await supabase.from("courses").upsert(payload));
  }
  return error;
}

function persist(course: Course, immediate = false) {
  const run = () => {
    upsertCourse(course).then((error) => {
      // Handled gracefully — keep it queued so a later save retries. Use warn
      // (not error) so it doesn't surface as a dev error overlay.
      if (error)
        console.warn("Edverse: auto-save will retry —", error.message || error.code || error);
      else pendingIds.delete(course.id);
    });
    timers.delete(course.id);
  };
  const existing = timers.get(course.id);
  if (existing) clearTimeout(existing);
  if (immediate) run();
  else timers.set(course.id, setTimeout(run, 600));
}

function setCache(next: Course[]) {
  cache = next;
  emit();
}

/* ───────────────────────────── Reads (hooks) ───────────────────────────── */

export function useCourses(): Course[] {
  useEffect(() => {
    ensureLoaded();
  }, []);
  return useSyncExternalStore(subscribe, () => cache, () => EMPTY);
}

export function useCoursesLoaded(): boolean {
  useEffect(() => {
    ensureLoaded();
  }, []);
  return useSyncExternalStore(subscribe, () => loaded, () => false);
}

export function useCourse(id: string): Course | undefined {
  return useCourses().find((c) => c.id === id);
}

/* ───────────────────────────── Mutations ───────────────────────────── */

export const uid = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

function update(courseId: string, fn: (c: Course) => Course) {
  let updated: Course | undefined;
  const next = cache.map((c) => {
    if (c.id !== courseId) return c;
    updated = fn(c);
    return updated;
  });
  setCache(next);
  if (updated) persist(updated);
}

export function createCourse(): Course {
  const course: Course = {
    id: uid("course"),
    title: "Untitled course",
    subtitle: "",
    audience: "All new hires",
    description: "",
    modules: [
      {
        id: uid("m"),
        title: "Module 1",
        lessons: [{ id: uid("l"), title: "Lesson 1", blocks: [] }],
      },
    ],
  };
  pendingIds.add(course.id);
  setCache([...cache, course]);
  persist(course, true);
  return course;
}

/** Upsert the bundled sample course so a fresh workspace has content to explore. */
export function importStarterCourse(): Course {
  const course = structuredClone(sampleCourse);
  const exists = cache.some((c) => c.id === course.id);
  pendingIds.add(course.id);
  setCache(exists ? cache.map((c) => (c.id === course.id ? course : c)) : [...cache, course]);
  persist(course, true);
  return course;
}

export function deleteCourse(courseId: string) {
  setCache(cache.filter((c) => c.id !== courseId));
  const t = timers.get(courseId);
  if (t) clearTimeout(t);
  supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .then(({ error }) => {
      if (error) console.warn("Edverse: delete failed —", error.message || error.code || error);
    });
}

/** Force an immediate save of a course (flushes the debounced write). Returns
 *  whether the save succeeded so the UI can confirm it. */
export async function saveCourse(courseId: string): Promise<boolean> {
  const course = cache.find((c) => c.id === courseId);
  if (!course) return false;
  const t = timers.get(courseId);
  if (t) {
    clearTimeout(t);
    timers.delete(courseId);
  }
  const error = await upsertCourse(course);
  if (error) {
    console.warn("Edverse: save failed —", error.message || error.code || error);
    return false;
  }
  pendingIds.delete(courseId);
  return true;
}

export function patchCourse(courseId: string, patch: Partial<Course>) {
  update(courseId, (c) => ({ ...c, ...patch }));
}

export function addModule(courseId: string) {
  update(courseId, (c) => ({
    ...c,
    modules: [
      ...c.modules,
      { id: uid("m"), title: `Module ${c.modules.length + 1}`, lessons: [] },
    ],
  }));
}

export function patchModule(courseId: string, moduleId: string, patch: Partial<Module>) {
  update(courseId, (c) => ({
    ...c,
    modules: c.modules.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)),
  }));
}

export function deleteModule(courseId: string, moduleId: string) {
  update(courseId, (c) => ({
    ...c,
    modules: c.modules.filter((m) => m.id !== moduleId),
  }));
}

export function moveModule(courseId: string, moduleId: string, dir: -1 | 1) {
  update(courseId, (c) => ({ ...c, modules: move(c.modules, moduleId, dir) }));
}

export function addLesson(courseId: string, moduleId: string): Lesson {
  const lesson: Lesson = { id: uid("l"), title: "New lesson", blocks: [] };
  update(courseId, (c) => ({
    ...c,
    modules: c.modules.map((m) =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m
    ),
  }));
  return lesson;
}

export function patchLesson(courseId: string, lessonId: string, patch: Partial<Lesson>) {
  update(courseId, (c) => ({
    ...c,
    modules: c.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)),
    })),
  }));
}

export function deleteLesson(courseId: string, lessonId: string) {
  update(courseId, (c) => ({
    ...c,
    modules: c.modules.map((m) => ({
      ...m,
      lessons: m.lessons.filter((l) => l.id !== lessonId),
    })),
  }));
}

export function moveLesson(courseId: string, moduleId: string, lessonId: string, dir: -1 | 1) {
  update(courseId, (c) => ({
    ...c,
    modules: c.modules.map((m) =>
      m.id === moduleId ? { ...m, lessons: move(m.lessons, lessonId, dir) } : m
    ),
  }));
}

export function setLessonBlocks(courseId: string, lessonId: string, blocks: Block[]) {
  patchLesson(courseId, lessonId, { blocks });
}

/* ───────────────────────────── helpers ───────────────────────────── */

function move<T extends { id: string }>(arr: T[], id: string, dir: -1 | 1): T[] {
  const i = arr.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
