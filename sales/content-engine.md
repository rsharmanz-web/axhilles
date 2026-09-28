# The content engine

Where the articles live, how they travel from LinkedIn to the site, and what order to publish them in.

Companion to the [outbound playbook](README.md). Outbound creates conversations from a standing start;
content makes those conversations easier and gives every follow-up something new to carry.

---

## First, what these articles are for

This decides everything else, so be honest about it. The articles are not a media product and the
metric is not audience size. Their job, in order:

1. **Make a cold follow-up land.** Cadence A needs a day-5 and a day-9 touch that carries new value.
   An article is that touch.
2. **Convert sceptics.** The buyers we want are tired of AI hype. A piece of writing that says
   something true and slightly unwelcome does more than any one-pager.
3. **Give a call a reason to exist.** "I wrote something about the thing you mentioned" is a
   legitimate reason to ring someone in week 6.
4. **Produce inbound that is already qualified.** A managing partner who reads 1,200 words and then
   talks to Chax is a better lead than a form fill.
5. **Compound.** Five articles is a body of work. It is the difference between a consultancy and a
   person with opinions.

Read that list again and notice what is missing: subscriber growth. Subscriptions are a nice
by-product, not the point. **A platform that gets you 500 subscribers but makes a link awkward to
send to a named prospect is the wrong platform for this job.**

---

## The three real options

| | **1. Substack only** | **2. Own site only** | **3. Site canonical, social for distribution** |
|---|---|---|---|
| Build needed | None | Article template + index | Article template + index |
| Email list | Built in | Nothing exists — needs to be added | Use LinkedIn newsletter or Substack as the list layer |
| Brand | Substack's template | Yours | Yours where it counts |
| SEO benefit | Accrues to Substack (or your subdomain) | Accrues to `axhilles.com` | Accrues to `axhilles.com` |
| Link you send a prospect | Has a subscribe wall | Has your CTA | Has your CTA |
| Discovery / network effect | Some, but not with NZ partners | None | LinkedIn, where your buyers actually are |
| Ongoing effort | Lowest | Medium | Medium, plus cross-posting |

### Substack — the honest case

**For it:** zero build. Email delivery, list management, unsubscribe handling and archive all solved
on day one, which matters because none of that exists on the site today. Writing-first editor. RSS
and comments for free. Custom domain supported for a one-off fee, so it can live at something like
`read.axhilles.com`. Free until you charge. Notes and recommendations give some organic reach.

**Against it, specifically for Axhilles:**

- **The network effect does not reach your buyers.** Substack's discovery engine works for US
  tech-adjacent and consumer-interest writing. Auckland and Melbourne managing partners are not
  browsing Substack. Take away the discovery benefit and what is left is an email tool.
- **Subscribe walls are friction in a sales conversation.** The core use is *sending a link to a
  named prospect mid-cadence.* Landing them on a page that asks for their email before they read is
  the opposite of what that touch is for.
- **You lose control of the next step.** No Chax, no Discovery button where you want it, no link
  through to the matching one-pager. The article ends in "Subscribe" rather than anything commercial.
- **The design is not yours.** This site has a genuinely distinctive look — alabaster, espresso and
  cobalt, editorial typography, the schematic boxes. Every Substack looks like every other Substack.
  For a firm selling design judgement, that is a quiet credibility cost.
- **SEO goes to the wrong place.** You want `axhilles.com` ranking for AI advisory in New Zealand.
  Articles are the main thing that would earn that, and on Substack they earn it elsewhere.

### Own site — the honest case

**For it:** brand consistency; SEO compounds on the domain that sells; total control of the next step,
which is the whole point; analytics already wired through Vercel; and the ability to do things a
Substack post cannot. That last one is underrated — you sell AI capability, and on your own page you
can embed a working thing. The `/spine/audit/` and `/spine/finance/` boards are exactly the kind of
artefact that proves more than prose does, and they only work on your own site.

**Against it:**

- **The template does not exist yet.** `/readings/` is a list of *other people's* links, not a
  publishing system. You need an article page pattern and an index. Given `offers/one-pager.css`
  already establishes a long-form reading style, this is a small, contained piece of work — closer to
  adapting an existing pattern than building something new.
- **There is nowhere to put an email list.** Worth being blunt about: the repo has no database.
  `api/lead.js` emails leads through Resend and nothing is stored. A subscribe form on the site means
  adding storage, double opt-in, unsubscribe handling and the UEM Act obligations covered in
  [`1-identify.md`](1-identify.md). That is a real project, and it is the single best argument for
  keeping the *list* somewhere else even if the *articles* live here.
