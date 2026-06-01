# Course review — fohlio-domain ("How Buildings Get Furnished", 14 lessons, EN, story mode)

**Verdict**: GO with fixes
**Findings**: 4 total — 0 critical, 0 high, 1 medium, 3 low

This is a strong, ship-ready course. Every structural, pedagogical, sourcing, and de-engineering
audit passed. The only findings are one Medium (a single de-engineering word leak) and three Low
cosmetic items. No finding blocks shipping; all four are cheap sweeps the orchestrator can batch.

The course delivers exactly what the brief demanded: the spine is the **real FF&E industry**
(real firms, real numbers, real process), Dana's project is the through-line, and Fohlio appears
only as an explicitly-labelled thin overlay. The money lessons (L7/L8) are numerically faithful to
`.context/real-money.md` line-for-line. The competitive lesson (L13) is genuinely fair — it even
names Fohlio's own weakness and flags that all comparison sources are competitor-published.

---

## Critical findings
None.

## High findings
None.

## Medium findings

- **[M1] L14: de-engineering word leak — "queryable".** Line 846, in the thin-Fohlio-overlay
  paragraph: *"A product record that links the original spec... in one place, **queryable** — is."*
  The literal term `queryable` is on `.course-state.json → rewrite.deEngineerForbidden`
  ("queryable data is an engineering requirement"). Here it is used loosely to mean "searchable in
  one place," not as an engineering requirement, so it is a soft leak rather than a spine violation
  — but it is the one place the de-engineer rule is technically broken.
  **Fix (course-lesson-writer, L14):** replace "in one place, queryable" with "in one place,
  searchable years later" (or "findable in one place"). One-word edit.
  **Owner: orchestrator** (trivial enough to patch directly without re-dispatch).

## Low / cosmetic

- **[L1] Visible bracket-callback artifacts leaked into prose (7 instances).** Editorial callback
  notes render literally in the reader's text, breaking the "warm, dry documentarian" voice:
  - L2:687 `[L1]` — "...a purchasing team *bought* them **[L1]**."
  - L8:858 `[L3 callback]` and L8:872 `[L7 callback]`
  - L9:887 `[L2 callback]` and L9:895 `[L6 callback]`
  - L12:839 `[from Lesson 8]`
  - L13:896 `[from Lesson 12]`
  These are distinct from the numeric source markers `[N]` (which all resolve correctly) and from
  the deliberate `[1, 3]` citations. They read as stage directions that escaped into the script.
  **Fix (orchestrator, sweep):** delete each bracketed callback tag, or fold it into prose
  (e.g. "...as we saw in Lesson 3, ..."). The surrounding sentences already name the lesson, so
  most can simply be deleted.

- **[L2] L1 "shake the building" idiom attributed to Beyer Brown [1] is slightly generous.**
  WebFetch of `beyerbrown.com/ffe-procurement-comprehensive-guide` confirms the page is real and
  covers FF&E movability / FF&E-vs-OS&E, but the exact "pick up the building and shake it" phrasing
  is an industry idiom not verbatim on that page. Not a fabrication — the underlying claim
  (movability test) is supported — but the idiom itself is folkloric.
  **Fix (optional, orchestrator):** soften to "people in the trade say it as..." (already close) or
  add a generic "widely-used industry idiom" note. Low priority; the src-note already disclaims that
  the case and some phrasings are illustrative.

- **[L3] Plain-language "schema" appears in body prose (2 instances).** L11:790 and L3:875 use
  "room-numbering schema" meaning a numbering *scheme/plan* — ordinary English, not a database
  schema. The literal token "schema" sits on the forbidden list, so flagging for completeness, but
  the usage is correct industry phrasing and not an engineering leak.
  **Fix (optional, orchestrator):** swap "schema" → "scheme" / "plan" in both lines to keep the
  forbidden-word grep clean. Cosmetic; no reader would misread it.

---

## Cross-lesson audits

### A1 — CSS byte-identicality (PASS)
All 14 lessons' `<style>` blocks are byte-identical, md5 `8198d7308cff69ab455d6f861382b581`
(= the declared hash `8198d730`). Zero drift. Confirmed by md5 + diff vs L1.

### A2 — Mobile @media (PASS)
Every lesson contains the `@media (max-width: 640px)` block (plus 768 and 375 breakpoints), with
`recap-grid`/`concept-grid → 1col`, `.layer-item` flex column, `.container` padding 18px. Identical
to L1 (follows from A1).

