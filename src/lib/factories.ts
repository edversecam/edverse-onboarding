import { Block, BlockKind, Quiz, QuizKind } from "./types";
import { uid } from "./store";

export const BLOCK_LABELS: Record<BlockKind, string> = {
  text: "Text",
  "text-image": "Text + Image",
  callout: "Callout",
  accordion: "Accordion",
  "flip-card": "Flip cards",
  slide: "Slides",
  video: "Video",
  "knowledge-check": "Knowledge check",
};

export const QUIZ_LABELS: Record<QuizKind, string> = {
  "multiple-choice": "Multiple choice",
  "multiple-answer": "Multiple answer",
  "true-false": "True / False",
  ordering: "Ordering",
  "drag-drop": "Drag & drop",
  matching: "Matching",
  "fill-gap": "Fill the gap",
};

export function newBlock(kind: BlockKind): Block {
  switch (kind) {
    case "text":
      return { id: uid("b"), kind, heading: "Heading", body: "Write your content here." };
    case "text-image":
      return {
        id: uid("b"),
        kind,
        heading: "Heading",
        body: "Describe the image alongside this text.",
        imageUrl: "https://picsum.photos/seed/edverse/800/600",
        imageAlt: "",
        imageSide: "right",
      };
    case "callout":
      return { id: uid("b"), kind, tone: "info", title: "Note", body: "Something worth highlighting." };
    case "accordion":
      return {
        id: uid("b"),
        kind,
        heading: "Frequently asked",
        items: [
          { id: uid("a"), title: "Question one", body: "Answer one." },
          { id: uid("a"), title: "Question two", body: "Answer two." },
        ],
      };
    case "flip-card":
      return {
        id: uid("b"),
        kind,
        heading: "Flashcards",
        cards: [
          { id: uid("f"), front: "Term", back: "Definition" },
          { id: uid("f"), front: "Term", back: "Definition" },
        ],
      };
    case "slide":
      return {
        id: uid("b"),
        kind,
        heading: "Presentation",
        slides: [
          { id: uid("s"), title: "Slide one", body: "Your first slide's content." },
          { id: uid("s"), title: "Slide two", body: "Your second slide's content." },
        ],
      };
    case "video":
      return {
        id: uid("b"),
        kind,
        heading: "Watch this",
        source: "youtube",
        value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        caption: "",
      };
    case "knowledge-check":
      return { id: uid("b"), kind, heading: "Knowledge check", quizzes: [newQuiz("multiple-choice")] };
  }
}

export function newQuiz(kind: QuizKind): Quiz {
  const base = { id: uid("q"), prompt: "Your question?" };
  switch (kind) {
    case "multiple-choice":
      return {
        ...base,
        kind,
        options: [
          { id: uid("o"), text: "Correct option", correct: true },
          { id: uid("o"), text: "Wrong option" },
        ],
      };
    case "multiple-answer":
      return {
        ...base,
        kind,
        options: [
          { id: uid("o"), text: "Correct one", correct: true },
          { id: uid("o"), text: "Correct two", correct: true },
          { id: uid("o"), text: "Wrong one" },
        ],
      };
    case "true-false":
      return { ...base, kind, answer: true };
    case "ordering":
      return {
        ...base,
        kind,
        prompt: "Put these in the correct order.",
        items: [
          { id: uid("o"), text: "First" },
          { id: uid("o"), text: "Second" },
          { id: uid("o"), text: "Third" },
        ],
      };
    case "drag-drop":
      return {
        ...base,
        kind,
        prompt: "Sort each item into the right group.",
        zones: [
          { id: "z1", label: "Group A" },
          { id: "z2", label: "Group B" },
        ],
        items: [
          { id: uid("d"), text: "Item 1", zoneId: "z1" },
          { id: uid("d"), text: "Item 2", zoneId: "z2" },
        ],
      };
    case "matching":
      return {
        ...base,
        kind,
        prompt: "Match each item to its pair.",
        pairs: [
          { id: uid("p"), left: "Left A", right: "Right A" },
          { id: uid("p"), left: "Left B", right: "Right B" },
        ],
      };
    case "fill-gap":
      return {
        ...base,
        kind,
        prompt: "Complete the sentence.",
        text: "The capital of France is {{1}}.",
        blanks: [{ id: uid("g"), answer: "Paris", options: ["London", "Berlin"] }],
      };
  }
}
