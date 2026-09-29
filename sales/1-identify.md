# 1. Identify

Who we call, why they are on the list, and where the list comes from.

The quality of a cold-calling operation is decided before the first dial. A great script into a bad
list fails; an average script into a well-built list works. Spend the time here.

---

## Ideal customer profile

**The one-line version:** a professional services firm of 20 to 250 people in New Zealand or
Australia, where the person who owns how the work gets done can say yes to $5,000 without a
committee, and where the work itself is knowledge work with repeatable steps.

| Dimension | Target | Why it matters |
|---|---|---|
| **Industry** | Accounting and audit, legal, insurance broking, wealth and financial advice, engineering and architecture consultancies, property management, agencies and consultancies | Billable knowledge work with visible workflows — exactly what the Baseline map is built for |
| **Size** | 20–250 people | Under 20, there is no budget and no workflow complexity. Over 250, procurement and IT governance slow everything to a crawl |
| **Geography** | Auckland, Wellington, Christchurch, Melbourne, Sydney | Same timezone, and we can be in the room. Austin for the network, not for cold calling |
| **Structure** | Partnership or owner-operated | Partners decide fast. PE-owned and listed firms route through a transformation office |
| **Tech footprint** | Microsoft 365 or Google Workspace, a practice management system, Xero or equivalent | They already run on software, so the conversation is about workflow not infrastructure |
| **Evidence of AI curiosity** | Someone has posted, hired, attended or asked about it | We convert curiosity, not ignorance. Educating from zero on a cold call is unpaid work |
| **Buyer accessible** | Managing partner, MD, practice owner, GM Operations, COO, or a department head with a budget | If the highest reachable person is a marketing coordinator, park it |

### Who is not a fit

Say no to these on the phone. It builds more credibility than any pitch.

- **Needs backend integration or production software.** Alpha Prototype explicitly excludes backend
  build. If they need a system wired into their practice management database, we are the wrong shop.
- **Wants a firm-wide change programme** with change managers and a comms plan.
- **Under about 10 people**, unless the owner is buying Habit for themselves personally.
- **Procurement-led enterprises** — banks, insurers, government. Long cycles, panel arrangements,
  and our differentiator gets flattened by an RFP.
- **Wants a strategy deck to show the board** with no intention of building anything.
- **Fishing for free advice.** One Discovery is generous. A second "quick chat" without a scoped
  next step is a no.
- **The problem is not an AI problem.** Sometimes it is a process, pricing or staffing problem.
  Saying so is the most persuasive thing we do, and it is already built into how Chax qualifies.

---

## Three lanes, three lists

Keep these as separate views in the tracker. They have different scripts, different cadences and
different conversion rates, and blending them hides which one is working.

### Lane 1 — Partner channel (highest yield)

**Who:** Baker Tilly partners first, then partners at other mid-tier accounting and legal firms,
plus fractional CFOs, business brokers and bookkeeping networks.

**The ask is different.** You are not selling them a service. You are asking for fifteen minutes to
show them something they can take to their clients — an offer that makes them look current without
putting their name at risk. The partner deck at `/pitch/` exists for this conversation.

**What makes a partner activate:** a one-pager with their logo alongside ours, a talk track short
enough to remember, and a first client who does not blow up. Give them one client, over-deliver, and
let the Week 4 showcase do the rest.

**Target:** 10 partner touches a week. One activated partner per month is a good month.

### Lane 2 — Warm network

**Who:** Xero alumni (especially product, design and data people who have since become heads of
function elsewhere), ANZ / Sky TV / Les Mills contacts, the global associate network, LinkedIn first
degree, past Discovery calls that went nowhere, everyone who has ever said "we should catch up".

**The ask:** a genuine catch-up, then "who in your network is getting asked about AI and has no idea
what to say?" Referrals out of this lane arrive pre-trusted and skip most of the ranking model.

**Target:** work through the entire first-degree list once a quarter, roughly 15 a week.

### Lane 3 — Cold outbound

**Who:** everything the ICP allows that is not already in lanes 1 and 2, worked one vertical at a
time so the script compounds. Suggested order: **accounting and audit practices** (strongest proof,
Baker Tilly adjacency, and the spine boards already speak their language), then **insurance broking**,
then **law firms**, then **engineering and architecture**.

**Target:** 60 dials a week across 25 fresh accounts plus follow-ups.

---

## Where the names come from

Free and semi-free sources, roughly in order of value per hour spent.

