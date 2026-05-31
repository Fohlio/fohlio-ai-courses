# Course review — fohlio-domain ("The Fohlio Domain for Engineers", ENGLISH)

**Verdict**: GO with fixes
**Findings**: 11 total — 0 critical, 2 high, 4 medium, 5 low

Re-written from Russian to English. Mechanical pre-checks (CSS byte-identical to L1, zero Cyrillic, @media 640, ≥2 recall / 1 joke / viewBox SVG / sources-box per lesson, 0 data-widget, 0 `.lesson-content` prefix, 0 em-dash leaks) re-confirmed — all hold. The English reads as native senior-engineer prose throughout: no translationese, no Skillbox-marketing register, one coherent narrator (omniscient documentarian with hindsight). The story arc holds, the frozen cast is intact, the $40k payoff lands in L8 and closes in L10, and the "Three clients, one concept" beat is present L2–L10. The two High findings are both internal domain-fact contradictions in L10, not language defects.

---

## Critical findings
None.

## High findings

- **[H1] L10, Part 7 — Course-wide self-check, model answer (b): `variance` is DEFINED WRONG, contradicting L6.**
  File: `public/lessons/fohlio-domain-10-handoff.html`, homework model answer ~line 998.
  Text: "Planned = sum of issued POs... Actual = sum of paid invoices... **Variance = planned − actual, showing unresolved spend.**"
  L6 establishes `variance = planned − specTotal` (Part 1 tech-note line ~633 and the waterfall diagram caption line ~684: "variance = planned − specTotal = +$2,500"). The fact base §1 also defines variance against the spec/planned/actual triple, with spec→planned being the at-risk gap. The L10 capstone re-defines variance as `planned − actual`, which is a *different* and incorrect formula in the same course. A capstone self-check that contradicts the foundational definition is wrong-fact + actively mis-teaches the heaviest concept.
  Owner: course-lesson-writer (re-dispatch L10).
  Fix: change L10 model answer (b) to "Variance = planned − specTotal: how far the committed cost has drifted from the approved spec intent." Keep specTotal/planned/actual definitions as-is.