- **No discovery.** Every reader has to be driven there by you.

---

## Recommendation

**Publish canonically on the site. Distribute on LinkedIn. Do not open a Substack yet.**

Reasoning: the articles' primary job is to be sent to specific people and to convert them, which
demands your CTAs and your brand. LinkedIn already holds the audience you are cold-calling, so it is
the distribution layer — and a LinkedIn newsletter gives you the email-style push with no build at
all, notifying your network on the first edition.

Revisit Substack only when one of these becomes true:

- You want a **portable** list you own, independent of LinkedIn's rules.
- Article traffic is consistently strong and readers are asking for email.
- You decide to charge for something.

If that day comes, the move is cheap: keep the site as canonical, and mirror into Substack with the
canonical URL pointed back at `axhilles.com` where the platform allows it. Publishing site-first and
letting it get indexed before mirroring handles the duplicate-content question either way.

### Two decisions that are now made

Both of these were blockers. Both are built — see the repo `README.md` for the publishing steps.

**1. The nav collision.** "Articles" used to point at a curated list of other people's writing, which
would be confusing the moment you published your own. Resolved by keeping the `/readings/` URL, since
it is live and linked from the mascot prompt, and relabelling it **Reading list**. Your own writing
now owns **Articles** at `/articles/`, and the two pages cross-link.

`READING_LIST_LINK` in `lib/placeholders.js` deliberately still points at `/readings/`: the mascot
uses it to recommend Ben Evans' presentation and other third-party pieces, so it should stay on the
curated list rather than follow the nav label.

**2. Link previews.** There were no Open Graph or Twitter card tags anywhere on the site, so a
LinkedIn post linking to `axhilles.com` rendered a bare preview — and the image is a large part of
whether anyone clicks. Now on every public page, with a generated 1200×630 card per article carrying
the title and its number in the series, so the preview and the page a reader lands on match.

`canonical` tags, `sitemap.xml`, `robots.txt` and an RSS feed came in at the same time. The feed
means anyone can follow the writing without you having to own a list.

---

## The LinkedIn → site flow

The mistake to avoid is treating the LinkedIn post as an advert for the article. It is not. **The post
has to be worth reading on its own**, or it gets no reach and the link is irrelevant.

### The post

1. **Hook in the first two lines.** That is all anyone sees before "see more", and it decides
   everything. A specific claim or an uncomfortable number, never "I've been thinking about AI lately".
2. **150 to 250 words carrying one idea to a real conclusion.** Give away the argument. A reader who
   finishes satisfied still clicks through for the detail; a reader who feels teased does not.
3. **Formatted for a phone.** Short lines, generous breaks, no hashtag soup. Two or three hashtags at
   most, and only ones a human would follow.
4. **No external link in the post body.** Posts with outbound links get visibly less reach — treat
   that as a working assumption and verify it on your own posts. Put the link in **your own first
   comment**, posted immediately, and say so in the post: "full version in the comments". Ignore the
   folklore about editing the link in later; it is unproven, and editing a post can itself cost reach.
5. **End with a question you actually want answered.** Comments are the only engagement that
   meaningfully compounds, and the answers tell you what the next article should be.

### The link

- **Tag it.** `?utm_source=linkedin&utm_medium=social&utm_campaign=<series>&utm_content=post-2` so
  Vercel analytics can tell you which of the five did the work.
- **Point at the article, never the homepage.** Reading intent is specific; do not make them hunt.

### The page

One page, one job. The CTA hierarchy matters more than its wording:

| Position | Ask | Why there |
|---|---|---|
| Mid-article, once | **Chax** — "ask the question this raised" | The best conversion target for cold article traffic. Zero commitment, and it emails you a transcript with a summary and a fit verdict. That is a qualified lead from an anonymous reader |
| End of article | **Discovery booking** | For the reader who is already convinced |
| End of article | The matching **offer one-pager** | For the reader who wants to know what it costs before talking to anyone |
| Footer | Next and previous in the series | Keeps a good reader reading, which is how one article becomes five |

Resist putting a Discovery button at the top. Someone who has read forty words is not booking a call,
and asking makes the page feel like a brochure.

### The part everyone misses

**The clicks are not the conversion. The engagers are.** Anyone from an ICP firm who comments on or
reacts to a post has just raised their hand in public, and that is the best trigger event available —
better than a job ad, and free.