| Source | What you get | How to work it |
|---|---|---|
| **Baker Tilly network** | Partner names, and the client base behind them | Directory, plus ask every partner who else to talk to |
| **LinkedIn Sales Navigator** | Titles, headcount, tenure, recent posts | Saved searches by industry + headcount + geography; alerts on job changes |
| **NZBN / Companies Office** | Directors, shareholders, registered address, incorporation date | Confirm who actually owns the firm before deciding who to call |
| **Industry bodies** | Member firm lists | CA ANZ, NZ Law Society, IBANZ, Financial Advice NZ, ACENZ, Comms Council |
| **Job ads (Seek, Trade Me Jobs)** | The strongest public buying signal there is | Search "AI", "automation", "innovation", "transformation". A firm hiring for it has budget and a sponsor |
| **Conference and webinar lists** | Self-selected AI-curious audiences | Xero Roadshow, CA ANZ events, chamber and EMA sessions, local AI meetups |
| **Awards and rankings** | Growing firms with something to prove | Deloitte Fast 50, NZ Law Awards, industry "firm of the year" lists |
| **Podcast and panel guests** | People already talking publicly about AI | They will take the call, because talking is what they do |
| **Our own inbound** | The warmest cold there is | Chax transcripts arriving by email, `/readings/` traffic, Vercel analytics, `.vcf` downloads |

**On buying data:** skip it until the free sources are exhausted. Purchased lists have stale mobiles
and no trigger context, which is the only thing that makes a cold call work.

---

## Trigger events

A named trigger is worth more than any amount of firmographic fit, because it gives the call a reason
to exist today. Log the trigger and its date on every account — the [ranking model](3-rank.md) scores
it, and the [opener](2-contact.md) uses it verbatim.

**Strong triggers**

- Hiring for an AI, automation, innovation or transformation role
- A partner or MD posting or speaking publicly about AI
- New managing partner, MD or practice leader in the last six months
- Merger, acquisition or office opening — two ways of working to reconcile
- Publicly stated capacity pain: hiring freeze, turning work away, recruitment difficulty
- Software migration underway — practice management, ERP, audit platform
- A competitor in their vertical announcing something AI-shaped
- Regulatory or quality pressure — audit file reviews, AML obligations, compliance deadlines

**Weak triggers** (fine as colour on the call, not a reason to prioritise)

- Generic "digital transformation" language on their website
- An AI page with no named person behind it
- Long tenure with no change signal

---

## What to capture per account

Nine fields. Enough to make the call specific, few enough that research stays under four minutes
per account. This is the left-hand half of [`pipeline-tracker.csv`](pipeline-tracker.csv).

| Field | Example |
|---|---|
| Company | Hayes & Co Chartered Accountants |
| Vertical | Accounting / audit |
| Headcount | 45 |
| City | Auckland |
| Contact name and title | Sarah Hayes, Managing Partner |
| Direct line or mobile | 021 … |
| Trigger and date | Advertising "Automation Lead", 12 Sep |
| Personal hook | Spoke on the CA ANZ practice-of-the-future panel |
| Lane | Cold / partner / warm |

**Get the mobile.** It is the difference between an 8% and an 18% connect rate. Look in email
signatures, their own website's team page, the industry body directory, conference speaker bios, and
the contact page of the firm's PDF newsletters.

---

## Working the list

**Batch by vertical and by trigger, never alphabetically.** Thirty calls into accounting practices
that are all hiring for automation means the thirtieth call is dramatically better than the first,
because you are refining one message against one audience. Alphabetical dialling teaches you nothing.

**Pre-touch 24 to 48 hours ahead.** View the LinkedIn profile, or send a three-line email, or comment
on something they wrote. Then the call opens with "I emailed you yesterday about…" instead of nothing.

**Time it properly.** Best windows are 8:00–9:00 before the day closes in, 11:30–12:30, and
16:00–17:30. Avoid Monday mornings and Friday afternoons. Avoid the deadlines that own your buyers'
attention: 31 March year-end and 7 July tax returns in New Zealand, 30 June in Australia, and audit
busy season for the audit firms. Call them the week after instead, when the pain is freshest.

**Refresh the list monthly.** Anything untouched for 90 days with no engagement goes to nurture.
Anything disqualified gets a reason code and a re-look date.

---

## Compliance

Not legal advice — confirm the specifics with your own adviser before scaling volume. The principles
below are what to design the process around.

**New Zealand.** The Privacy Act 2020 governs collecting and holding contact details: collect
lawfully from a legitimate source, be straight about where you got someone's details when asked, keep
the data accurate, and honour requests for access, correction or deletion. The Unsolicited
Electronic Messages Act 2007 covers email and SMS — you need consent, which can be inferred where a
business address is conspicuously published in connection with that person's role, and every message
needs accurate sender details and a working unsubscribe. Voice calls sit outside that Act, but keep
an internal do-not-call list and honour it permanently and immediately.

**Australia.** The Privacy Act and the Spam Act 2003 apply, and the Do Not Call Register regime
reaches beyond consumer numbers — wash Australian calling lists and check the current rules before
dialling at volume.

**Call recording.** If you record for review or for the summary, say so at the start of the call,
every time. It costs one sentence and removes all ambiguity across both countries.

**Practical rules:** one internal suppression list that every lane checks before dialling; record
the source of every contact detail in the tracker; delete on request without arguing; and never use a
client's confidential information as a talking point with a competitor.