- **[H2] L10, Part 6 — "one chair, three clients" table: discontinued finish labeled `updates`, contradicting L8 (the payoff mechanism).**
  File: `public/lessons/fohlio-domain-10-handoff.html`, Sync (L8) row, Marriott cell ~line 899.
  Text: "Engine flags: chair finish discontinued. **Sync state = `updates`.** Marco sees it before the PO goes out."
  L8 is unambiguous: a *discontinued / orphaned* finish is `broken`, not `updates` (L8 Part 2/Part 4, and the L8 model answer line ~955: "broken or orphaned ref... replace, not pull"). The fact base §1 confirms `broken` = orphaned/discontinued. Labeling the discontinued finish `updates` in the synthesis table breaks the exact distinction the whole course was built to teach, and does it inside the capstone that is supposed to consolidate it. Note the Grace cell in the same row correctly calls it "the exact $40k failure scenario" — so the table is internally inconsistent across its own cells.
  Owner: course-lesson-writer (re-dispatch L10).
  Fix: change the Marriott sync cell to `broken` (or, if the intent was that Marriott's case is a *non-fatal* catalog price/text update rather than a discontinuation, rewrite the cell text to not say "discontinued" — but the cleanest fix is `broken`, matching L8 and the Grace cell).

## Medium findings

- **[M1] L10, Part 5 — citation [6] does not support the claim it is attached to.**
  File: `public/lessons/fohlio-domain-10-handoff.html`, ~line 832: "Three segments, same data, different representations [6]." Source [6] is `src-fohlio-website-copy` (customer segments & positioning). That source supports *that the segments exist*, not *that deliverables render differently per segment*. The deliverable-generation claim is backed by [2] (spec-sheets) earlier in the same paragraph. The [6] marker is decorative.
  Owner: course-lesson-writer.
  Fix: drop the [6] marker, or move it to the sentence that names the three segments. Keep [2]/[4]/[5] where they sit.

- **[M2] L8 — `src-fohlio-ffe-101-schedule` is a registry source used to back a non-schedule claim; weak attribution.**
  File: `public/lessons/fohlio-domain-8-sync.html`, source list entry 2 (FF&E 101: Build the Ultimate Schedule), cited at [2] for "the catalog changed several times over" / staleness during approval. The "FF&E 101: Schedule" article is about building schedules, not about catalog drift during approval windows. The Programa source (entry 3) already covers "risks of spec staleness during approval" and is the correct anchor. Entry 2 is padding the count.
  Owner: course-lesson-writer.
  Fix: either re-point the [2] markers in L8 to source 3 (Programa) where they concern staleness, or replace L8 source entry 2 with a more on-point source. Not a fabrication (URL is real, verified in registry) — a relevance mismatch.

- **[M3] Source-registry over-reuse: Procurist (`src-procurist-schedules`) cited in 5 of 10 lessons — at the dedup threshold for a non-anchor.**
  Procurist appears in L1, L2, L3, L4, L7 (5 lessons). The dedup rule (fact base §5, sources-policy) flags any non-anchor source in ≥5 lessons. The declared anchors are `src-layer-ffe-process` and the internal repos (`src-spechub-architecture`, `src-baghdad-schema`); Procurist is NOT a declared anchor, yet it recurs as often as Layer. It is carrying a real recurring fact (the 500–5,000+ / 30–100+ / 12–24-month hospitality scale), which is legitimately reused — but at 5 lessons it should either be promoted to an explicit anchor in the registry or dropped from one lesson where a different source already covers the same point (L4 and L7 both have other scale sources available).
  Owner: orchestrator (registry decision) + course-lesson-writer if a swap is chosen.
  Fix: promote Procurist to a named anchor in `sourcesRegistry` (cleanest, since the hospitality-scale stat is a genuine course-wide anchor fact), OR remove the Procurist citation from L4 (where Fohlio-101 and SpecHub already cover the Area/qty claim).

- **[M4] L4 header `<h1>` breaks the per-course title convention used by 9 of 10 lessons.**
  File: `public/lessons/fohlio-domain-4-spec.html`, line ~586: `<h1>A spec is data, not a document</h1>`. Lessons 1, 5, 6, 7, 8, 9, 10 vary their h1 too (L5 "Brand Standards…", L6 "Money…", etc.), so a per-lesson h1 is acceptable as a pattern — BUT L1, L2, L3, L10 use `<h1>The Fohlio Domain for Engineers</h1>` with the chapter title in `.subtitle`, while L4–L9 put the chapter title in the h1. This is an inconsistent header pattern across the course (two competing conventions). Cosmetic-adjacent but visible in the lesson list / nav. Pedagogically it is a Medium because the recap-grid and "Chapter N" subtitle still anchor the learner; the h1 mismatch only affects polish.
  Owner: course-lesson-writer (low-effort sweep) or orchestrator decision to standardize.
  Fix: pick one convention. Recommend the L4–L9 style (chapter title in h1) and update L1/L2/L3/L10 to match, OR vice versa — but make all 10 consistent.

## Low / cosmetic

- **[L1] L3 — listed source [4] (Procurist) has no inline anchor; [5] over-used as the catch-all.**
  File: `public/lessons/fohlio-domain-3-products.html`. Inline markers present: [1], [2], [3], [5] — [4] is never cited in the body. All markers that ARE present resolve correctly (no broken markers), but a listed source with zero inline reference reads as a count-filler. Fix: add a [4] marker at the hospitality/library-pattern claim in Part 3, or drop source 4 and renumber.

- **[L2] L6 — recall-box hint contains inline citation `[3]` mid-recall.**
  File: `public/lessons/fohlio-domain-6-budget.html`, ~line 750. Marker inside a recall prompt is slightly off-pattern (markers belong on claims, not on quiz prompts). Harmless; resolves correctly. Fix: move the [3] to the body sentence the hint refers to, or drop it.

- **[L3] L10 — "Variance under 2% is an audit requirement" (Part 6 Budget/Church cell) is an invented precise number.**
  File: `public/lessons/fohlio-domain-10-handoff.html`, ~line 888. The fact base does not specify a Church variance tolerance; the src-note disclaims illustrative numbers, so this is covered, but a hard "2%" reads as a fact. Fix: soften to "a tight variance tolerance is an audit requirement" or keep and rely on the disclaimer (acceptable). Low.

- **[L4] L6 — "8 properties" (Part 3 Marriott value-engineering) vs "eight properties" (Part 6) vs L1's "600-room refresh plus rolling out across dozens of properties."** Internally consistent enough (8 simultaneous properties is a subset of "dozens"), but the number 8 appears without setup. Cosmetic; no fix required unless tightening.

- **[L5] L9 — `received_fully` PO status used (L9 Parts 2/6) but L7's PO-status table lists only `draft → open → approved → received_partially → closed` (no `received_fully`).**
  Files: `fohlio-domain-7-procurement.html` (status table) vs `fohlio-domain-9-delivery.html` (uses `received_fully`). Fact base §1 lists PO statuses as `draft → open → approved → received_partially → closed` — `received_fully` is not in the canon. L9 introduces it as an intermediate state ("When every line is fully received it moves to `received_fully`... then `closed`"). This is a plausible refinement but it is NOT in the frozen vocabulary and L7 never mentions it, so a learner sees a status in L9 that L7's authoritative table omits. Low (not wrong, but unsourced/uncanonized). Fix: either add `received_fully` to L7's table with a note, or have L9 say "all lines received → PO is ready to close" without naming a new status.

---

## Cross-lesson audits

### A4 — Callback graph (expected vs. actual)

Expected: L2→L1; L3→L2,L1; L4→L3,L1; L5→L4,L1; L6→L5,L3,L1; L7→L6,L4,L3; L8→L7,L5,L3; L9→L8,L6,L1; L10→L8,L5,L4,L1 (≥4).

| Lesson | Expected refs | Found in body/recap | Status |
|---|---|---|---|
| L2 | L1 | L1 (recap + hook + "$40k from Lesson 1") | OK |
| L3 | L2, L1 | L2 (intent→product), L1 (spec=db, three clients) | OK |
| L4 | L3, L1 | L3 (catalog→slot), L1 (entity tree, image-anchor) | OK |
| L5 | L4, L1 | L4 (slot/qty/alternatives), L1 (three clients, JTBD) + L2 bonus | OK |
| L6 | L5, L3, L1 | L5 (standards→price), L3 (Source), L1 ($40k, spec=db) | OK |
| L7 | L6, L4, L3 | L6 (budget approved), L4 (spec=data), L3 (Source) | OK |
| L8 | L7, L5, L3 | L7 (yellow flag handoff), L5 (statuses/push-pull), L3 (Family/Item ref) | OK |
| L9 | L8, L6, L1 | L8 (sync), L6 (actual=invoices), L1 (phase 5) | OK |
| L10 | L8, L5, L4, L1 (≥4) | L8, L5, L4 (spec=data), L1, +L2,L3,L6,L7,L9 in recap table | OK (9 refs) |

Callback graph fully satisfied. The 1-3-7 spacing is honored (e.g. L8 reaches back to L3; L10 reaches back to L1). L8→L7 handoff is especially clean: L7 ends on the "yellow flag appears Monday" cliffhanger and L8 opens by resolving it.

### A5 — Story-mode consistency

- **Arc**: $40k discontinued-finish wound is referenced as an *open* wound in L1–L7 (never "fixed"), the *mechanism* lands in L8 (sync flags `broken` → Dana clicks Replace → PO goes out clean), emotional *closure* in L10 (Cedar & Oak delivered, twelve chairs in the right finish). Arc rule §6 respected — not resolved before L8. ✔
- **Bookending**: L8 and L10 both reopen the exact L1 scene ("7:14 a.m… cold coffee… cursor blinking in the Project name field") and re-read it with new understanding. Textbook story-mode callback. ✔
- **Frozen cast**: Dana Reyes, Marco, Priya, Helen, Linda, Brother Andersen, Grace — all present, all in their declared roles, no rename, no quiet promotion (Priya stays the junior who asks the naive questions; Helen stays the gatekeeper; Marco stays procurement). ✔
- **Clients**: Marriott / The Church of Jesus Christ / Cedar & Oak (Grace) consistent across all lessons. L5 correctly expands to "The Church of Jesus Christ of Latter-day Saints" in the src-note (respectful full name) while keeping the short form in body. ✔
- **"Three clients, one concept" beat**: present in every lesson L2–L10 (L2 Part 2, L3 Part 5, L4 Part 4 info-box, L5 Part 4, L6 Part 6, L7 Part 5, L8 Part 6, L9 Part 5, L10 Part 6). ✔
- **Image-anchor** "A spec isn't a document. It's a database that happens to know how to print itself on paper" recurs in L1, L2, L3, L4, L5, L6, L7, L8, L9, L10 — ≥3 required, hit in all 10. ✔
- **No anachronism, no fabricated real-org dialogue**: all dialogue is between composite characters; Marriott/Church appear only as archetypes; src-notes disclaim correctly in every lesson. ✔
- **POV stable**: omniscient documentarian with hindsight throughout; no mid-course switch to first person or "we = you." ✔

Mode is held. No drift. No Critical mode finding.

### A6 — Voice in English (the focus audit)

- **Read-aloud sameness check** (3 random paragraphs per lesson, mentally): every lesson reads as the same dry, precise, scarred senior practitioner. Sentence rhythm alternates short/long correctly (e.g. L8 hook: "Orange. Dana hovers over it." against long expository sentences). No paragraph slips into marketing-blog or academic register.
- **Translationese / calque scan**: none found. No literal-from-Russian constructions, no "On the one hand / on the other hand" scaffolding, no comma-splice runs, no misused articles. Idiomatic English throughout ("the chill before the spec", "an Instagram account with nice photos", "a chronograph, not a spreadsheet").
- **Skillbox-drift scan** ("just/simply/easy/you've got this"): three "simply" hits (L1 L771, L3 L741, L6 L769) — all are natural English intensifiers ("simply not dropping a thread", "simply pulls from it", "can't simply substitute"), NOT reassurance-marketing. Not flaggable.
- **Narrator-profile vs first-200-words check**: every lesson opens in a scene with a named person inside the first 200 words (L1 Dana 7:14 a.m.; L2 Priya at the moodboard; L3 Priya on the Aeron page; L4 Dana scrolling Marriott; L5 Linda "came with a document"; L6 Dana lays two sheets down; L7 Marco Monday morning; L8 Dana back at the same desk; L9 the truck at 7:40; L10 Dana opens the delivered project). Story-mode L1 scene-anchor rule satisfied; no lesson opens on a bare definition.
- **Joke-box relocation test**: each joke is locked to its lesson's concept and could NOT be moved without rewriting —
  - L1 `spec_FINAL_v2.xlsx` → "which version is true right now" (spec-as-database).
  - L2 "cozy amber oak armchair vintage vibes / Customs doesn't accept tags" (picture ≠ data).
  - L3 "14 emails, 14 templates" (web-clipper / data-entry problem).
  - L4 "why is it called a Schedule not a Table… be grateful they didn't call it a Pivot" (Schedule = table schema).
  - L5 "draft stays draft until there's a phone number" (catalog status gate).
  - L6 "$400 chair → $631… plus markup 20%" (soft costs/markup).
  - L7 "why both draft and open" (PO status reversibility cost).
  - L8 "pull is backwards from Git" (push/pull direction).
  - L9 "47 identical boxes / scan QR" (GrCode field tracking).
  - L10 "give everyone Admin… explain it to Helen" (roles/permissions).
  All concept-specific. ✔

Voice is the strongest dimension of this re-write. No High voice finding.

### A11 — Homework structure

Every lesson: 2 Required + 2 Advanced. ✔
- Required #1 has an AI-free recall segment in all 10 (explicitly labeled "AI-free segment/recall"). ✔
- Each Required ships a `<details class="model-answer">` — verified in all 10 (both Required items carry one). ✔
- ≥1 Advanced is AI-resilient in all 10 (L1 "dissect an LLM answer"; L2 process-critique; L4 EAV design judgment; L5 "find a real public brand standard"; L6 "walk a real colleague through it"; L7 "live supplier catalog page, paste URL"; L8 sync-policy judgment; L9 over-delivery edge-case design; L10 "a real ticket from your backlog"). ✔
- Advanced #2 uses elaborative-interrogation "Why does X / why this way and not the obvious alternative" framing in all 10. ✔
- Honest time estimate printed on every homework block (≈30–50 min). ✔
- No git-repo / lesson-0X.md tasks; L10 explicitly says "No attached files, no repos." ✔

A11 fully clean.

### A12 — Capstone (L10)

- Synthesis-only: no genuinely new concept is introduced — Collaboration/roles/deliverables were all seeded earlier (roles in L1, Collaboration foreshadowed in L8/L9, deliverables implied by spec-as-database). Acceptable for a handover chapter. ✔
- Capstone task traces ONE chair across all six phases for all three clients, pulling from L2,L3,L4,L5,L6,L7,L8,L9 — well over the ≥4-prior-reference bar. ✔
- Closes the $40k arc explicitly ("No forty thousand dollars. No month of delay."). ✔
- **But** the two High findings (H1 variance formula, H2 discontinued=`updates`) both live in L10 and both corrupt the synthesis — the capstone is where consolidation must be airtight, so these are weighted as High rather than Medium.

### A13 — Sources

- Every lesson has a `.sources-box` with ≥3 real items (L1: 5, L2: 5, L3: 5, L4: 4, L5: 4, L6: 5, L7: 6, L8: 4, L9: 4, L10: 6). ✔ No `.src-note` opt-out abuse — every lesson cites real external + internal sources.
- Inline `[N]` markers resolve to list entries in all lessons (no broken markers). One orphan listed-but-uncited source in L3 ([L1] above).
- Citation style is numeric `[N]` consistently — no author-year drift. ✔
- Markers placed at scene boundaries / claim clusters, not mid-dialogue (story-mode rule respected). ✔
- **Spot-check (verified live this pass):**
  - `src-layer-ffe-process` (layer.team) — URL live; describes the 6-phase model (Schematic → Specification → Client Approval → Procurement → Delivery & Installation → Handover). Matches L1/L8/L9/L10 usage. ✔
  - `src-procurist-schedules` (procurist.io) — URL live; states verbatim "Hospitality: 500 to 5,000+ line items, 30 to 100+ vendors, 12 to 24 month procurement cycle." Matches the L1/L2 hard-fact citation exactly. ✔
  - Fohlio blog URLs and internal repo sources are consistent with the registry §5 (not independently fetchable for internal repos, which is expected).
  - **No F-grade / fabricated sources found.** No 404s on spot-checked anchors, no mis-attributed quotes, no invented papers.
- Dedup: anchors `src-layer-ffe-process`, `src-spechub-architecture`, `src-baghdad-schema` recur as permitted. Procurist at 5 lessons trips the threshold → [M3].
- Language pref en-first respected (all external sources English). ✔

### Domain-fact accuracy (per fact base)

- FF&E definition/scope (movable, excludes shell): correct (L1). ✔
- 6 phases named correctly and in order across L1/L3-diagram/L10: correct. ✔
- Entity vocabulary (Workspace/Project/Area/Schedule/ItemColumns/ProjectItemSlot/ProjectItem/CatalogFamily/CatalogItem/Parts/Source): all used correctly and consistently with §1–§2. ✔
- Catalog statuses `draft / new_from_project / ready_to_use`: correct (L3, L5). ✔
- Sync states `new / ready / updates / broken`: correctly defined in L8 — but MISLABELED in the L10 synthesis table → [H2]. ✔ at definition, ✗ at synthesis.
- PO statuses `draft → open → approved → received_partially → closed`: correct in L7; L9 adds non-canon `received_fully` → [L5].
- Budget triple specTotal/planned/actual: correct in L6 — but variance formula contradicted in L10 → [H1].
- Optimistic concurrency (version + HTTP 409), soft-deletion, multi-tenant scoping: correct (L4, L8). ✔
- 3 budget numbers (the L6 worked example: $60k spec / 5% discount / $5,500 soft costs → variance +$2,500): arithmetic checks out; the homework worked examples (L6: $37,920 spec total; L7 landed-cost compare) are arithmetically correct. ✔

---

## Repair plan (ordered)

1. **[H1]** Re-dispatch course-lesson-writer for **L10**: fix variance definition in the Course-wide self-check model answer to `variance = planned − specTotal` (match L6). File `fohlio-domain-10-handoff.html` ~line 998.
2. **[H2]** Same L10 dispatch: in the "one chair, three clients" table, change the Marriott Sync (L8) cell from `updates` to `broken` for the discontinued finish (match L8 + the Grace cell). ~line 899.
3. **[M1]** L10: drop the unsupported `[6]` marker on "different representations" (or move to the segment-naming sentence). ~line 832.
4. **[M2]** L8: re-point the staleness `[2]` markers to source 3 (Programa), or swap source entry 2 for an on-topic source. Source list ~line 996.
5. **[M3]** Registry decision (orchestrator): promote `src-procurist-schedules` to a named anchor, OR remove its citation from L4 (Fohlio-101 + SpecHub already cover the claim).
6. **[M4]** Standardize the `<h1>` convention across all 10 lessons (recommend chapter-title-in-h1 per L4–L9; update L1/L2/L3/L10).
7. **[L1]** L3: add a `[4]` inline marker at the hospitality/library claim in Part 3, or drop+renumber source 4.
8. **[L2]** L6: move the `[3]` marker out of the recall-box hint onto the body claim.
9. **[L3]** L10: soften "Variance under 2%" to a non-numeric tolerance (or rely on the illustrative-numbers disclaimer).
10. **[L4]** L6: optional — set up the "8 properties" number on first use (cosmetic).
11. **[L5]** Reconcile `received_fully`: add it to L7's PO-status table with a note, or rephrase L9 to not name a non-canon status.

## Re-review checklist (after fixes applied)

- [ ] H1: L10 variance formula reads `planned − specTotal`, matching L6 diagram and tech-note.
- [ ] H2: L10 sync table Marriott cell reads `broken` (or discontinuation language removed); consistent with L8 and the Grace cell.
- [ ] M1/M2: no orphan/irrelevant citation markers; all inline [N] back a claim the source actually supports.
- [ ] M3: Procurist either anchored in registry or dropped from one lesson (≤4 lessons for any non-anchor).
- [ ] M4: all 10 `<h1>` follow one convention.
- [ ] L1/L5: L3 source 4 anchored; `received_fully` reconciled between L7 and L9.
- [ ] CSS still byte-identical to L1; @media 640 unchanged (no structural edits expected from these fixes).
- [ ] Spot re-verify: arc still unresolved before L8; image-anchor still in all 10; three-clients beat still in L2–L10.
