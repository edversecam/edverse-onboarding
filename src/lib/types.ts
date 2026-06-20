/**
 * Edverse domain model.
 *
 * A Course contains ordered Modules; each Module contains ordered Lessons;
 * each Lesson is a stack of content Blocks. Some blocks are interactive
 * "quiz" blocks that the learner answers and we grade.
 *
 * These types are the single source of truth shared by the learner runtime,
 * the (Phase 2) authoring UI, and the Supabase schema.
 */

export type ID = string;

/* ───────────────────────────── Quizzes ───────────────────────────── */

export type QuizKind =
  | "multiple-choice" // pick ONE correct option
  | "multiple-answer" // pick ALL correct options (checkboxes)
  | "true-false"
  | "ordering" // arrange items into the correct sequence
  | "drag-drop" // drag items into labelled drop zones / categories
  | "matching" // match left items to right items
  | "fill-gap"; // choose the right word for each blank in a sentence

export interface QuizBase {
  id: ID;
  kind: QuizKind;
  prompt: string;
  /** Optional helper text shown under the prompt. */
  hint?: string;
  /** Feedback shown after a correct / incorrect submission. */
  feedbackCorrect?: string;
  feedbackIncorrect?: string;
  points?: number;
}

export interface ChoiceOption {
  id: ID;
  text: string;
  correct?: boolean;
}

export interface MultipleChoiceQuiz extends QuizBase {
  kind: "multiple-choice";
  options: ChoiceOption[];
}

export interface MultipleAnswerQuiz extends QuizBase {
  kind: "multiple-answer";
  options: ChoiceOption[];
}

export interface TrueFalseQuiz extends QuizBase {
  kind: "true-false";
  answer: boolean;
}

export interface OrderingQuiz extends QuizBase {
  kind: "ordering";
  /** Items listed in their CORRECT order; the runtime shuffles for display. */
  items: { id: ID; text: string }[];
}

export interface DragDropZone {
  id: ID;
  label: string;
}
export interface DragDropItem {
  id: ID;
  text: string;
  /** id of the zone this item belongs in. */
  zoneId: ID;
}
export interface DragDropQuiz extends QuizBase {
  kind: "drag-drop";
  zones: DragDropZone[];
  items: DragDropItem[];
}

export interface MatchPair {
  id: ID;
  left: string;
  right: string;
}
export interface MatchingQuiz extends QuizBase {
  kind: "matching";
  pairs: MatchPair[];
}

export interface FillGapBlank {
  id: ID;
  /** Accepted answer (the correct option). */
  answer: string;
  /** Distractor words; combined with answer + other answers to form the word bank. */
  options?: string[];
}
export interface FillGapQuiz extends QuizBase {
  kind: "fill-gap";
  /**
   * Sentence with blanks marked by tokens like {{1}}, {{2}} that map by order
   * to the `blanks` array.
   */
  text: string;
  blanks: FillGapBlank[];
}

export type Quiz =
  | MultipleChoiceQuiz
  | MultipleAnswerQuiz
  | TrueFalseQuiz
  | OrderingQuiz
  | DragDropQuiz
  | MatchingQuiz
  | FillGapQuiz;

/* ───────────────────────────── Content blocks ───────────────────────────── */

export type BlockKind =
  | "text"
  | "text-image"
  | "accordion"
  | "flip-card"
  | "video"
  | "callout"
  | "knowledge-check";

export interface BlockBase {
  id: ID;
  kind: BlockKind;
}

export interface TextBlock extends BlockBase {
  kind: "text";
  heading?: string;
  /** Lightweight markdown-ish body (paragraphs, **bold**, *italic*, - lists). */
  body: string;
}

export interface TextImageBlock extends BlockBase {
  kind: "text-image";
  heading?: string;
  body: string;
  imageUrl: string;
  imageAlt?: string;
  /** Side the image sits on. */
  imageSide?: "left" | "right";
}

export interface AccordionItem {
  id: ID;
  title: string;
  body: string;
}
export interface AccordionBlock extends BlockBase {
  kind: "accordion";
  heading?: string;
  items: AccordionItem[];
}

export interface FlipCard {
  id: ID;
  front: string;
  back: string;
}
export interface FlipCardBlock extends BlockBase {
  kind: "flip-card";
  heading?: string;
  cards: FlipCard[];
}

export type VideoSource = "youtube" | "url" | "embed";
export interface VideoBlock extends BlockBase {
  kind: "video";
  heading?: string;
  source: VideoSource;
  /** For youtube: the URL or ID. For url: an mp4/webm URL. For embed: raw iframe HTML. */
  value: string;
  caption?: string;
}

export interface CalloutBlock extends BlockBase {
  kind: "callout";
  tone: "info" | "success" | "warning";
  title?: string;
  body: string;
}

export interface KnowledgeCheckBlock extends BlockBase {
  kind: "knowledge-check";
  heading?: string;
  quiz: Quiz;
}

export type Block =
  | TextBlock
  | TextImageBlock
  | AccordionBlock
  | FlipCardBlock
  | VideoBlock
  | CalloutBlock
  | KnowledgeCheckBlock;

/* ───────────────────────────── Structure ───────────────────────────── */

export interface Lesson {
  id: ID;
  title: string;
  /** Optional short summary shown in the sidebar tooltip / lesson header. */
  summary?: string;
  /** Estimated minutes to complete. */
  durationMin?: number;
  blocks: Block[];
}

export interface Module {
  id: ID;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: ID;
  title: string;
  subtitle?: string;
  description?: string;
  /** Audience / department label, e.g. "All new hires". */
  audience?: string;
  modules: Module[];
}

/* ───────────────────────────── Helpers ───────────────────────────── */

export interface FlatLesson {
  moduleId: ID;
  moduleTitle: string;
  moduleIndex: number;
  lesson: Lesson;
  /** Global index across the whole course. */
  index: number;
}

/** Flatten a course into an ordered list of lessons for the player. */
export function flattenLessons(course: Course): FlatLesson[] {
  const flat: FlatLesson[] = [];
  course.modules.forEach((m, moduleIndex) => {
    m.lessons.forEach((lesson) => {
      flat.push({
        moduleId: m.id,
        moduleTitle: m.title,
        moduleIndex,
        lesson,
        index: flat.length,
      });
    });
  });
  return flat;
}
