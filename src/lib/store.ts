"use client";

import { useSyncExternalStore } from "react";
import { Block, Course, Lesson, Module } from "./types";
import { sampleCourse } from "@/data/sample-course";

/**
 * Client-side course store backed by localStorage.
 *
 * This is the single data-access seam for authoring + learning. Phase 2 swaps
 * the bodies of these functions for Supabase calls; components keep using the
 * same `useCourses` / `useCourse` hooks and mutators.
 */
const KEY = "edverse:courses:v1";
const listeners = new Set<() => void>();

let cache: Course[] | null = null;

/** Stable reference for SSR / first paint so useSyncExternalStore doesn't loop. */
const serverSnapshot: Course[] = [sampleCourse];
const getServerSnapshot = () => serverSnapshot;

function read(): Course[] {
  if (cache) return cache;
  if (typeof window === "undefined") return [sampleCourse];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw) as Course[];
    } else {
      cache = [structuredClone(sampleCourse)];
      localStorage.setItem(KEY, JSON.stringify(cache));
    }
  } catch {
    cache = [structuredClone(sampleCourse)];
  }
  return cache!;
}

function write(courses: Course[]) {
  cache = courses;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(courses));
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/* ───────────────────────────── Reads (hooks) ───────────────────────────── */

export function useCourses(): Course[] {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}

export function useCourse(id: string): Course | undefined {
  const courses = useCourses();
  return courses.find((c) => c.id === id);
}

/* ───────────────────────────── Mutations ───────────────────────────── */

export const uid = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

function update(courseId: string, fn: (c: Course) => Course) {
  write(read().map((c) => (c.id === courseId ? fn(c) : c)));
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
  write([...read(), course]);
  return course;
}

export function deleteCourse(courseId: string) {
  write(read().filter((c) => c.id !== courseId));
}

export function patchCourse(courseId: string, patch: Partial<Course>) {
  update(courseId, (c) => ({ ...c, ...patch }));
}

export function addModule(courseId: string) {
  update(courseId, (c) => ({
    ...c,
    modules: [
      ...c.modules,
      {
        id: uid("m"),
        title: `Module ${c.modules.length + 1}`,
        lessons: [],
      },
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

export function patchLesson(
  courseId: string,
  lessonId: string,
  patch: Partial<Lesson>
) {
  update(courseId, (c) => ({
    ...c,
    modules: c.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) =>
        l.id === lessonId ? { ...l, ...patch } : l
      ),
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

export function moveLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  dir: -1 | 1
) {
  update(courseId, (c) => ({
    ...c,
    modules: c.modules.map((m) =>
      m.id === moduleId ? { ...m, lessons: move(m.lessons, lessonId, dir) } : m
    ),
  }));
}

export function setLessonBlocks(
  courseId: string,
  lessonId: string,
  blocks: Block[]
) {
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
