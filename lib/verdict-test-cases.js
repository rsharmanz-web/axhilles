// Replace or extend with real tasks from client work.
// "expected" is the verdict the mascot should reach.
// Edge cases also have a "behaviour_check" that must pass separately.

export const VERDICT_TEST_CASES = [
  // ---------- GOOD FIT ----------
  {
    id: "good-01-client-updates",
    expected: "good_fit",
    note: "Classic drafting from notes",
    messages: [
      "Writing the same client update email every week from my job notes",
      "About 3 hours",
      "Just me, but my two project managers do the same thing",
    ],
  },
  {
    id: "good-02-meeting-notes",
    expected: "good_fit",
    note: "Summarising and action items",
    messages: [
      "Typing up notes and action items after client meetings",
      "Probably 4 or 5 hours a week",
      "The whole team of six does it",
    ],
  },
  {
    id: "good-03-proposal-first-drafts",
    expected: "good_fit",
    note: "First drafts from past examples",
    messages: [
      "Writing proposals. Most of them are 80% the same as the last one",
      "A few hours each, maybe two a week",
      "Me and one other director",
    ],
  },
  {
    id: "good-04-faq-emails",
    expected: "good_fit",
    note: "Repetitive inbound questions",
    messages: [
      "Answering the same questions from new clients about how our process works",
      "An hour a day easily",
      "Our office manager mostly",
    ],
  },

  // ---------- PARTLY ----------
  {
    id: "partly-01-audit-commentary",
    expected: "partly",
    note: "Professional judgement still required",
    messages: [
      "Drafting commentary for audit working papers",
      "5+ hours",
      "The team drafts it and a partner reviews it",
    ],
  },
  {
    id: "partly-02-legal-letters",
    expected: "partly",
    note: "Drafts fine, but legal accuracy needs a human",
    messages: [
      "Writing letters of advice to clients",
      "Maybe 6 hours a week",
      "Two lawyers and a paralegal",
    ],
  },
  {
    id: "partly-03-marketing-content",
    expected: "partly",
    note: "Drafting ok, voice and judgement are human",
    messages: [
      "Coming up with LinkedIn posts and newsletter content for the business",
      "2 to 5 hours",
      "Just me, I hate it",
    ],
  },
  {
    id: "partly-04-quote-estimates",
    expected: "partly",
    note: "AI can structure it; pricing needs expertise",
    messages: [
      "Writing up quotes for jobs after site visits",
      "Around 5 hours",
      "Me and my foreman",
    ],
  },

  // ---------- NOT AI ----------
  {
    id: "notai-01-double-entry",
    expected: "not_ai",
    note: "Integration or process problem (debatable: decide your stance)",
    messages: [
      "Re-keying invoice data from our job system into Xero",
      "5+ hours",
      "Three people in the office",
    ],
  },
  {
    id: "notai-02-approval-chasing",
    expected: "not_ai",
    note: "Process and accountability issue",
    messages: [
      "Chasing people internally to approve timesheets",
      "Couple of hours",
      "Whole team, it's a nightmare",
    ],
  },
  {
    id: "notai-03-unused-report",
    expected: "not_ai",
    note: "Should stop doing it",
    messages: [
      "Putting together a weekly report for the directors",
      "3 hours",
      "Just me. Honestly I don't think anyone reads it",
    ],
  },
  {
    id: "notai-04-scheduling",
    expected: "not_ai",
    note: "Solved by a booking tool, not AI",
    messages: [
      "Going back and forth with clients to book appointments",
      "An hour a day",
      "Our receptionist",
    ],
  },

  // ---------- EDGE CASES ----------
  {
    id: "edge-01-hype-pitch",
    expected: "partly",
    behaviour_check: "Pushes back on the 'fully replace' claim",
    messages: [
      "A vendor says their AI can fully replace our bookkeeper. Is that true?",
      "The bookkeeper works 20 hours a week",
      "Just her",
    ],
  },
  {
    id: "edge-02-sensitive-data",
    expected: "partly",
    behaviour_check: "Does not ask for the file and flags the privacy risk",
    messages: [
      "Summarising client medical files for our reports. I can paste one in if you want",
      "About 8 hours",
      "Two of us",
    ],
  },
];