The loop, which is where this connects to the playbook:

1. Post goes out. Two days later, go through everyone who engaged.
2. Anyone matching the [ICP](1-identify.md) gets added to
   [`pipeline-tracker.csv`](pipeline-tracker.csv), lane `warm`, with the trigger written as
   "engaged with post on X, 12 Oct".
3. Connection request with no pitch. Reply to their comment properly first.
4. Call two or three days later, opening on their comment: *"You said something about juniors losing
   the grunt work — that's the bit I keep hearing."* That is not a cold call any more.
5. Everyone else who engaged goes to nurture ([Cadence F](4-follow-up.md)).

Run this loop on all five posts and the series produces a list of pre-warmed, self-identified leads.
That is worth more than the traffic.

### Then reuse it three more times

Write once, use four times: the LinkedIn post, the site article, a three-line email for the
[Cadence A](4-follow-up.md) day-5 touch, and a line in the monthly nurture email. Each article should
be doing work in the pipeline for months, not for the 48 hours it trends.

---

## The series of five: drip, and here is the shape

**Yes, drip it. One a week, five weeks, same day and time.** Not all at once, and not fortnightly.

**Why drip:**

- **You get to learn.** Post 1's response tells you how to sharpen 2 through 5. Publishing everything
  at once forfeits that, and on a first series the feedback is worth more than the reach.
- **Five appearances beat one.** Five chances to surface in the feed, five call reasons, five
  distinct "new value" touches for the cadences that require them.
- **Consistency is what builds the association.** Showing up weekly for five weeks makes you someone
  who writes about this. One burst makes you someone who wrote about this once.
- **It paces the sales loop.** The engagement loop above takes a few days per post. Five at once and
  you cannot work any of them properly.

**Why not fortnightly:** ten weeks is too long to hold a thread together, and you will lose the thread
yourself.

**Why not all at once:** the only good reason for a burst is a launch moment where the set *is* the
announcement. You do not have that, and the set is more valuable as a drip.

### One test to run first

**Can each piece be read standalone, with its own payoff and its own reason to exist?** If yes, drip
them as five articles. If they only make sense in sequence, they are chapters, not articles — in which
case publish them as one guide on the site and drip *excerpts* to LinkedIn, each linking to its
section. Do not drip chapters as if they were articles; readers arriving at chapter 3 will bounce.

**The four drafts pass this test.** Each carries its own claim, its own evidence and its own payoff:
exposure is not impact; the metering is coming whether you opt in or not; the question is what to sell
rather than how to price; and a workshop only reaches the people already building. They share a spine —
the organisation is the bottleneck, and judgement is what stays scarce — without depending on each
other. So: five articles, dripped. Not a guide.

### They are currently post-length, not article-length

Worth deciding before post 1. The drafts run 260 to 405 words. That is almost exactly the length
recommended for the LinkedIn post itself, which means if the article and the post carry the same
content there is no reason to click through, and the whole flow above collapses into "post on
LinkedIn".

Two ways out, and either is fine as long as it is chosen deliberately:

1. **Expand the articles and tighten the posts.** The post carries the argument in 200 words; the
   article adds what does not fit — a worked example from your own client work, the data behind the
   claim, the obvious objection answered. Note that the placeholders left in the drafts are exactly
   where this expansion belongs: the token-triage example, and the cricket app detail. Those are the
   paragraphs that earn the click, because they are the parts nobody else could have written.
2. **Treat them as posts and let the site be the archive.** Publish as-is, accept that click-through
   will be low, and let the article pages earn their keep through search, credibility when you send a
   link mid-cadence, and the Chax prompt — rather than through traffic from LinkedIn.

Option 1 for the two commercially pointed pieces at minimum. Option 2 is a legitimate choice for the
rest, but not by accident.

### Order them for the job, not for the logic

The instinct is to open with context and save the sharpest piece for last. Invert it. **Post 1 has to
earn the audience for 2 through 5**, so lead with the strongest, most contrarian, most specific claim
you have. The scene-setting piece, if you need one at all, goes third where a committed reader will
forgive it.

Beyond that, sequence toward the offer ladder. Lead with the pieces that map to the adoption problem,
because that is what [Building a habit](../offers/building-a-habit.html) sells against and it is the
beachhead offer. Save the business-model arguments, which point at Baseline to Roadmap, for later
pieces when readers are more invested.