### A3 — Pedagogy minimums (PASS, all 14)
| Check | Result |
|---|---|
| Parts (h2.part-header) 5–8 | 6–8 every lesson (incl. summary). In range. |
| Top recall recap-grid (L2+) | 1 per lesson L2–L14; L1 correctly has none. N−1 prior + 1 "today". |
| Recall-boxes ≥2 (predict/explain, not "what is X") | 2 (L8: 3). All ask predict/guess/reconstruct. |
| Joke-box / character beat ≥1, names a concept | ≥1 each; jokes land on lesson concepts (e.g. L1 "3,000 chairs, 40 finishes"; L7 "they're paying for it"). |
| Inline SVG with viewBox, no fixed w/h | ≥1 per lesson, viewBox-only. L5/L8/L10 have 2. |
| Hook in first 200 words, story-mode scene | All scene-anchored in medias res (see A5). |
| Homework 2 Required + 2 Advanced, model-answers | 2 `<details class="model-answer">` per lesson; 2 Advanced each. |
| Coming-up green info-box at end | Present each lesson (L14 closes with "There is no Lesson 15"). |
| .sources-box ≥4 real items | 4–7 per lesson (L1/7/8/9/14 = 6–7). |

### A4 — Callback graph (PASS) — 1-3-7-21 spacing honoured; L14 synthesis-only
Resolving both `Lesson N` and `LN`/`[from Lesson N]` shorthand forms:

| Lesson | Expected (outline) | Found | Status |
|---|---|---|---|
| L2 | 1 | L1 | OK |
| L3 | 2,1 | L1,L2 | OK |
| L4 | 3,1 | L1,L2,L3,L5,L6 | OK |
| L5 | 4,2,1 | L1,L2,L3,L4 | OK |
| L6 | 5,3,2 | L1,L2,L3,L5,L7 | OK |
| L7 | 6,4,2 | L2,L4,L6,L8 | OK |
| L8 | 7,5,3 | L1,L3,L5,L7,L9 | OK |
| L9 | 8,2,6 | L2,L6,L8,L10 | OK |
| L10 | 9,4,6 | L1,L4,L6,L8,L9 | OK |
| L11 | 10,8,3 | L2,L3,L5,L8,L9,L10 | OK |
| L12 | 11,10,6,2 | L1,L2,L6,L8,L10,L11 | OK (all 4 present) |
| L13 | 12,9,1 | L1,L6,L8,L9,L12 | OK |
| L14 | 13,11,9,7,3,1 | **L1–L13 (every prior lesson)** | OK — synthesis-only, far exceeds ≥4 |

