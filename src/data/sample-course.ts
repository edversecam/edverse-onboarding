import { Course } from "@/lib/types";

/**
 * Seed content for the Edverse onboarding academy.
 * Demonstrates every content block and all seven interactive quiz types.
 * Replace the copy with your real onboarding material (Phase 2 moves this
 * into Supabase and the authoring UI).
 */
export const sampleCourse: Course = {
  id: "welcome-week-1",
  title: "Welcome to the Team",
  subtitle: "Your first week at the company",
  audience: "All new hires",
  description:
    "Everything you need for a confident start — who we are, how we work, the tools you'll use, and the policies that keep us all safe.",
  modules: [
    {
      id: "m1",
      title: "1 · Welcome & Culture",
      lessons: [
        {
          id: "l1",
          title: "Hello, and welcome aboard",
          summary: "A warm welcome and what to expect this week.",
          durationMin: 6,
          blocks: [
            {
              id: "b1",
              kind: "text",
              heading: "We're glad you're here",
              body:
                "Welcome to the team! Over the next few lessons you'll get to know **who we are**, *how we work*, and where to find help.\n\nThis week is about orientation — there's no pressure to remember everything. Take it one lesson at a time, and use the menu on the left to move around.",
            },
            {
              id: "b2",
              kind: "callout",
              tone: "info",
              title: "How this works",
              body:
                "Each lesson mixes short readings with quick **knowledge checks**. Use *Next* and *Previous* at the bottom to navigate, and your progress is tracked automatically.",
            },
            {
              id: "b3",
              kind: "text-image",
              heading: "Our mission",
              imageSide: "right",
              imageUrl: "https://picsum.photos/seed/edverse-mission/800/600",
              imageAlt: "Team collaborating",
              body:
                "We exist to make a measurable difference for the people we serve. Everything we build ties back to that.\n\n- Put the customer first\n- Move with care and speed\n- Leave things better than we found them",
            },
            {
              id: "b4",
              kind: "knowledge-check",
              heading: "Quick check",
              quiz: {
                id: "q1",
                kind: "true-false",
                prompt:
                  "Your first week is mainly about orientation — you're not expected to memorise everything at once.",
                answer: true,
                feedbackCorrect: "Exactly — take your time and explore.",
                feedbackIncorrect:
                  "Actually it's true — week one is for getting oriented, not memorising.",
              },
            },
          ],
        },
        {
          id: "l2",
          title: "Our values in action",
          summary: "The values that guide day-to-day decisions.",
          durationMin: 8,
          blocks: [
            {
              id: "b5",
              kind: "accordion",
              heading: "The four values",
              items: [
                {
                  id: "a1",
                  title: "Customer first",
                  body:
                    "We start from the customer's problem and work backwards. When in doubt, ask: *does this help them?*",
                },
                {
                  id: "a2",
                  title: "Own the outcome",
                  body:
                    "We take responsibility end-to-end. Seeing a gap is the same as owning it until it's handed off clearly.",
                },
                {
                  id: "a3",
                  title: "Default to openness",
                  body:
                    "We share early and write things down so others can build on our work.",
                },
                {
                  id: "a4",
                  title: "Care for each other",
                  body:
                    "We assume good intent, give feedback kindly, and make space for everyone to do their best work.",
                },
              ],
            },
            {
              id: "b6",
              kind: "flip-card",
              heading: "Values flashcards",
              cards: [
                { id: "f1", front: "Customer first", back: "Start from their problem, work backwards." },
                { id: "f2", front: "Own the outcome", back: "See a gap? You own it until it's handed off." },
                { id: "f3", front: "Default to openness", back: "Share early. Write it down." },
              ],
            },
            {
              id: "b7",
              kind: "knowledge-check",
              heading: "Match the value",
              quiz: {
                id: "q2",
                kind: "matching",
                prompt: "Match each value to what it means in practice.",
                pairs: [
                  { id: "p1", left: "Customer first", right: "Start from their problem" },
                  { id: "p2", left: "Own the outcome", right: "Responsible end-to-end" },
                  { id: "p3", left: "Default to openness", right: "Share early, write it down" },
                  { id: "p4", left: "Care for each other", right: "Assume good intent" },
                ],
                feedbackCorrect: "Perfect match!",
              },
            },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "2 · Tools & Workspace",
      lessons: [
        {
          id: "l3",
          title: "Setting up your tools",
          summary: "The core apps and how they fit together.",
          durationMin: 10,
          blocks: [
            {
              id: "b8",
              kind: "text",
              heading: "Your toolkit",
              body:
                "You'll use a small set of core tools every day. Here's a short walkthrough video, then a couple of checks.",
            },
            {
              id: "b9",
              kind: "video",
              heading: "Workspace tour (3 min)",
              source: "youtube",
              value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              caption: "Replace this with your internal walkthrough video.",
            },
            {
              id: "b10",
              kind: "knowledge-check",
              heading: "Sort the tools",
              quiz: {
                id: "q3",
                kind: "drag-drop",
                prompt: "Drag each tool into the right category.",
                zones: [
                  { id: "z1", label: "Communication" },
                  { id: "z2", label: "Documents" },
                ],
                items: [
                  { id: "d1", text: "Team chat", zoneId: "z1" },
                  { id: "d2", text: "Video calls", zoneId: "z1" },
                  { id: "d3", text: "Shared drive", zoneId: "z2" },
                  { id: "d4", text: "Wiki", zoneId: "z2" },
                ],
                feedbackCorrect: "Nicely sorted!",
              },
            },
            {
              id: "b11",
              kind: "knowledge-check",
              heading: "First-day order",
              quiz: {
                id: "q4",
                kind: "ordering",
                prompt: "Put the account setup steps in the right order.",
                items: [
                  { id: "o1", text: "Activate your company email" },
                  { id: "o2", text: "Set up multi-factor authentication" },
                  { id: "o3", text: "Install the chat app" },
                  { id: "o4", text: "Join your team channel" },
                ],
                feedbackCorrect: "That's the right sequence.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "3 · Policies & Compliance",
      lessons: [
        {
          id: "l4",
          title: "Security basics",
          summary: "Keep yourself and the company safe.",
          durationMin: 9,
          blocks: [
            {
              id: "b12",
              kind: "callout",
              tone: "warning",
              title: "This matters",
              body:
                "Security is everyone's job. A few good habits prevent the vast majority of incidents.",
            },
            {
              id: "b13",
              kind: "text",
              heading: "Password hygiene",
              body:
                "Use a unique passphrase for your work account and enable multi-factor authentication. Never reuse personal passwords.",
            },
            {
              id: "b14",
              kind: "knowledge-check",
              heading: "Spot the safe habits",
              quiz: {
                id: "q5",
                kind: "multiple-answer",
                prompt: "Which of these are good security habits? Select all that apply.",
                options: [
                  { id: "ma1", text: "Enable multi-factor authentication", correct: true },
                  { id: "ma2", text: "Reuse one easy password everywhere" },
                  { id: "ma3", text: "Lock your screen when you step away", correct: true },
                  { id: "ma4", text: "Report suspicious emails to IT", correct: true },
                  { id: "ma5", text: "Share your password with a teammate to save time" },
                ],
                feedbackCorrect: "Spot on — those are the habits we want.",
                feedbackIncorrect: "Re-check: MFA, locking your screen, and reporting phishing are the safe ones.",
              },
            },
            {
              id: "b15",
              kind: "knowledge-check",
              heading: "Phishing",
              quiz: {
                id: "q6",
                kind: "multiple-choice",
                prompt: "You get an urgent email asking you to log in via a link to 'verify your account'. What's the best first step?",
                options: [
                  { id: "mc1", text: "Click the link quickly before it expires" },
                  { id: "mc2", text: "Report it to IT and don't click the link", correct: true },
                  { id: "mc3", text: "Reply asking if it's legitimate" },
                  { id: "mc4", text: "Forward it to your team to warn them" },
                ],
                feedbackCorrect: "Right — report and don't click.",
                feedbackIncorrect: "The safest move is to report it to IT without clicking.",
              },
            },
            {
              id: "b16",
              kind: "knowledge-check",
              heading: "Complete the policy",
              quiz: {
                id: "q7",
                kind: "fill-gap",
                prompt: "Fill in the data-handling rule.",
                text:
                  "Always store customer data on {{1}} systems, and never send it over {{2}} channels.",
                blanks: [
                  { id: "g1", answer: "approved", options: ["personal", "random"] },
                  { id: "g2", answer: "unencrypted", options: ["secure", "internal"] },
                ],
                feedbackCorrect: "Correct — approved systems, encrypted channels.",
              },
            },
            {
              id: "b17",
              kind: "text",
              heading: "You're all set 🎉",
              body:
                "That's the end of your Week 1 essentials. Your onboarding buddy will follow up — welcome aboard!",
            },
          ],
        },
      ],
    },
  ],
};
