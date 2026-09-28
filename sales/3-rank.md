# 3. Rank

Which lead gets the next hour.

Ranking exists to answer one question every Friday afternoon: *of everything in the pipeline, what do
I work on Monday?* A score that does not change what you do next week is decoration.

---

## The model

Four dimensions, 100 points. Score in that order — fit first, because a great signal from a bad-fit
firm is still a bad lead.

| Dimension | Points | The question |
|---|---|---|
| **Fit** | 40 | Should we be selling to this firm at all? |
| **Pain** | 25 | Is there a named, sized problem? |
| **Timing** | 20 | Is something forcing a decision now? |
| **Access** | 15 | Can we reach the person who can say yes? |

### Fit — 40 points

| Criterion | Points |
|---|---|
| Target vertical (accounting/audit, legal, insurance, advice, engineering, agency) | 10 |
| Adjacent service business | 5 |
| Headcount 20–250 | 10 |
| Headcount 10–19 or 250–500 | 4 |
| Partner or owner-operated structure | 8 |
| NZ or AU metro, our timezone | 6 |
| Knowledge work with repeatable, describable workflows | 6 |
| **Any anti-ICP trait present** (needs backend build, procurement-led, wants a deck only, under 10 people) | **cap total at 25** |

### Pain — 25 points

| Criterion | Points |
|---|---|
| A specific workflow named by them, unprompted | 10 |
| Hours per week quantified | 6 |
| They articulated a cost — money, attrition, turned-away work, risk | 5 |
| Named people who feel it | 4 |

Zero if the best they offered was "we should probably do something with AI". That is curiosity, and
curiosity belongs in nurture.

### Timing — 20 points

| Criterion | Points |
|---|---|
| Strong trigger event in the last 90 days (see [`1-identify.md`](1-identify.md)) | 8 |
| They stated a timeframe — "before year end", "this quarter" | 6 |
| Budget exists or the spend is discretionary to them | 4 |
| An external deadline is pushing — regulatory, audit, migration, board paper | 2 |

### Access — 15 points

| Criterion | Points |
|---|---|
| Spoke to the economic buyer directly | 6 |
| Warm intro or partner endorsement in play | 5 |
| An internal champion who will carry it | 4 |

---

## Tiers and what they earn

| Tier | Score | Treatment | Cadence | Likely offer |
|---|---|---|---|---|
| **A** | 75–100 | Discovery inside 5 working days. Custom pre-read. Research the firm properly. | Full 12-touch ([Cadence A](4-follow-up.md)) | Baseline to Roadmap, or Alpha if the workflow is already scoped |
| **B** | 50–74 | Discovery inside 2 weeks. Standard pre-read. | Cadence A, trimmed to 8 touches | Building a habit as the beachhead, expand later |
| **C** | 30–49 | No chasing. Nurture and wait for a trigger. | [Cadence F](4-follow-up.md), monthly | Habit for one person, or Chax and the article list |
| **D** | 0–29 | Disqualify with a reason code. | None. Re-look date only | — |

**Ceilings that override the score:**

- **No reachable buyer** caps the lead at C, whatever the firmographics say.
- **An anti-ICP trait** caps at 25, which means D. A perfect-looking firm that needs a backend build
  is not a lead; it is a referral to someone else.
- **A partner-sourced introduction** starts at B minimum, because the trust transfer does the work
  that twelve cold touches cannot.

---

## Scoring from a Chax conversation

Website leads arrive already qualified — `lib/lead-summary-prompt.js` extracts task, hours per week,
team scope, business type, a fit verdict, concerns and tone from the transcript, and `api/lead.js`
emails it through. Map it straight onto the model instead of re-qualifying from scratch.

| Chax summary field | Feeds | How |
|---|---|---|
| `task` | Pain | Specific named workflow → the full 10 |
| `hours_per_week` | Pain | Present and quantified → 6 |
| `team_scope` | Fit + Access | "whole business" raises Access; "just them" points at Habit for one |
| `business_type` | Fit | Score the vertical and structure from it |
| `verdict` | Gate | `good_fit` → score normally. `partly` → cap at B. `not_ai` → D with reason `not-ai-solvable`. `none_given` → treat as Timing 0 |
| `visitor_concerns` | Timing | Security and confidentiality worries are a live evaluation, not a blocker — add the Timing deadline points |
| `tone` | Treatment | `keen` or `stressed` → call within 24 hours. `sceptical` → lead with `/readings/`, never with price |
| `call_prep` | — | Use as-is for the Discovery agenda |

