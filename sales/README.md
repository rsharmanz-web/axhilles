# Axhilles sales playbook

How we find, call, rank and follow up on leads.

Written for one seller (Rahul) running outbound alongside delivery. Everything here assumes
limited hours, no SDR, and a founder whose time is the most expensive input in the system.

---

## The four documents

| Step | Document | The question it answers |
|---|---|---|
| **Identify** | [`1-identify.md`](1-identify.md) | Who do we call, and where does the list come from? |
| **Contact** | [`2-contact.md`](2-contact.md) | What happens on the phone, word for word? |
| **Rank** | [`3-rank.md`](3-rank.md) | Which of these leads deserves the next hour? |
| **Follow up** | [`4-follow-up.md`](4-follow-up.md) | What happens on day 2, day 9, and week 6? |

Plus [`pipeline-tracker.csv`](pipeline-tracker.csv) — the column set to run it all in, before a CRM is
worth paying for.

---

## The strategy in one page

**What we sell is a judgement call, not a product.** Nobody buys "redesign how your business
works for an AI world" off a cold call. What they buy off a cold call is *thirty minutes to talk
about a problem they already have*. Discovery is the only thing outbound is allowed to ask for.
Every script, score and follow-up in these documents optimises for that single conversion.

**Cold calling is the third-best channel, and we still do it.** The order of yield is:

1. **Partner channel** — Baker Tilly partners, and other accounting/legal firms who can introduce
   us to twenty clients each. One partner relationship is worth a hundred dials.
2. **Warm network** — Xero alumni, ANZ / Sky TV / Les Mills contacts, the global associate network,
   anyone who already knows the work.
3. **Cold outbound** — everyone else, dialled into a list we built on purpose.

Cold calling earns its place for three reasons: it is the only channel where we control the volume,
it is how we test a new vertical without waiting for an introduction, and the objections we collect
on the phone are the fastest market research available. Treat the call log as a research instrument
as much as a pipeline instrument.

**Never cold-call a stranger cold.** Every dial is preceded by a light touch — a LinkedIn profile
view, a short email, a comment on something they posted — within the previous 48 hours. The call
then opens with a reason that already exists in their world. This is the single biggest lever on
connect quality, and it costs minutes, not money.

**Sell the cheap thing first, on purpose.** *Building a habit* at $750 +GST per head sits under
most discretionary spend thresholds, needs one decision maker, and produces a Week 4 showcase where
the client presents our value back to their own leadership. It is the best beachhead we have.
*Baseline to Roadmap* and *Alpha Prototype* are the expansion, not the entry — unless a leadership
sponsor surfaces on the call, in which case go straight there.

**Two motions, different physics.** Do not run one cadence over both.

| | Capability motion | Strategy motion |
|---|---|---|
| Lead offer | Building a habit | Baseline to Roadmap → Alpha Prototype |
| Buyer | Practice owner, team lead, department head | MD / managing partner / board |
| Decision | One person, discretionary spend | Sponsor + budget + competing priorities |
| Cycle | Days to weeks | Weeks to months |
| Cold-call viability | High | Low — needs a partner intro or a trigger event |

**Disqualify fast and say why.** Our delivery capacity is the constraint, so a lead that will never
buy is more expensive than a lead that says no quickly. Every dead lead gets a reason code
(see [`3-rank.md`](3-rank.md)), because the pattern in those codes is what tells us which lane to
stop dialling.

---

## Pipeline maths

These are starting assumptions, not findings. Replace each one with your own actuals after the
first 200 dials — the model is only useful once it is yours.

| Stage | Assumed rate | Note |
|---|---|---|
| Dial → decision maker on the phone | 18% | With a mobile number and a pre-touch. Landline-only lists run nearer 8%. |
| Connect → real conversation (30 sec granted) | 60% | Permission opener does most of the work here. |
| Conversation → Discovery booked | 15% | Higher on a named-trigger call, lower on a generic one. |
| Discovery booked → Discovery held | 80% | Confirmation sequence is what protects this number. |
| Discovery held → proposal or scoped next step | 50% | |
| Proposal → won (Habit) | 35% | Low price, single buyer. |
| Proposal → won (Alpha / Baseline) | 25% | More stakeholders. |

Which means **roughly 100 cold dials produces 1.6 Discoveries booked and about 0.2 wins.** Partner
and warm-network touches convert five to ten times better on the same effort. Read that as: cold
volume keeps the top of the funnel alive while the partner channel pays the bills.

**Weekly targets at founder capacity:**

| Activity | Weekly target | Time |
|---|---|---|
| New accounts researched and added to the list | 25 | 60 min |
| Cold dials | 60 | 2 × 90 min power hours |
| Partner / warm touches | 10 | 45 min |
| Follow-up touches on live leads | 25 | 60 min |
| **Discoveries held** | **3** | 3 × 45 min incl. prep |

That lands near 2 wins a month at the blended rates above, weighted toward Habit cohorts. If the
target is materially higher than that, the answer is more partner relationships, not more dials —
the dialling ceiling for one person who also delivers the work is about 60 to 80 calls a week.

---

## Operating rhythm

Outbound dies when it is "whenever there's time". Put it in the calendar as recurring blocks.

