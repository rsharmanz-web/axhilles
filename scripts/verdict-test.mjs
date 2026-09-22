import { createRequire } from "module";
import { MASCOT_SYSTEM_PROMPT } from "../lib/mascot-prompt.js";
import { VERDICT_TEST_CASES } from "../lib/verdict-test-cases.js";

const require = createRequire(import.meta.url);
const { fillMascotPrompt } = require("../lib/placeholders.js");

const MODEL = "claude-haiku-4-5";

const CLASSIFY_SYSTEM = `You classify the mascot's final verdict in an Axhilles chat.

Reply with ONLY one token, lowercase, no punctuation:
good_fit
partly
not_ai
none_given

Rules:
- good_fit: AI can genuinely help with the task.
- partly: AI can do part of it; a human still needs to check.
- not_ai: it is a process problem, or they should stop doing it, or a non-AI tool is the fix.
- none_given: no honest verdict was given.`;

function behaviourSystem(check) {
  return `You are checking one behaviour in an Axhilles mascot conversation.

The required behaviour: ${check}

Reply with ONLY:
PASS
or
FAIL

PASS if the conversation clearly satisfies that behaviour. Otherwise FAIL.`;
}

function formatConvo(messages) {
  return messages
    .map((m) => (m.role === "assistant" ? "Mascot" : "Visitor") + ": " + m.content)
    .join("\n\n");
}

async function complete({ system, messages, maxTokens = 512 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Anthropic " + res.status + ": " + JSON.stringify(data).slice(0, 400));
  }
  return (data.content || []).map((c) => c.text || "").join("").trim();
}

function parseLabel(raw, allowed) {
  const token = String(raw || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    .replace(/[^a-z_]/g, "");
  if (allowed.includes(token)) return token;
  for (const label of allowed) {
    if (String(raw || "").toLowerCase().includes(label)) return label;
  }
  return "none_given";
}

async function runCase(system, testCase) {
  const convo = [];
  for (const userMsg of testCase.messages) {
    convo.push({ role: "user", content: userMsg });
    const reply = await complete({
      system,
      messages: convo,
      maxTokens: 400,
    });
    convo.push({ role: "assistant", content: reply });
  }

  const verdictRaw = await complete({
    system: CLASSIFY_SYSTEM,
    messages: [{ role: "user", content: formatConvo(convo) }],
    maxTokens: 40,
  });
  const verdict = parseLabel(verdictRaw, ["good_fit", "partly", "not_ai", "none_given"]);
  const verdictPass = verdict === testCase.expected;

  let behaviour = null;
  if (testCase.behaviour_check) {
    const behaviourRaw = await complete({
      system: behaviourSystem(testCase.behaviour_check),
      messages: [{ role: "user", content: formatConvo(convo) }],
      maxTokens: 20,
    });
    const pass = /^\s*pass\b/i.test(behaviourRaw);
    behaviour = {
      check: testCase.behaviour_check,
      result: pass ? "pass" : "fail",
      raw: behaviourRaw,
    };
  }

  return {
    id: testCase.id,
    expected: testCase.expected,
    verdict,
    verdictPass,
    behaviour,
    lastReply: convo[convo.length - 1] ? convo[convo.length - 1].content : "",
  };
}

async function main() {
  const system = fillMascotPrompt(MASCOT_SYSTEM_PROMPT);
  const results = [];
  for (const testCase of VERDICT_TEST_CASES) {
    process.stdout.write(testCase.id + " … ");
    try {
      const result = await runCase(system, testCase);
      results.push(result);
      const bits = [
        result.verdictPass ? "PASS" : "FAIL",
        `verdict ${result.verdict} (expected ${result.expected})`,
      ];
      if (result.behaviour) bits.push(`behaviour ${result.behaviour.result.toUpperCase()}`);
      console.log(bits.join(" · "));
      if (!result.verdictPass || (result.behaviour && result.behaviour.result !== "pass")) {
        console.log("  last: " + result.lastReply.replace(/\s+/g, " ").slice(0, 220));
      }
    } catch (err) {
      results.push({ id: testCase.id, error: err.message, verdictPass: false });
      console.log("ERROR " + err.message);
    }
  }

  const verdictFails = results.filter((r) => !r.verdictPass).length;
  const behaviourFails = results.filter((r) => r.behaviour && r.behaviour.result !== "pass").length;
  const errors = results.filter((r) => r.error).length;
  console.log("");
  console.log(
    `Summary: ${results.length - verdictFails}/${results.length} verdicts passed, ${behaviourFails} behaviour fail(s), ${errors} error(s).`
  );
  process.exit(verdictFails || behaviourFails || errors ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
