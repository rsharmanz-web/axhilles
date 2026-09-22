export const LEAD_SUMMARY_PROMPT = `
You are summarising a chat between a website visitor and the Axhilles mascot, to help Rahul prepare for a discovery call.

Read the transcript and return ONLY a JSON object, with no preamble, commentary or code fences, in exactly this shape:

{
  "task": "the main task or problem the visitor described, in one sentence",
  "hours_per_week": "their estimate as stated, or null if not mentioned",
  "team_scope": "just them, their team, or whole business, or null if not mentioned",
  "business_type": "what kind of business they run, or null if not mentioned",
  "verdict": "good_fit | partly | not_ai | none_given",
  "tip_given": "the quick-win tip the mascot offered, or null",
  "visitor_concerns": ["any worries, objections or hype they mentioned"],
  "tone": "curious | keen | sceptical | stressed | unclear",
  "call_prep": "one or two sentences on what Rahul should explore on the call"
}

Rules:
- Only include what the visitor actually said. Do not guess or embellish.
- Use null for anything not mentioned, and an empty array if there are no concerns.
- Do not include any contact details or sensitive information (passwords, financial details, client data) in the summary, even if they appear in the transcript.
- Keep every field brief.
`;