L14 confirmed synthesis-only: traces one chair through every actor, three property types side by
side, FF&E reserve + next PIP cycle (loop restarts), closes the arc ("the doors open... every chair
in the right finish"), no major new concepts.

### A5 — Story-mode consistency (PASS)
- **No mode drift.** No competing metaphor world introduced anywhere; story stays case-study
  narrative throughout. (Repo-wide: only the NestJS "airport" analogy exists; zero "airport"/
  "kitchen" leakage into this course — confirmed by grep.)
- **Frozen cast intact.** Dana Reyes, Priya, Marco, Helen, Tomás Vega, Greta, Reggie, Sam, Linda
  (Marsh), Brother Andersen, Grace appear with consistent roles and voice. No invented historical
  figures; real firms (HBA, Gensler, Benjamin West, R-W, Marriott, Aimbridge, Kimball, Avendra,
  Procore, etc.) named accurately to documented business models.
- **Hooks** (all scene anchors, in medias res, sensory): L1 7:14 a.m. blank spec / cold coffee;
  L2 Dana on the phone drawing the chain; L3 "the chair is already on a ship before Dana finished
  the drawings"; L5 Helen pulls the empty nightstand cell; L6 Linda arrives 8:40 a.m. with a
  clipboard; L7 Tomás slides a price list across the table; L8 Sam the owner's rep reads a budget;
  L9 Tomás answers on the second ring between showroom and jobsite; L10 three swatches that match in
  the room but differ in daylight; L11 Marco gets the PO at 4:47 p.m.; L12 Helen stops — headboard
  4 inches too tall; L14 "the doors open at 3:00 p.m." (mirrors L1's 7:14). No definition-openers,
  no exposition-dumps.
- **POV stable**: omniscient documentarian, present tense, warm and dry, throughout.
- **No anachronism**; timeline advances each chapter (no filler).

### A6 — Voice / register (PASS)
- Zero marketing/superlative drift (no "seamless / game-changing / cutting-edge / best-in-class /
  effortless / unlock the power" — grep clean).
- No academic register ("in conclusion", "it is important to note" — none found).
- No Skillbox cheerleading ("you've got this", "you will succeed" — none).
- 7 uses of "simply" are all legitimate adverbs ("it simply never reaches", "cannot simply
  decide"), none the register-flattening "it's simply easy". "just" usages are legitimate.
- Read-aloud / narrator-profile / joke-relocation checks (voice-constitution.md was absent from
  this workspace — no `skills/` dir — so the three calibration checks were applied from their
  documented definitions): narrator profile matches the first-200-words of each lesson; jokes are
  concept-bearing and would fail a "could this move to any other lesson?" relocation test (each
  names a same-lesson concept). PASS.

### A7 — Sanitizer / SVG (PASS)
All SVGs use `viewBox` with camelCase attributes (`viewBox`, `markerWidth`, `refX`) and no fixed
`width`/`height` on the SVG element. No `.file-tree` divs used in body (CSS rule unused). Sanitizer
config not re-audited here (no SVG primitive is stripped — all diagrams render via inline SVG that
matches L1's golden pattern).

### A8 — `.lesson-content` double-prefix (PASS)
0 occurrences across all 14 lessons (CSS is byte-identical to L1, which has none).

### A9 — Em-dash hygiene (PASS)
Body copy uses `&mdash;` throughout. Raw `—` (U+2014) appears only in allowed locations: the one CSS
comment (`/* Sources box — ... */`, every file), SVG `<text>` labels (L12 "Loop A — Design
Sign-Off", "Loop B — Submittal Process"), and SVG `aria-label` (L14 property-comparison label).
Zero raw em-dashes in prose.

### A10 — Widgets (PASS)
`.context/widget-tasks.json` defines 8 tasks (L5,6,7,8,9,11,12,14). All widget ids
(concept-match, mcq-justify, quiz-explain, flow-order, decision-tree) are registered in
`src/components/homework/widgets/registry.ts`; none is from the deny-list. Configs are sane and the
answer keys are pedagogically correct (spot-checked: L7 trade $1,200×0.6×1.3 = $936; L8 landed-cost
stack ≈ $1,395 ≈ 55% over FOB; L12 decision-tree outcomes correctly model Approved / As-Noted /
Revise / Rejected liability). Note per brief: these are homework widgets seeded separately and are
NOT embedded in lesson HTML — confirmed absent from HTML, correctly so.

### A11 — Homework structure (PASS)
- 2 Required (each with `<details class="model-answer">`) + 2 Advanced per lesson.
- Honest time estimate printed on every homework block (35–50 min).
- No repo/git tasks anywhere (no "create a repository / push / lesson-0X.md" — grep clean).
  All tasks answered in the platform submission field.
- AI-resilient Advanced tasks present in every lesson (interview a practitioner / investigate a real
  property / argue-with-an-AI-and-dissect / personal customer-base reasoning). L7 and L14 both have
  strong AI-resilient Advanced #1 and elaborative-interrogation ("Why is the industry built this
  way... what would break if you removed it") Advanced #2.

### A12 — Capstone L14 (PASS)
Synthesis only; references all 13 prior lessons; capstone homework applies the full framework to a
real property the learner must investigate (≥4 lessons' work). Closes the arc and the case.

### A13 — Sources audit (PASS)
- Every lesson has `.sources-box` before the footer with 4–7 real items (≥ minSourcesPerLesson=4).
- All inline `[N]` markers resolve: max marker ≤ source count in every lesson (no dangling cites).
- Citation style is numeric throughout (consistent with policy).
- **Spot-checks (WebFetch / brief cross-ref):**
  - `beyerbrown.com/ffe-procurement-comprehensive-guide` — live, on-topic (FF&E procurement). ✓
  - `procore.com/library/construction-submittals` — live; Approved / Approved-as-Noted /
    Revise-and-Resubmit / Rejected statuses match L10/L12 exactly. ✓
  - `myhfa.org/...furniture-import-duties...` — live; Section 301 25% + duty-stacking match L8. ✓
  - L7 money figures vs `real-money.md`: fiduciary 4% of €3M = €120k, mgmt 10–20%/BIID 15%,
    principal 20–40%/~35%, tiered 8%→4%, rep 5–15%, rebates 3–15%, cost-plus $8,999−40%×1.35=$7,289,
    BIID 35%/35%/68% — all exact. ✓
  - L8 figures vs `real-money.md`: China 30–35% stacked, Vietnam 20%/40%, 15–40% swing, 50% deposit/
    CBS, 2/10 Net 30 = 36.7%, contingency 5–10%/10–15%, freight 5–10%/15–25%, 60% freight swing,
    VE 10–20% — all exact. L8 even includes the required tariff-volatility caveat
    (hts.usitc.gov / ustr.gov). ✓
- **No fabricated/F-grade sources found.** Lower-authority supporting cites (e.g.
  `sarahospitalityusa.home.blog`, `softwareplatform.net`) are real URLs with specific paths/dates,
  used alongside registry anchors (not as sole sources), so not F-grade.
- **Recurrence / ≥50% rule:** beyerbrown (10), procurist (10), baileysallied (8) each exceed 50% of
  lessons but are all registry `anchor:true` sources, and the brief explicitly whitelists
  src-procurist-*, src-baileys-logistics, and src-layer-ffe-process as legitimate recurring anchors.
  No non-anchor source is over-cited. ✓
- **No Wikipedia-only lesson** (no Wikipedia sourcing at all). Language pref en-first respected
  (all sources English). ✓
- **Dedup**: registry ids are used consistently; same anchors reused, not re-created. ✓

### A13b — Images audit
Skipped (AI illustrations = false; no `<img>` in any lesson). ✓

### A14 — De-engineering + Fohlio-thin-overlay (PASS, one Medium leak — see M1)
- **Spine is the real industry**, not Fohlio's data model. Every lesson teaches the FF&E business;
  Fohlio is never the teaching backbone.
- **Body Fohlio mentions** (excluding the footer Slack channel): L1/2/3/7/8/11 = 0; L5 = 4, L9 = 2,
  L6 = 2, L12 = 3, L14 = 5 (all in designated/overlay-appropriate lessons); L13 = 16 (the tools/
  competitive lesson — expected). Every overlay is explicitly self-limiting ("The thin Fohlio
  aside", "the thin Fohlio-style layer worth naming here", "We won't dwell on this").
- **L13 competitive treatment is fair and honest**: Programa, Spexx, Studio Designer, Design
  Manager, Houzz/Ivy, Procore, Airtable/Notion all get one-line positions; the lesson flags that
  every comparison source is competitor-published; it names Fohlio's own downside ("steeper learning
  curve for smaller teams"); Procore is correctly classed as construction PM, not an FF&E competitor.
- **Forbidden engineering content**: no `<pre>`, no code blocks, no file-trees, no `<code>` entity
  tokens in prose (the only `<code>` is the footer Slack channel). No HTTP 409 / optimistic-
  pessimistic concurrency / SyncStateCache / version-field / isolation-boundary anywhere.
- The only de-engineer rule technically broken is the single word "queryable" in L14 (M1) and the
  plain-English "schema" (L3, Low) — both cosmetic, neither teaches a software internal.

---

## Repair plan

| # | Sev | Lesson | Owner | Exact fix |
|---|---|---|---|---|
| 1 | Medium | L14 (line 846) | orchestrator | Replace "in one place, queryable — is." with "in one place, searchable years later — is." Removes the only forbidden-word leak. |
| 2 | Low | L2/L8/L9/L12/L13 | orchestrator (sweep) | Delete the 7 visible bracket-callback tags: `[L1]` (L2:687), `[L3 callback]` (L8:858), `[L7 callback]` (L8:872), `[L2 callback]` (L9:887), `[L6 callback]` (L9:895), `[from Lesson 8]` (L12:839), `[from Lesson 12]` (L13:896). Surrounding sentences already name the lesson, so straight deletion works. |
| 3 | Low | L1 | orchestrator (optional) | Soften the "shake the building" attribution to a generic industry idiom (the underlying movability claim is sourced; only the verbatim phrase is folkloric). |
| 4 | Low | L3/L11 | orchestrator (optional) | Swap "room-numbering schema" → "room-numbering scheme/plan" (L3:875, L11:790) to keep the forbidden-word grep clean. Cosmetic. |

All four are mechanical text edits; none requires re-dispatching a course-lesson-writer.

## Re-review checklist (after fixes applied)
- [ ] M1: "queryable" removed from L14:846; de-engineer grep returns 0 substantive hits.
- [ ] L1: all 7 bracket-callback tags gone; no `\[L[0-9]+|from Lesson` artifacts remain in prose.
- [ ] (optional) L1 idiom softened; L3/L11 "schema" → "scheme".
- [ ] CSS still byte-identical to L1 (hash 8198d730) — confirm none of the text edits touched a
      `<style>` block.
- [ ] Inline `[N]` markers still resolve (no count change expected — edits are prose-only).