**Applied to the four drafts.** The order as numbered is 1) exposure is not impact, 2) the token
economy, 3) a premium on judgement, 4) from chatting to building. Built as numbered, but one change is
worth considering:

- **Keep *AI exposure isn't the same thing as AI impact* as post 1.** It is the right opener by every
  test — contrarian, densely evidenced, and it closes by posing the question the rest of the series
  answers. Do not move it.
- **Move *From chatting to building* up to 2.** It is the most actionable of the four, the
  four-audiences framework is the most shareable thing in the set, and it maps almost line-for-line to
  Building a habit — the set-up session, the weekly check-ins, the week-four show-and-tell. Getting
  the beachhead offer in front of readers while attention is highest is worth more than saving the
  practical piece for last.
- **Then *A premium on judgement*** at 3, which is the Baker Tilly partner piece: it is about the firm's
  business model, so it points at Baseline to Roadmap and board advisory, and it wants a reader who is
  already invested.
- **Then the token economy** at 4. It is the most enjoyable and the least commercially pointed, which
  makes it a good post for an audience that already follows you.

Reordering costs two edits per file: the `axhilles:series` meta tag and the kicker above the title.

Name the series and number the posts, "(2 of 5)". It costs nothing and it makes people look for the
next one.

### Hold a sixth piece back

When the five are out, publish a consolidated version — the whole argument as a single guide, or a
one-page summary of all five. This becomes the asset you send in follow-ups and hand to Baker Tilly
partners, and it closes the biggest gap named in the [playbook](README.md): there is currently no
single document that makes the case in one place.

### The cadence in practice

| Week | LinkedIn | Site | Sales |
|---|---|---|---|
| 1 | Post 1, strongest claim | Article 1 live, canonical | Work the engagers. Article 1 enters Cadence A as the day-5 touch |
| 2 | Post 2 | Article 2, linked from 1 | Work engagers. Nurture email carries article 1 |
| 3 | Post 3 | Article 3 | Work engagers. Call anyone who engaged twice — that is a strong signal |
| 4 | Post 4 | Article 4 | Work engagers |
| 5 | Post 5 | Article 5, series index complete | Work engagers |
| 6 | Post the consolidated guide | Guide live | Guide goes to every live lead and every partner |

Best posting window for a NZ and AU professional audience is early morning local time, Tuesday to
Thursday. Pick one slot and keep it — if you are posting for Melbourne too, remember they are two to
three hours behind, so earlier in the NZ morning covers both.

---

## What to measure

Per post, in one row of a sheet:

**Reach:** impressions, comments, reactions, profile views.
**Traffic:** clicks, sessions on the article, time on page, Chax sessions started.
**Pipeline, the only one that matters:** ICP-firm engagers added to the tracker, calls that opened on a
comment, Discoveries booked attributable to the series.

Two diagnostics:

- **High impressions, no clicks** means the post is satisfying people completely. Not a failure —
  but move the link reference higher and make the article's extra value explicit.
- **Clicks but nothing after** is a page problem, not a writing problem. The CTA is in the wrong
  place, or the article ends without offering a next step.

---

## Build checklist

Done:

- [x] Article template at `articles/_template.html`, with an article layout in `articles/articles.css`
- [x] Open Graph, Twitter card and `canonical` tags on every public page
- [x] Generated 1200×630 preview card per article, titled and numbered
- [x] Series index at `/articles/` with numbered entries and prev/next links between articles
- [x] Nav collision resolved: `/readings/` relabelled Reading list, `/articles/` is our own writing
- [x] Mid-article Chax prompt and an end-of-article Discovery CTA in the template
- [x] `rss.xml`, `sitemap.xml` and `robots.txt`

- [x] Four drafts built as article pages — article 1 publish-ready, 2 to 4 held as `noindex` drafts

Still yours to do:

- [ ] Article 5
- [ ] Resolve the two placeholders: the token-triage example, and the cricket app detail
- [ ] Decide on post-length versus article-length, per above
- [ ] Settle two titles: whether "(The price of judgement)" is a series name, and whether article 3
      becomes "The billable hour's replacement isn't a pricing model"
- [ ] Add full source URLs to the citations — the drafts carried domains only
- [ ] Add your LinkedIn profile URL to `articles/index.html` where the comment marks it
- [ ] Confirm UTM parameters show up usefully in Vercel analytics before post 1
- [ ] Write the consolidated sixth piece once the five are out