| When | Block | What happens |
|---|---|---|
| Mon, 60 min | **List build** | Research 25 new accounts, find mobiles, log triggers, pre-touch tomorrow's call list. |
| Tue, 90 min | **Power hour** | 30 dials. No email, no Slack. Log every outcome as you go. |
| Wed, 60 min | **Follow-up** | Work the cadences due today. Send the assets you promised. |
| Thu, 90 min | **Power hour** | 30 dials. Different segment from Tuesday, so the day compares. |
| Fri, 45 min | **Pipeline review** | Re-score everything touched this week, prune the dead, pick next week's A-list. |
| Monthly, 60 min | **Post-mortem** | Conversion by lane and segment, objection tally, script edits, kill or double a vertical. |

Two rules that make the blocks survive contact with delivery work:

- **Power hours are immovable.** A client reschedule does not get to eat them; delivery is the thing
  outbound exists to replace six months from now.
- **The list is built before the block, never during it.** Researching mid-block is how a 30-dial
  hour becomes an 8-dial hour.

---

## Metrics that matter

Track the leading numbers weekly, the lagging ones monthly. The leading ones are the only ones you
can do anything about on a Tuesday.

**Leading:** dials, connect rate, conversations, Discoveries booked, touches on live leads,
new accounts added.

**Lagging:** Discovery held rate, Discovery → proposal, proposal → won, average deal size,
days from first touch to won, revenue by lane (partner / warm / cold), disqualification reason mix.

**The two diagnostics worth watching closely:**

- *Connect rate below 10%* is a data problem, not a calling problem. Go find mobile numbers.
- *Conversations high, bookings low* is a script problem. The ask is probably too big, or the
  opener is pitching instead of asking permission.

---

## The tracker

Import [`pipeline-tracker.csv`](pipeline-tracker.csv) into Google Sheets, delete the five example
rows, and keep the columns. They group into six blocks:

| Block | Columns | Filled in by |
|---|---|---|
| Account | `company`, `vertical`, `headcount`, `city`, `lane` | List build ([`1-identify.md`](1-identify.md)) |
| Contact | `contact_name`, `title`, `mobile`, `email`, `source` | List build |
| Why now | `trigger`, `trigger_date`, `personal_hook` | List build |
| Score | `fit`, `pain`, `timing`, `access`, `score`, `tier` | After each interaction ([`3-rank.md`](3-rank.md)) |
| Motion | `offer`, `stage`, `cadence`, `touches`, `last_touch_date`, `last_touch_channel` | Every call and touch |
| What happens next | `their_words`, `next_action`, `next_action_date`, `dq_reason`, `relook_date`, `notes` | Every call and touch |

Two columns do the real work. **`their_words`** is their verbatim description of the problem, and it
is what makes every later follow-up sound like a conversation instead of a sequence. And
**`next_action` / `next_action_date`** must never be blank on a live lead — the Wednesday follow-up
block is just a filter on that date.

Three saved views are enough to run the week: *due today* (`next_action_date` ≤ today), *tier A and B
live* (sorted by score), and *lane* (to compare partner, warm and cold conversion honestly).

## Tooling

Start with what costs nothing and graduate only when volume forces it.

| Need | Now | Graduate to |
|---|---|---|
| Lead list + activity log | `pipeline-tracker.csv` in Google Sheets | Attio, Pipedrive or HubSpot free, at ~200 live leads |
| Booking | Calendly (`calendly.com/r-sharma-nz/30min`) | Same, plus routing per offer |
| Research | LinkedIn Sales Navigator, NZBN, Companies Office | Same |
| Call recording | Phone recorder, announced on every call | Dialer with transcription |
| Sequences | Calendar reminders off the tracker | Sequencer inside the CRM |

## Assets we already have

The site is the sales collateral library. Know what to send and when.

| Asset | Use it for |
|---|---|
| Free Discovery — `calendly.com/r-sharma-nz/30min` | The only ask outbound makes |
| Offer one-pagers — `/offers/building-a-habit.html`, `/offers/alpha-prototype.html`, `/offers/baseline-to-roadmap.html` | The "send me something" follow-up |
| Articles — `/readings/` | Nurture touches and credibility with sceptics |
| Chax — `/chat/` | A low-commitment ask for someone who will not book yet; the transcript arrives by email as a pre-qualified lead |
| Partner deck — `/pitch/` | Partner-channel conversations, never a first cold call |
| Spine boards — `/spine/audit/`, `/spine/finance/` | Proof of workflow-level thinking with accounting and finance buyers |
| Contact card — `/rahul-sharma.vcf` | Post-call, so the next call shows up as a name |

**Known gaps to close:** no case-study one-pager with a named outcome, no two-minute showcase video
from a Habit cohort, and the homepage still needs the Proof of Concept → Alpha Prototype rename.
The case study is the highest-value gap — it is the asset cold follow-ups most want.

---

## Getting started

In order. Do not start dialling before step 4 is done, because the first thirty calls set the tone
for how you feel about the whole channel.

1. **Set up the tracker.** Import the CSV, delete the examples, add the three saved views.
2. **Build the first 50 accounts**, one vertical only — accounting and audit practices in Auckland.
   Mobile numbers and a trigger on at least half of them.
3. **Work lanes 1 and 2 first.** Every Baker Tilly partner, and the whole warm list. These produce
   the early proof that makes cold calling bearable.
4. **Rehearse the opener out loud** twenty times, and record yourself once. It will be worse than you
   think and better by the twentieth.
5. **Put the five calendar blocks in**, recurring, for the next quarter.
6. **Dial 60 numbers before changing anything.** One script, one vertical, one opener. Below that
   volume you are reacting to noise.
7. **After 200 dials, replace the assumptions** in the pipeline maths above with your own numbers,
   and rewrite whichever objection came up most.

The first month is about learning what the market says back, not about revenue. The number to protect
is dials made, because it is the only one entirely within your control.