An inbound Chax lead who filled the form has already spent ten minutes on us voluntarily. Treat the
score as a floor, and call the same day where the tone supports it.

---

## Offer routing

Score decides effort. This decides what you actually propose.

| What they said | Offer | Why |
|---|---|---|
| "My people have the tools and nothing's changed" | **Building a habit** | Adoption problem, not a strategy problem |
| "One or two of us want to get properly good at this" | **Building a habit**, 1–4 people | Under the discretionary threshold |
| "We've got 5+ people who need to get moving" | **Building a habit** with the 20% cohort discount | Better economics for both sides |
| "This specific process is killing us" | **Alpha Prototype** | Scoped workflow, testable in two weeks |
| "We want to know if this is even worth doing" | **Alpha Prototype** | The go/no-go decision is the deliverable |
| "We should do something with AI but don't know where to start" | **Baseline to Roadmap** | No map, so nothing can be sequenced |
| "Every department is off doing their own pilot" | **Baseline to Roadmap** | The map is what stops random pilots |
| "The board keeps asking what our position is" | **Board advisory**, then Baseline | Governance question first |
| "We need it wired into our practice management system" | **Referral out** | Backend build is explicitly excluded |

**When two offers fit, propose the smaller one.** A $750 yes that becomes a showcase in four weeks
beats a $12,000 maybe that dies in a partner meeting.

---

## Disqualification reason codes

Use exactly these. The monthly tally is what tells you which lane to stop dialling.

| Code | Means |
|---|---|
| `too-small` | Under headcount and no individual buyer |
| `needs-backend` | Wants integration or production build |
| `no-sponsor` | Nobody with authority will engage |
| `not-ai-solvable` | Process, pricing or staffing problem |
| `free-advice` | Wants consulting without paying |
| `procurement` | RFP, panel or vendor-onboarding gauntlet |
| `vendor-waiting` | Deferring to their software vendor's roadmap |
| `timing-hard` | Real but distant — set a re-look date |
| `no-contact` | Full cadence exhausted, never reached |
| `competitor` | Already committed to someone else |
| `do-not-contact` | Asked not to be contacted. Permanent, no re-look |

`timing-hard` and `vendor-waiting` get a re-look date and go to nurture. Everything else is closed,
and `do-not-contact` goes on the suppression list immediately.

---

## Keeping scores honest

**Re-score after every real interaction.** A score from before the first conversation is a guess
about a stranger; a score after it is evidence.

**Decay.** Subtract 10 points from Timing after 30 days with no engagement, and again at 60. A lead
that was hot in March and silent since is not a B. Decay is what stops the pipeline inflating with
optimism.

**One weekly pass, Friday.** Re-score everything touched this week, move tiers, set next actions,
close the dead. Fifteen minutes.

**Sanity checks:**

- If more than a quarter of the pipeline is tier A, the scoring has gone soft. A is scarce by design.
- If nothing is tier A, the list is the problem, not the scoring — go back to triggers and mobiles.
- If tier A leads are not converting better than tier B, the weights are wrong. Look at which
  dimension actually predicted the wins and reweight toward it after the first ten closed deals.

---

## After Discovery: the deeper qualification

The 100-point model is for deciding who to chase. Once a Discovery has happened, five facts decide
whether a proposal is worth writing. Missing two or more means the next step is another
conversation, not a proposal.

| Fact | What good looks like |
|---|---|
| **Metric** | They named what improving this is worth — hours, dollars, risk, capacity |
| **Decision** | You know who signs, who else is consulted, and what else competes for the money |
| **Champion** | Someone other than you wants this to happen and will say so internally |
| **Constraint** | You know the real blocker — budget cycle, a sceptical partner, an IT policy, busy season |
| **Next step** | A date in both calendars, agreed on the call, not "I'll follow up" |
