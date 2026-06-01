import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ADMIN_GITHUB_NICKNAME } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const COURSE_ID = "course-fohlio-domain";
const COURSE_SLUG = "fohlio-domain";

type HomeworkTaskSeed = {
  id: string;
  title: string;
  description: string;
  category: "required" | "advanced";
  submissionType: "pr_link" | "screenshot" | "text" | "quiz" | "checklist" | "widget";
  order: number;
  widgetId?: string;
  widgetConfig?: Record<string, unknown>;
  modelAnswer?: string;
  estimatedMinutes?: number;
};

type LessonSeed = {
  id: string;
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  learningGoals: string[];
  contentFile: string;
  isPublished: boolean;
  homework: HomeworkTaskSeed[];
};

const LESSONS: LessonSeed[] = [
  {
    id: "fohlio-domain-lesson-1",
    slug: "kickoff",
    order: 1,
    title: "What FF&E Actually Is — and the $60 Billion Behind It",
    subtitle: "What FF&E and OS&E are, the four segments, the money, and why a spec is a living schedule",
    description:
      "The real FF&E industry, from the ground up. What Furniture, Fixtures & Equipment is (vs OS&E vs the building shell — the 'shake the building' test), the four segments, the size of the market (~$60B hotel / $172B all-vertical), FF&E's 8-15% share of a hotel build, the per-room cost ladder, the renovation/PIP engine that makes the work recurring, the ~$15k/day cost of a late opening, and the core idea that a spec is a living schedule that has to stay true from moodboard to loading dock.",
    learningGoals: [
      "Say what FF&E is and how it differs from OS&E and from the building shell",
      "Name the four segments of what goes into a finished building",
      "Put real numbers on it: market size, FF&E's share of a hotel budget, cost per room",
      "Explain the renovation and brand-standard engine that keeps the work recurring",
      "See why a spec is a living schedule, not a document — and which moment the $40k mistake happened in",
    ],
    contentFile: "fohlio-domain-1-kickoff.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-1-1",
        title: "Sort a real room into the four segments",
        description:
          "Picture a hotel guest room. List 10-12 things in it and sort each into FF&E / OS&E / Finishes / Architectural. Mark which the hotel replaces most often (OS&E) and which are long-lead and expensive (FF&E). Pick one item and place it on the per-room cost ladder for a luxury vs economy property. From memory (AI-free), spend 60 seconds explaining the FF&E vs OS&E difference and why it matters to a hotel's accounting.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Sorted sensibly: bed/desk/lounge chair/lamp/TV -> FF&E; towels/sheets/glassware/toiletries -> OS&E; flooring/paint/wall tile -> Finishes; door/window/built-in closet -> Architectural. The replaced-often items are OS&E (consumable, operating expense); the long-lead expensive ones are FF&E (capital asset, depreciated). The from-memory point: FF&E is durable and capitalized, OS&E is consumable, expensed, and has vastly more SKUs.",
        estimatedMinutes: 20,
      },
      {
        id: "fd-task-1-2",
        title: "Self-check on this chapter",
        description:
          "Without scrolling back: (a) state the 'shake the building' test and give two things that are FF&E and two that are not; (b) give the three money anchors (market size, FF&E share of a hotel build, the rough per-room range); (c) name the moment the $40k error arose and the moment it surfaced.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Shake the building — what falls out is FF&E. Is: a lounge chair, a table lamp. Isn't: a wall, the HVAC ducting. (b) ~$60B hotel FF&E market; 8-15% of total hotel development cost; ~$3k-$8k per room economy up to $35k-$58k+ luxury. (c) Arose in the gap between specification and shipment (the finish was discontinued and silently substituted); surfaced at receiving/install, when it was expensive to fix.",
        estimatedMinutes: 8,
      },
      {
        id: "fd-task-1-3",
        title: "Argue with an AI",
        description:
          "Ask any chatbot: 'Why would a hotel need special software to buy its furniture — isn't that just shopping?' Dissect the answer: what does it miss about scale (thousands of items, dozens of suppliers), the time gap (a finish going stale over months), and the stakes (a fixed opening date)? Write 3-4 sentences on what it left out.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-1-4",
        title: "Why it's built this way",
        description:
          "Why does the industry separate the designer who specifies from the agent who buys, instead of having one person do both? And why does a hotel keep an FF&E reserve (2-5% of revenue/year) rather than paying for renovations when they happen? Explain why 'one person, pay as you go' breaks at hotel scale.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-2",
    slug: "cast",
    order: 2,
    title: "Who's Actually in the Room",
    subtitle: "The full FF&E value chain — and who actually pays whom",
    description:
      "A full map of the FF&E value chain: the four demand-side entities (owner/REIT, brand/flag, management company, franchisee) that outsiders collapse into one; the foundational designer-specifies / purchasing-agent-buys split; real named firms on both sides (HBA, Gensler, Rockwell; Benjamin West, R-W, Stroud, Beyer Brown); manufacturer's reps and the commission model; dealers, showrooms, trade shows; 3PL logistics and the owner's rep. Who pays whom, whose veto is live, and where Dana's three client types fit.",
    learningGoals: [
      "Name and distinguish the four demand-side entities: owner/REIT, brand/flag, management company, franchisee",
      "Explain the designer-specifies / purchasing-agent-buys split and the three purchasing fee models",
      "Identify real named purchasing firms and design firms in hospitality",
      "Describe manufacturer's reps: commission-only, multi-line, whose interests they serve",
      "Place the 3PL logistics firms and the owner's rep correctly in the value chain",
    ],
    contentFile: "fohlio-domain-2-cast.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-2-1",
        title: "Map a real hotel's ownership chain",
        description:
          "Pick any branded hotel. Research who operates it, who owns the real estate, and which brand standard applies. Write 3-5 sentences on what you found and why the owner/brand/operator distinction matters for FF&E decisions.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "A strong answer separates three roles: the owner/REIT (owns the building and the FF&E budget), the brand/flag (Marriott/Hilton — franchises or manages, dictates standards, earns fees), and the management company (runs the hotel day-to-day). The distinction matters because the brand says what 'done right' means, but the owner funds and approves the FF&E, and the operator lives with it.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-2-2",
        title: "Draw the chain for Dana's project",
        description:
          "Sketch every actor from owner to installer with labeled arrows showing what flows (money, instructions, goods). Then identify which of Dana's three client types most resembles the project's structure and why.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "Chain: owner/developer -> (owner's rep/PM) -> designer (specifies) + purchasing agent (buys) -> manufacturers/vendors via reps/dealers -> freight/warehouse/install -> back to owner at handover. Money flows from the owner; reps are paid by the manufacturer; the agent is paid a fiduciary fee or a markup. The three client types: luxury flag (Linda — consistency), institutional owner (Brother Andersen — budget/replication), independent boutique (Grace — solo, speed).",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-2-3",
        title: "Interview a rep or designer",
        description:
          "Find one real person in the FF&E chain (LinkedIn, your network, a trade event). Ask: who do you see as your actual client, and what's the most common misunderstanding about your role? Summarize and compare to the lesson.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 20,
      },
      {
        id: "fd-task-2-4",
        title: "Why separate specifying from buying?",
        description:
          "Elaborative interrogation: what would break if the designer also owned purchasing, and vice versa? Why does the fiduciary model exist versus markup? How does Grace live with both problems at once, solo?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-3",
    slug: "phases",
    order: 3,
    title: "One Chair's Journey: The Real Phases",
    subtitle: "The real project phases, AIA vocabulary, and why procurement runs parallel to construction",
    description:
      "The real lifecycle of an FF&E project using the vocabulary the industry actually uses (the AIA phases and FF&E contracts B152/B153/B252): programming through specification, budgeting, bidding, purchase orders, expediting, manufacturing, freight, receiving, install, punch list, closeout, and OS&E. The central insight: FF&E is a parallel track to construction, and procurement starts while the building is still being built because lead times are so long. Locates the $40k mistake precisely: it arose during expediting and surfaced at receiving.",
    learningGoals: [
      "Name and sequence the phases of a real FF&E project using AIA vocabulary",
      "Explain why FF&E procurement is a parallel track to construction, not sequential",
      "State the lead-time ranges (domestic 6-10 wk, overseas 18-24 wk, custom 6-12 mo) and their consequences",
      "Locate the $40k mistake in the phase map: arose in expediting, surfaced at receiving",
      "Distinguish what the FF&E schedule tracks from what the specification describes",
    ],
    contentFile: "fohlio-domain-3-phases.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-3-1",
        title: "Phase map a real project",
        description:
          "Walk a building renovation or hotel opening you know through the phases: which you can see from outside, which are invisible, and where the parallel-track challenge was most painful for that specific project. 4-6 sentences.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "A good answer names the real phases in order (programming -> SD -> DD -> spec/CD -> budget/VE -> bidding/RFQ -> PO -> expediting -> manufacturing -> freight -> receiving -> delivery/install -> punch list -> closeout -> OS&E), and identifies that the visible phases are install/punch while spec, expediting and receiving are invisible. The parallel-track pain is that long lead times force ordering before construction is finished.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-3-2",
        title: "Cumulative self-check (L1 + L2 + L3)",
        description:
          "Closed-book recall: (a) the four segments + which is an operating expense; (b) two actors at trade shows and what each does there; (c) three lead-time ranges and why overseas forces parallel-track POs; (d) where the $40k mistake arose and surfaced in the phases.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) FF&E / OS&E / Finishes / Architectural; OS&E is the operating expense. (b) Manufacturer's reps (get product specified) and designers (discover product); dealers/manufacturers also exhibit. (c) Domestic 6-10 wk, overseas 18-24 wk, custom 6-12 mo; overseas lead times are longer than the remaining construction time, so POs must go out in parallel. (d) Arose during expediting (finish discontinued, silently substituted); surfaced at receiving.",
        estimatedMinutes: 10,
      },
      {
        id: "fd-task-3-3",
        title: "The expediting gap",
        description:
          "Find a real purchasing firm's website and look at how they describe expediting. What do they track between PO and shipment? Compare to the expediting phase in this lesson. Requires live browsing.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-3-4",
        title: "Why does lead time force parallel tracks?",
        description:
          "Elaborative interrogation: (a) if domestic lead time were 2 weeks, would parallel tracks still be needed? (b) what happens when a project mixes items on three different lead-time clocks? (c) why does Grace, with 40 chairs, still face a version of the same problem?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-4",
    slug: "intent",
    order: 4,
    title: "From a Moodboard to a Spec",
    subtitle: "A Pinterest image has no model number, no finish, no lead time — and a hotel opens in eight months",
    description:
      "How design intent moves from a client moodboard through the design phases into a real, buyable specification. The five data fields a moodboard image lacks; the difference between a spec sheet, cut sheet, and tear sheet; the FF&E schedule (project-wide tracker) versus the spec (one-product record); the finish schedule; the spec book; and why brand standards must enter early rather than as a final checklist.",
    learningGoals: [
      "Explain why a moodboard image is not a spec line and name the five fields it is missing",
      "Describe what changes at each design phase and when specific products first get selected",
      "Distinguish a tear sheet, cut sheet, and spec sheet by depth and purpose",
      "Explain the difference between the FF&E schedule and the spec, and where the finish schedule fits",
      "Explain why brand standards enter during design, not at the end",
    ],
    contentFile: "fohlio-domain-4-intent.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-4-1",
        title: "Diagnose a moodboard",
        description:
          "Find a hospitality moodboard online. Pick three items; for each, list which of the five required spec fields you can determine from the image alone, and which are missing. Explain in 2-3 sentences why the missing fields are the purchasing agent's problem.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "From an image you can usually guess style, rough type, and maybe a color family. You cannot know the exact model/SKU, finish code, dimensions, supplier/source, unit price, or lead time. Those missing fields are the agent's problem because nothing can be bid, ordered, or scheduled until each one is pinned down.",
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-4-2",
        title: "Distinguish the documents",
        description:
          "Without looking back, write one sentence defining each of: tear sheet, cut sheet, spec sheet, FF&E schedule, finish schedule, spec book. Then: if Marco just received the spec book for a 150-room hotel, what would he do with it in the next two weeks?",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "Tear sheet = a one-page product summary for presentation; cut sheet = detailed dimensions/materials/install, often for custom items; spec sheet = everything about one product (model, finish, price, warranties); FF&E schedule = the project-wide tracker (vendor, qty, cost, lead time, status); finish schedule = hard finishes by room; spec book = all spec sheets compiled. Marco would build budgets and a bid package from the schedule and start sourcing/RFQs against the long-lead items.",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-4-3",
        title: "AI as a vendor",
        description:
          "Ask a chatbot to write a spec sheet for 'a contract-grade cognac leather lounge chair for a 200-room upscale hotel.' Audit the result against the five required spec fields: how many does it actually provide vs approximate vs fabricate? 3-4 sentences on the difference between describing a product and specifying one.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-4-4",
        title: "Why phases exist",
        description:
          "Elaborative interrogation: why does the industry separate Programming, SD, and DD into sequential phases rather than selecting specific products at the very start? Identify at least two problems that starting with specific products would create, and how the phase structure prevents each.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-5",
    slug: "library",
    order: 5,
    title: "The Library and the Takeoff",
    subtitle: "Why firms that start from scratch every project are paying a tax on their own memory",
    description:
      "The real-industry problem of product knowledge scattered in spreadsheets, PDFs, and people's heads, and how a structured product library solves it. The family/variant structure of a library record, materials tracking, bills of materials for multi-component items, the quantity takeoff (counting items per room type and rolling up to building totals), packing and overage percentages, and why OS&E has vastly more SKUs and never truly ends.",
    learningGoals: [
      "Explain why firms maintain a product library and what goes wrong without one",
      "Distinguish a product family from a variant/option within it",
      "Describe a bill of materials and why it matters for a custom bed package",
      "Walk through a quantity takeoff: room-type counts to building total to overage to packing units",
      "Explain why OS&E has vastly more SKUs and never truly ends",
    ],
    contentFile: "fohlio-domain-5-library.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-5-1",
        title: "Build a mini-takeoff",
        description:
          "90-room hotel, two room types (Standard King: 60 rooms with 1 desk + 1 lounge chair + 2 nightstands; Standard Double: 30 rooms with 1 desk + 0 lounge chairs + 2 nightstands). Calculate building totals, apply 5% overage (round up), then calculate cases for nightstands (4 per case). Explain in one sentence why overage matters on a fixed opening date.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Desks 90, lounge chairs 60, nightstands 180. With 5% overage rounded up: desks 95, lounge chairs 63, nightstands 189. Nightstands in cases of 4 -> ceil(189/4) = 48 cases (192 units). Overage matters because a damaged or short item discovered near a fixed opening date can't be reordered in time, so a small buffer protects the schedule.",
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-5-2",
        title: "Cumulative self-check (L1-L5)",
        description:
          "Without referring back: (a) the shake-the-building test + one FF&E and one OS&E example; (b) why the purchasing agent must place orders before construction is complete; (c) name three of the five spec-line fields a moodboard lacks; (d) explain why a product library compounds in value over time.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Shake the building — what falls out is FF&E (lounge chair); OS&E is consumable (towels). (b) Lead times are longer than the remaining build time, so orders run parallel to construction. (c) Any three of: model/SKU, finish code, dimensions, supplier/source, unit price, lead time. (d) Each project adds vetted records; the next project starts from real data instead of a blank sheet, so the library compounds.",
        estimatedMinutes: 10,
      },
      {
        id: "fd-task-5-recall",
        title: "Recall: match the example to the library concept",
        description:
          "Match each real-world item to the library concept it best illustrates. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "p1", term: "Herman Miller Aeron Chair", definition: "Product line / family" },
            { id: "p2", term: "Aeron, Size B, Graphite finish", definition: "A specific variant / option" },
            { id: "p3", term: "Wool fabric used on a lounge chair frame", definition: "A material the product is made of" },
            { id: "p4", term: "Custom bed = frame + mattress + topper + headboard", definition: "Bill of materials / parts list" },
            { id: "p5", term: "Standard King guest room (60 rooms)", definition: "A room type used in the takeoff" },
            { id: "p6", term: "120 nightstands across 60 rooms", definition: "A takeoff / quantity rollup" },
          ],
        },
        modelAnswer:
          "Family = the product line (Aeron Chair); variant = a specific option (Size B, Graphite); material = what it's made of (wool fabric); bill of materials = the parts that make a custom bed; room type = the unit the takeoff counts against; takeoff/rollup = the total quantity across rooms.",
        estimatedMinutes: 4,
      },
      {
        id: "fd-task-5-3",
        title: "The knowledge-in-people's-heads problem",
        description:
          "Talk to someone in your company who has been there at least three years. Ask what key knowledge only they have that would be hard to reconstruct if they left. Compare to the FF&E library problem: what is the same, what is different? 3-4 sentences.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-5-4",
        title: "Why two tracks, not one?",
        description:
          "Elaborative interrogation: a hotel runs FF&E and OS&E procurement as two separate tracks. Identify at least three reasons (lead-time cadence, vendor types, budget classification, the never-ends nature of OS&E) and explain why collapsing them into one process would create more problems than it solves.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-6",
    slug: "standards",
    order: 6,
    title: "Brand Standards and the PIP Machine",
    subtitle: "Linda's brand book meets a real renovation budget — and the flag is on the line",
    description:
      "What brand standards actually are (contractually enforceable franchise clauses, not style guides), how PIPs are triggered and structured ($50k-$500k+, 12-18 month deadlines, penalty fees, flag-loss risk), the golden-sample/first-article validation mechanism for multi-property consistency, and the structural difference between flagged and independent properties.",
    learningGoals: [
      "Explain why a brand standard is contractually enforceable, not advisory",
      "Name the PIP triggers and describe the penalty escalation for non-compliance",
      "Define a golden sample and the problem it solves across a multi-property rollout",
      "Contrast the FF&E experience for flagged vs independent properties",
      "Describe how brand standards interact with the spec library and lead-time constraints",
    ],
    contentFile: "fohlio-domain-6-standards.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-6-1",
        title: "Map PIP triggers to a real property",
        description:
          "Find a real hotel PIP article or franchise disclosure. Identify the trigger, cost range, and deadline. Write two sentences on why the supply-chain lead-time constraints make the deadline structurally difficult.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Common triggers: franchise renewal, change of ownership, conversion/rebrand, or low audit/guest-satisfaction scores. Costs run $50k-$150k for soft goods up to $500k+ for a major PIP, with 12-18 month deadlines. The deadline is hard because custom FF&E lead times (often 6-12 months) eat most of the window, leaving little margin if anything slips.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-6-2",
        title: "Self-check on PIP mechanics",
        description:
          "Without scrolling: state the PIP triggers; define a golden sample; name the two-step consequence of a missed deadline.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "Triggers: renewal, sale/change of ownership, conversion, low scores. A golden sample (first-article) is an approved physical reference that all production must match, so consistency holds across many rooms and properties. Missed-deadline consequence: an added penalty franchise fee (≈1-3%) during the PIP period, escalating to loss of the flag.",
        estimatedMinutes: 8,
      },
      {
        id: "fd-task-6-recall",
        title: "Recall: spot the brand-standard violation",
        description:
          "A Marriott select-service flag is completing a PIP. Pick the spec that violates the brand standard and justify it. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "The brand standard specifies the guestroom lounge chair as Model LX-220, supplier Kimball Hospitality, finish 'Pewter Linen'. The PIP requires all 120 rooms compliant. Which option violates the standard?",
          options: [
            { id: "opt-a", label: "Model LX-220, Kimball Hospitality, 'Pewter Linen' — 120 units at $480 trade" },
            { id: "opt-b", label: "Model LX-220, Kimball Hospitality, 'Pewter Linen' — 120 units at $510 trade (regional dealer premium)" },
            { id: "opt-c", label: "Model LX-220, Charter Furniture (alternate supplier, similar quality, 15% lower price), 'Pewter Linen' — 120 units" },
            { id: "opt-d", label: "Model LX-220, Kimball Hospitality, 'Pewter Linen' — 80 now + 40 in Phase 2 (same spec, split delivery)" },
          ],
          correctOptionId: "opt-c",
          minJustificationWords: 15,
          rubric:
            "C is the violation: it substitutes an unapproved supplier (Charter) for the brand-approved Kimball Hospitality. Brand standards specify approved suppliers by name, not by quality tier — 'comparable' is not 'approved'. A is fully compliant; B's regional price premium does not affect compliance (model, supplier, finish all correct); D's split delivery doesn't change the spec.",
        },
        modelAnswer:
          "Option C swaps the brand-approved supplier (Kimball) for an unapproved one (Charter). Equal quality and a lower price are irrelevant: brand standards name the approved supplier, and using another requires explicit brand pre-approval.",
        estimatedMinutes: 5,
      },
      {
        id: "fd-task-6-3",
        title: "Interview a real user",
        description:
          "Ask a designer, hotel ops manager, or PIP veteran what was hardest about satisfying brand standards during a renovation. Compare their answer to this lesson's mechanisms.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-6-4",
        title: "Flagged vs independent",
        description:
          "Elaborative interrogation: why do brand standards create structurally higher demand for FF&E tracking than independent properties, despite the constraint burden? What does relaxing a brand standard do to brand value? Explain the tension in 'consistency without rigidity'.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-7",
    slug: "pricing",
    order: 7,
    title: "Three Prices for the Same Chair (Money, Part 1)",
    subtitle: "How retail, trade, and fee actually stack up — and who keeps what",
    description:
      "The retail/trade pricing structure (trade 20-60% off list), keystone markup, the three designer fee models, the fiduciary disclosed-fee purchasing-agent model (3-6% of FF&E value; discounts pass to the owner), the manufacturer's rep commission paid invisibly by the maker (5-15%), volume rebates, and a full margin-capture map from manufacturer to owner.",
    learningGoals: [
      "Distinguish retail (list) from trade (net) price and explain why the gap exists",
      "Define keystone markup and explain its limits",
      "Name the three designer/purchasing-agent fee models and when each is used",
      "Explain the fiduciary/disclosed-fee model and why it is the hospitality standard",
      "Describe how a manufacturer's rep earns without the buyer paying them",
    ],
    contentFile: "fohlio-domain-7-pricing.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-7-1",
        title: "Trace the money through a worked example",
        description:
          "Calculate the client price, the agent's earnings, and the rep commission for a cost-plus scenario; then rerun the same package as a fiduciary model and compare who ends up ahead.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "In cost-plus the firm buys at trade (say 40% off list) and adds a markup (say 30%): client price = trade x 1.30, and the firm keeps the markup spread. The rep earns a commission (5-15%) from the manufacturer, invisible to the buyer. In the fiduciary model all trade discounts pass to the owner and the agent earns only a disclosed fee (3-6% of FF&E value). The owner usually pays less under fiduciary on large packages; the firm earns transparently rather than on the spread.",
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-7-2",
        title: "Cumulative interleave — connect L6 and L7",
        description:
          "Explain how a brand's approved-supplier list (L6) eliminates competitive bidding, and why that makes the fiduciary model more, not less, important for the owner (L7).",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "When the brand mandates an approved supplier, there is no competitive bid to discipline price, so the owner can't rely on the market to keep the agent honest. A fiduciary agent passes all discounts through and earns only a disclosed fee, removing the incentive to inflate product price — exactly the protection the owner loses when bidding is off the table.",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-7-recall",
        title: "Recall: who earns what?",
        description:
          "Pick the right pricing model and the right trade-price math, and explain each. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-fee",
              prompt:
                "A purchasing agent on a 180-room hotel passes all trade discounts to the owner and bills a disclosed 4% of the $2,500,000 FF&E value. What model is this, and the fee?",
              options: [
                { id: "a", label: "Principal/markup — agent earns ~$875,000" },
                { id: "b", label: "Fiduciary/disclosed-fee — agent earns $100,000" },
                { id: "c", label: "Management fee — 15% of trade value ($375,000)" },
                { id: "d", label: "Cost-plus — 35% markup on each item" },
              ],
              correctOptionId: "b",
              rubric:
                "Fiduciary/disclosed-fee: all discounts pass to the client and the sole compensation is the disclosed fee. 4% x $2.5M = $100,000.",
            },
            {
              id: "q-trade",
              prompt:
                "A lounge chair lists at $1,200. A firm buys at 40% off list (trade), then adds a 30% cost-plus markup. What does the client pay?",
              options: [
                { id: "a", label: "$840 — trade only, no markup" },
                { id: "b", label: "$936 — trade price plus 30% markup" },
                { id: "c", label: "$1,092 — 30% markup on list" },
                { id: "d", label: "$1,200 — client pays list" },
              ],
              correctOptionId: "b",
              rubric:
                "Trade = $1,200 x 0.60 = $720; client = $720 x 1.30 = $936. The markup applies to the trade (net) price, not the list price.",
            },
          ],
        },
        modelAnswer:
          "Fiduciary = discounts pass to the client, agent earns the disclosed fee (4% x $2.5M = $100k). Trade math: $1,200 less 40% = $720, plus 30% markup = $936.",
        estimatedMinutes: 5,
      },
      {
        id: "fd-task-7-3",
        title: "Interview a design professional",
        description:
          "Ask a designer or purchasing agent about their pricing model and the client pushback they get. Compare their language and framing to this lesson's categories.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-7-4",
        title: "The transparency gap",
        description:
          "Elaborative interrogation: why have many designers historically not disclosed trade prices, and why has hospitality procurement evolved toward full transparency? Explain the structural market difference that drives the divergence.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-8",
    slug: "budget",
    order: 8,
    title: "The Budget That Quietly Grows (Money, Part 2)",
    subtitle: "Three numbers about the same chairs: spec, quoted, approved, actual — and the landed cost in between",
    description:
      "How an FF&E budget is built from the per-key anchor through hard and soft costs; the full landed-cost stack adding 15-35%+ over bare product price; the four states every budget line lives in (spec, quoted, approved, actual) and the two structural reasons actual drifts up; contingency, value engineering, deposit mechanics, payment terms, and tariff/freight as live budget risks (flagged as dated and volatile).",
    learningGoals: [
      "Build an FF&E budget from the per-key number and split hard vs soft costs",
      "Describe the landed-cost stack and estimate a rough total from FOB",
      "Name the four budget states and explain why actual ends up above approved",
      "Apply contingency and value engineering at the correct phase",
      "Treat tariff and freight figures as volatile and know where to re-verify",
    ],
    contentFile: "fohlio-domain-8-budget.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-8-1",
        title: "Build a landed-cost estimate",
        description:
          "90-unit Vietnam-sourced lounge chair at $620 FOB. Apply the rough landed-cost layers from the lesson (freight, tariff, brokerage, warehousing, install). Compare the landed total to the bare product total. Then double the tariff rate and recalculate. From memory, explain the landed-cost concept.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Apply the stack on top of $620 FOB: freight, ~20% Vietnam tariff, brokerage, warehousing, delivery/install — roughly +40-55%, landing each chair near $870-$960. Across 90 units the landed total runs well above 90 x $620. Doubling the tariff adds another ~20% of FOB per unit. The concept: the bare (FOB) price always understates true cost by at least 15-35%, and tariffs make it worse.",
        estimatedMinutes: 20,
      },
      {
        id: "fd-task-8-2",
        title: "Cross-lesson budget scenario (L1 + L3 + L5 + L8)",
        description:
          "A 60-room midscale hotel; the contractor quotes $600k furniture-only. (a) Is the number plausible vs per-key benchmarks? (b) what real total should the owner's rep anticipate after soft costs? (c) is value engineering still feasible and what is the correct timing? (d) what does $600k imply for total development cost using the 8-15% FF&E share?",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) $600k / 60 rooms = $10k/key — plausible for midscale. (b) After soft costs (freight, taxes, install, PM, contingency) the loaded number is meaningfully higher, often +20-35%. (c) VE is feasible only if done during design; doing it at purchase blows the schedule. (d) If FF&E is ~8-15% of total dev cost, $600k implies roughly $4M-$7.5M total development.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-8-recall",
        title: "Recall: which number is which?",
        description:
          "Identify the four budget states and a landed-cost result, and explain. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-states",
              prompt:
                "Dana specs a chair at $480. The RFQ comes back $540. The owner approves $540. The paid invoice is $580 (the quote had expired). Which mapping is right?",
              options: [
                { id: "a", label: "$480 Spec / $540 Quoted / $540 Approved / $580 Actual" },
                { id: "b", label: "$480 Quoted / $540 Spec / $540 Approved / $580 Actual" },
                { id: "c", label: "$480 Actual / $540 Approved / $540 Quoted / $580 Spec" },
                { id: "d", label: "$480 Approved / $540 Actual / $540 Spec / $580 Quoted" },
              ],
              correctOptionId: "a",
              rubric:
                "Spec = Dana's pre-market estimate ($480); Quoted = the real RFQ price ($540); Approved = the owner sign-off ($540); Actual = the paid invoice ($580, drifted up because the quote expired).",
            },
            {
              id: "q-landed",
              prompt:
                "A dresser is $900 FOB (Vietnam). Add freight ~12%, tariff ~20%, brokerage ~4%, inland ~4%, warehousing ~5%, delivery/install ~10%. Roughly the landed cost and % over FOB?",
              options: [
                { id: "a", label: "~$900 — 0% over FOB" },
                { id: "b", label: "~$1,035 — ~15% over FOB" },
                { id: "c", label: "~$900 — landed equals FOB" },
                { id: "d", label: "~$1,395 — ~55% over FOB" },
              ],
              correctOptionId: "d",
              rubric:
                "The layers sum to roughly +55%: 900 + 108 + 180 + 36 + 36 + 45 + 90 ≈ $1,395. The bare FOB price always understates true landed cost — here by about 55%.",
            },
          ],
        },
        modelAnswer:
          "States: spec=$480 (estimate), quoted=$540 (RFQ), approved=$540 (sign-off), actual=$580 (paid, drifted up). Landed: ~$1,395, about 55% over the $900 FOB once the full stack is applied.",
        estimatedMinutes: 5,
      },
      {
        id: "fd-task-8-3",
        title: "Real-tariff drill",
        description:
          "Go to ustr.gov or hts.usitc.gov and find the current tariff for a specific furniture HTS code (Chapter 94 upholstered wooden seats). Report the HTS code, MFN base duty, any Section 301/232 additions for China-origin goods, and the effective stacked rate. (Rates change; this is why AI can't answer it.)",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-8-4",
        title: "Why is contingency structured this way?",
        description:
          "Elaborative interrogation: name three structural differences (not just 'hotels are bigger') that justify a higher hospitality contingency vs residential. Explain why a contingency reserve is not poor planning, and why removing it to hit a headline number makes things worse.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 14,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-9",
    slug: "vendors",
    order: 9,
    title: "Vendors, Manufacturers, Reps and Sources",
    subtitle: "Marco calls Tomás, and Tomás calls Greta — how the supply side actually works",
    description:
      "The supply side in depth: named contract furniture manufacturers and overseas factories; custom millwork as the longest-lead highest-risk category; the manufacturer's rep model (independent, multi-line, commission-only, free to the buyer); dealers, showrooms, distributors, and the major trade shows; the domestic vs import sourcing calculus under MOQ, lead time, and tariffs; vendor scorecards as compound intelligence; and GPOs vs project FF&E.",
    learningGoals: [
      "Name the major contract furniture manufacturers and what distinguishes them from overseas sources",
      "Explain the manufacturer's rep model: independent, multi-line, commission-only, free to the buyer",
      "Describe the roles of dealers, showrooms, and distributors",
      "Apply the domestic vs import sourcing decision (cost, MOQ, lead time, tariff exposure)",
      "Distinguish a GPO from project FF&E procurement and where each fits",
    ],
    contentFile: "fohlio-domain-9-vendors.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-9-1",
        title: "Map the supply chain for a real product",
        description:
          "Visit a real manufacturer's site (Kimball Hospitality, Bernhardt Contract, OFS, or KI). Find a guestroom product; describe their channel model (rep/dealer/direct); note whether lead time or MOQ is shown publicly; identify which channel type fits. From memory, define what a manufacturer's rep is.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Most contract manufacturers sell through independent reps and contracted dealers rather than direct; many publish 'find a rep' pages and rarely post MOQ/lead time publicly. A manufacturer's rep is an independent, commission-only salesperson who carries multiple non-competing lines in a territory and whose core job is getting products specified into designers' drawings — paid by the maker, free to the buyer.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-9-2",
        title: "Cross-lesson sourcing analysis (L2 + L6 + L8 + L9)",
        description:
          "150-room upper-upscale hotel. Option A: Vietnam $1,100 FOB, MOQ 50, 21-week total lead. Option B: US $1,480, MOQ 24, 12-week lead. (a) landed cost comparison; (b) schedule buffer and risk; (c) Marriott brand-standard impact on A vs B; (d) how Marco frames the decision for the owner's rep as the client's advocate.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Option A's $1,100 FOB grows ~40-55% landed (tariff + freight + stack), narrowing or erasing the gap with US $1,480. (b) 21 weeks leaves less buffer against a fixed opening; 12 weeks is safer. (c) If the brand standard names an approved supplier, A may be off the table unless pre-approved. (d) Marco frames it as landed cost + schedule risk + compliance, not just unit price — certainty of delivery often beats marginal savings.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-9-recall",
        title: "Recall: who does what on the supply side?",
        description:
          "Match each supply-side actor to what they actually do. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "v1", term: "Manufacturer's rep", definition: "Independent, commission-only; carries many non-competing lines; gets product specified" },
            { id: "v2", term: "Contract furniture manufacturer", definition: "Makes the product at scale; sets list price; sells to trade; enforces MOQ" },
            { id: "v3", term: "Dealer", definition: "Contracted reseller (esp. office/contract); local quoting, service, install" },
            { id: "v4", term: "Distributor", definition: "Carries stock for faster fulfillment of standard items" },
            { id: "v5", term: "GPO (Avendra)", definition: "Aggregates recurring OS&E spend across many properties for volume discounts" },
            { id: "v6", term: "3PL / FF&E logistics firm", definition: "Receives, warehouses, delivers room-by-room and installs white-glove" },
          ],
        },
        modelAnswer:
          "Rep = commission-only multi-line salesperson who gets product specified; manufacturer = makes it and sets list/MOQ; dealer = contracted reseller; distributor = stock for speed; GPO = aggregates operational spend; 3PL = receives/warehouses/installs.",
        estimatedMinutes: 4,
      },
      {
        id: "fd-task-9-3",
        title: "Find a real rep",
        description:
          "Go to manaonline.org or a manufacturer's 'find a rep' page and locate a real manufacturer's rep covering your region in hospitality or contract furniture. Report the lines they carry, territory, and specialization.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-9-4",
        title: "Why does the rep model persist?",
        description:
          "Elaborative interrogation: name three structural reasons the rep model creates value a digital catalog or direct-to-manufacturer platform cannot replicate. What would have to change for the model to become less necessary, and do those conditions exist today?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 14,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-10",
    slug: "submittals",
    order: 10,
    title: "RFQs, Submittals and Samples",
    subtitle: "The paperwork that proves the chair is what you think it is",
    description:
      "Before a purchase order goes out, vendors have to prove their product matches the spec. The two bid documents (RFQ for a defined spec, RFP for an open one), the formal submittal process (product data, shop drawings, physical samples, returning Approved / Approved as Noted / Revise & Resubmit / Rejected), the CFA cutting-for-approval sample that creates a defensible dye-lot record, the distinct role of RFIs, and the two approval loops that run in parallel on every project.",
    learningGoals: [
      "Distinguish an RFQ (price on a defined spec) from an RFP (fuller proposal when spec is open)",
      "Explain what a construction submittal is and what the four review outcomes mean",
      "Describe what a CFA sample is and what dispute it prevents",
      "Distinguish an RFI (resolves ambiguity) from a submittal (confirms conformance)",
      "Name the two approval loops and why conflating them is a failure mode",
    ],
    contentFile: "fohlio-domain-10-submittals.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-10-1",
        title: "Sort these situations",
        description:
          "Five scenarios; assign the correct document (RFQ, RFP, submittal, RFI, or CFA sample) to each, and explain in one sentence why.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "RFQ = price on an already-defined spec; RFP = fuller proposal when the approach is open; submittal = the vendor proving a product conforms before fabrication; RFI = a question to resolve an ambiguous or conflicting spec; CFA sample = a swatch cut from the actual production run, approved to prevent dye-lot disputes at delivery.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-10-2",
        title: "Explain the two loops to a new colleague",
        description:
          "Write 3-4 sentences explaining Loop A (designer/owner) and Loop B (designer-or-GC/vendor) to someone new, including what each catches and one example of a failure if either is skipped.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "Loop A is design sign-off: the designer presents selections to the owner (and brand, on flagged hotels) for approval, phase by phase — it catches 'the owner didn't want this.' Loop B is conformance: the vendor provides product data, shop drawings, and CFA samples to prove the item matches the spec — it catches 'the product isn't what we specified.' Skip Loop A and you build the wrong design; skip Loop B and the wrong product ships.",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-10-3",
        title: "The approval gap",
        description:
          "Recall a personal purchase experience (custom furniture, a renovation, a big online order). Map it to the FF&E submittal process: identify the equivalent of the CFA and the designer/vendor roles, and explain what the absence of a formal approval step costs at hotel scale.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-10-4",
        title: "Why four outcomes, not two?",
        description:
          "Elaborative interrogation: why must 'Approved as Noted' exist as a separate category? What would collapsing to two options break? Why does 'Rejected' differ from 'Revise and Resubmit'?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-11",
    slug: "procurement",
    order: 11,
    title: "From a Quote to Goods on the Dock",
    subtitle: "The long wait, the active chase, and the one inspection nobody skips twice",
    description:
      "The full post-PO pipeline: the binding deposit and why submittal approval precedes it; expediting as active factory-chasing; lead times that set the project clock; the freight, customs, and landed-cost stack; the receiving inspection as the single most commonly skipped and most expensive logistics failure; room-by-room white-glove installation with the model room first; and how actual sourcing data from a closed project feeds back into the library.",
    learningGoals: [
      "Explain what a purchase order commits to and why the deposit follows submittal approval",
      "Describe expediting and what happens when nobody does it",
      "Name the components of the landed-cost stack and how they add to FOB",
      "Explain why the receiving inspection is the most critical logistics failure point",
      "Describe the model-room-first install sequence and why it exists",
    ],
    contentFile: "fohlio-domain-11-procurement.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-11-1",
        title: "Map the failure modes",
        description:
          "Three scenarios (a COM fabric tracking gap / a partial receiving inspection / no project debrief). For each, identify the phase, the discipline that would catch it, and the schedule or cost consequence if it goes uncaught until install.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "COM gap: caught during expediting (the fabric must reach the factory on time) — if missed, the frame waits and the lead time slips. Partial receiving inspection: caught at receiving — if skipped, damage surfaces on install day with no time to reorder. No debrief: caught at closeout — if skipped, the next project re-learns the same lessons and the library doesn't compound.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-11-2",
        title: "The cumulative picture (L3 + L8 + L10 + L11)",
        description:
          "Trace 120 custom lounge chairs at $850 FOB from Vietnam: the deposit amount, the lead-time range, two landed-cost additions (with % impact), what the receiving report contains, and the Lesson 10 step that must precede the wire.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "Deposit ≈ 50% of the order on PO. Lead time: production 30-90 days + ~3-5 weeks ocean transit (overseas total often 18-24 weeks). Landed additions: ~20% Vietnam tariff and ~12% freight, plus brokerage/warehousing/install — landing each chair ~40-55% over $850. The receiving report records quantity, condition, and finish vs the approved CFA. The step that must precede the wire/PO: submittal + CFA approval (Lesson 10).",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-11-recall",
        title: "Recall: order the procurement pipeline",
        description:
          "Put the steps from approved quote to installed furniture in the right order. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "flow-order",
        widgetConfig: {
          prompt: "Order the steps Marco and Reggie follow to turn an approved spec into installed, signed-off furniture.",
          steps: [
            { id: "s1", label: "Issue RFQ to shortlisted vendors", detail: "Send the defined spec to 3-5 vendors for pricing" },
            { id: "s2", label: "Compare quotes and select the vendor", detail: "Price, lead time, track record — the shortest quote doesn't always win" },
            { id: "s3", label: "Issue the PO — deposit paid", detail: "Binding; the deposit funds materials; submittal/CFA approval must precede it" },
            { id: "s4", label: "Expedite — track factory production", detail: "Catch discontinued items and slippage before they become crises" },
            { id: "s5", label: "Freight and customs clearance", detail: "A forwarder handles transit, brokerage and duty; adds 6-25%" },
            { id: "s6", label: "Receive and inspect at the warehouse", detail: "Check qty/condition/finish vs the approved CFA; the #1 costliest skip" },
            { id: "s7", label: "Model room — owner & brand sign-off", detail: "One room first; changes here are cheap" },
            { id: "s8", label: "White-glove install, room by room", detail: "Pre-barcoded to room; specialist crew" },
            { id: "s9", label: "Punch list and closeout", detail: "Resolve defects; hand over warranties, FR certs, asset records" },
          ],
          lockFirst: true,
          lockLast: false,
        },
        modelAnswer:
          "RFQ -> compare & select -> PO (deposit) -> expedite -> freight & customs -> receive & inspect -> model room sign-off -> white-glove install -> punch list & closeout. The model room comes BEFORE full install, and expediting is an active phase, not a passive wait.",
        estimatedMinutes: 5,
      },
      {
        id: "fd-task-11-3",
        title: "The expediting problem",
        description:
          "Recall a personal waiting experience (a delayed order, a contractor, a custom build). Map it to expediting (no-news-is-good-news vs active follow-up). Quantify the cost of finding out late vs early in that situation, and explain why AI can't reconstruct your answer.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-11-4",
        title: "Why does the model room exist as a separate step?",
        description:
          "Elaborative interrogation: if both approval loops from Lesson 10 closed cleanly, why is the model room still necessary? What specific failure does it prevent? If it reveals a lighting/finish conflict, who bears the cost and why?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 14,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-12",
    slug: "approvals",
    order: 12,
    title: "Sign-offs and the Paper Trail",
    subtitle: "Three people in a model room, and why nothing ships without a signature",
    description:
      "The two approval loops in full: design sign-off (designer to owner, plus the brand on flagged hotels, with a model/mock-up room before full production) and the submittal process (product data, shop drawings, CFA samples returning Approved / Approved as Noted / Revise & Resubmit / Rejected). The punch list and deficiency log, the closeout/handover package, and why the audit trail matters when disputes arise. Roles and accountability across owner, brand, designer, GC, and vendor.",
    learningGoals: [
      "Distinguish the design-approval loop from the submittal loop and why confusing them is expensive",
      "Explain what a model room is for and why flagged hotels require one before mass production",
      "Name the four submittal review actions and what happens after each",
      "Describe a punch list, who owns each item, and who signs off last",
      "List what goes into a closeout/handover package and why the asset records matter",
    ],
    contentFile: "fohlio-domain-12-approvals.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-12-1",
        title: "Decision walk: submittal actions and what follows",
        description:
          "Work through the decision-tree: a vendor returns a submittal; choose an action and follow it to its outcome. Then take the second branch — the owner wants a change after sign-off — and reason about the cost of post-sign-off changes (production restarts, fees, schedule).",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "decision-tree",
        widgetConfig: {
          rootId: "root",
          nodes: {
            root: {
              id: "root",
              question:
                "A vendor returns a submittal for a custom headboard. You review the product data and shop drawings. What is your action?",
              options: [
                { label: "Approved", nextNodeId: "approved" },
                { label: "Approved as Noted", nextNodeId: "asnoted" },
                { label: "Revise and Resubmit", nextNodeId: "revise" },
                { label: "Rejected", nextNodeId: "rejected" },
              ],
            },
            approved: {
              id: "approved",
              question:
                "Correct — it conforms; production begins. Three days later the owner wants the height changed 4 inches; production has started. What now?",
              options: [
                {
                  label: "Tell the owner it's too late",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "The owner funds the project and can request a change. Your job is to quantify what it costs now (cancellation/re-tooling/schedule), not to refuse.",
                  },
                },
                {
                  label: "Quantify the cost, then let the owner decide",
                  outcome: {
                    kind: "correct",
                    explanation:
                      "Right. Surface cancellation fees, re-tooling, restart lead time and schedule impact; the timestamped sign-off sets the baseline, and the owner decides with real numbers.",
                  },
                },
                {
                  label: "Stop production immediately and wait",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Right impulse, premature. Get the stop/restart cost first, then advise the owner — some factories charge restart fees on day one.",
                  },
                },
              ],
            },
            asnoted: {
              id: "asnoted",
              question:
                "A conditional pass — the vendor must incorporate the stated correction before proceeding. The vendor ships at the original (uncorrected) height. Who holds the risk?",
              options: [
                {
                  label: "The designer",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "No — the correction was binding and recorded with a timestamp. The vendor fabricated out of conformance, so it is the vendor's liability.",
                  },
                },
                {
                  label: "The vendor",
                  outcome: {
                    kind: "correct",
                    explanation:
                      "Correct. 'Approved as Noted' is conditional; the record shows the annotation, time and author. The vendor proceeded without the correction and remedies it at their cost.",
                  },
                },
              ],
            },
            revise: {
              id: "revise",
              question:
                "A material deficiency — halt until a corrected submittal is reviewed. The vendor asks to start the frame while the finish detail is corrected. You say?",
              options: [
                {
                  label: "Yes, the frame is independent",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Risky. Revise-and-Resubmit flags the whole submittal; a partial start creates a grey zone if the resubmission changes something affecting the frame. Only with explicit written independence.",
                  },
                },
                {
                  label: "No work proceeds until a new action issues",
                  outcome: {
                    kind: "correct",
                    explanation:
                      "Correct. Hold the line; the cost of waiting is smaller than the cost of redoing fabricated work.",
                  },
                },
              ],
            },
            rejected: {
              id: "rejected",
              question:
                "Fundamentally non-conforming — the vendor needs a different approach, not a patch. Next step?",
              options: [
                {
                  label: "Issue a new RFQ / new approach",
                  outcome: {
                    kind: "correct",
                    explanation:
                      "Yes. Rejected is not Revise — update the procurement schedule for the restart and re-bid if needed.",
                  },
                },
                {
                  label: "Wait for the vendor to fix it",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Without a clear brief on what 'fixed' means, you'll get another non-conforming submittal. Clarify the requirement; new RFQ if needed.",
                  },
                },
              ],
            },
          },
        },
        modelAnswer:
          "Approved -> proceed as submitted. Approved as Noted -> proceed only after the binding correction (vendor holds the risk if they skip it). Revise & Resubmit -> halt, no partial starts, fresh review. Rejected -> non-conforming, new approach/RFQ. A post-sign-off owner change is allowed, but you must quantify cancellation/re-tooling/schedule cost from the timestamped record first.",
        estimatedMinutes: 6,
      },
      {
        id: "fd-task-12-2",
        title: "Map a dispute to the paper trail",
        description:
          "Pick one dispute scenario (a price changed after approval, a dye-lot mismatch, an item the owner says they never approved). Explain which document resolves it, what it must contain, and who bears the cost depending on what the record shows.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "A dye-lot mismatch is resolved by the CFA approval record (the cut from the production run that was signed off); if delivered goods differ from the approved CFA, the vendor bears it. 'I never approved that' is resolved by the timestamped sign-off / history log. A price change after approval is resolved by the approved quote vs the invoice. In each case the record with a timestamp and author decides who pays.",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-12-3",
        title: "Interview the paper trail",
        description:
          "Recall a real situation in your own work where something agreed verbally or by email was later disputed. Write what record existed and what a structured paper trail would have contained to settle it without an argument.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-12-4",
        title: "Why are the two loops separate by design?",
        description:
          "Elaborative interrogation: why aren't the two loops combined into one process? What would go wrong if owners signed off before vendor submittals were reviewed, or if submittals went straight to the owner? What is each loop actually checking, and why does each need different expertise?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-13",
    slug: "tools",
    order: 13,
    title: "Why It Goes Wrong — and the Tools That Catch It",
    subtitle: "The discontinued finish, the tariff surprise, and the spreadsheet that can't keep up",
    description:
      "The six recurring FF&E pain points (lead times, discontinued finishes, tariff/freight volatility, multi-property consistency, version chaos in Excel, the cost of a missed opening). The Excel+email+PDF incumbent and where it breaks (~100 items / 3+ projects). The five tool categories and honest one-line positioning for the major tools (Fohlio, Programa, Studio Designer, Design Manager, Procore and others). The real Fohlio-vs-Procore distinction. And how connected data catches a discontinued finish before the PO ships — closing the $40k gap from Lesson 1.",
    learningGoals: [
      "Name and explain the six recurring FF&E pain points",
      "State the practical switch point where Excel breaks and why",
      "Know the five tool categories and one honest positioning sentence for each major tool",
      "Explain why Fohlio and Procore serve different tracks on the same project",
      "Describe how connected spec data catches a discontinued finish before the PO ships",
    ],
    contentFile: "fohlio-domain-13-tools.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-13-1",
        title: "Map a pain point to a real tool category",
        description:
          "Pick one of the six pain points. Explain: (a) exactly how it manifests in a real project; (b) which tool category addresses it and why; (c) why Excel+email+PDF fails to catch it.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Example — discontinued finish: it manifests when a supplier drops a fabric mid-order and substitutes a near-match; an FF&E spec/procurement tool that links the spec line to the live vendor record can flag the change before the PO ships; Excel+email+PDF fails because the spreadsheet has no live connection to the vendor and the change lives in an inbox nobody re-reads.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-13-2",
        title: "Cumulative check (L1 + L8 + L9 + L12 + L13)",
        description:
          "From memory: (a) when did the $40k mistake arise vs surface? (b) the two structural budget leaks from L8; (c) what a vendor scorecard tracks; (d) the difference between 'Approved' and 'Approved as Noted'; (e) the practical Excel switch point.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Arose during expediting (silent substitution), surfaced at receiving. (b) Landed-cost surprises and scope creep. (c) Spend/PO amount, lead time, quality, payment terms — vendor reliability over time. (d) 'Approved' = proceed as submitted; 'Approved as Noted' = proceed only after a binding correction. (e) Excel breaks past ~100 items, 3+ projects, or multiple editors.",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-13-3",
        title: "The real sales call",
        description:
          "Write the 3-4 sentences you would actually say to a prospect who reports version-chaos on a 12-project, 4-person FF&E team. In your own voice, no bullet points.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-13-4",
        title: "Why the categories are where they are",
        description:
          "Elaborative interrogation: pick two adjacent tool categories. Explain why they are separate rather than combined, what each category's user cares about that the other does not, and why combining them would make both worse.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-14",
    slug: "capstone",
    order: 14,
    title: "The Building Opens: One Chair, Every Actor",
    subtitle: "One chair through every phase and every actor — and the loop that starts again",
    description:
      "The synthesis capstone. Traces a single chair through every phase and every actor from the whole course; puts three property types side by side (luxury flag, select-service brand rollout, independent boutique) to show how scale, standard strictness, and buyer structure change the same journey; closes with the FF&E reserve and the next PIP cycle restarting the loop, institutional knowledge compounding, and what a GTM person can now say to any prospect.",
    learningGoals: [
      "Trace a single piece of furniture through every phase and every actor in the course",
      "Compare how the FF&E journey differs across luxury flag, brand rollout, and independent property types",
      "Explain why the project doesn't end at opening: the FF&E reserve, the next PIP, OS&E replenishment",
      "Articulate the compounding value of institutional knowledge across projects",
      "Know what a GTM person can now say to any prospect in a discovery conversation",
    ],
    contentFile: "fohlio-domain-14-capstone.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-14-1",
        title: "Trace a different chair through the full chain",
        description:
          "Pick a real hotel and one piece of furniture in it. Write a 12-15 step trace through the full FF&E process from budget decision to punch list, naming the actor at each step. Mark two steps where a real mistake would most likely happen and why.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "A strong trace names the actor at each step: owner/brand set scope and standard -> designer specifies -> library/takeoff -> budget -> RFQ to vendor via rep -> submittal + CFA -> PO + deposit -> expediting -> manufacturing -> freight/customs -> receiving inspection -> model room sign-off -> install -> punch list -> closeout. The two highest-risk steps are usually the spec-to-shipment gap (silent substitution) and receiving (skipped inspection).",
        estimatedMinutes: 22,
      },
      {
        id: "fd-task-14-2",
        title: "Self-check: the three property types",
        description:
          "Without referring back: describe how a Four Seasons, a Courtyard by Marriott, and an independent boutique differ on (a) who does the buying; (b) how brand-standard approval works; (c) the nature of PIP risk.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Luxury flag and brand rollout typically use a dedicated purchasing agent; the independent boutique owner often buys solo. (b) The flag and the rollout run brand approval against a strict standard (model rooms, golden samples); the independent has no brand to satisfy. (c) PIP risk is high for the flagged properties (audits, deadlines, flag loss) and essentially absent for the independent — its risk is budget and dropped threads.",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-14-recall",
        title: "Recall: match each actor to their core job",
        description:
          "Match each FF&E value-chain actor to what they actually do. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "c1", term: "Interior designer / specifier", definition: "Chooses every item, finish & dimension; specifies, doesn't buy" },
            { id: "c2", term: "FF&E purchasing agent", definition: "Budgets, bids, issues POs, expedites, owns logistics" },
            { id: "c3", term: "Brand / flag", definition: "Dictates the standard; audits; issues PIPs" },
            { id: "c4", term: "Owner / developer", definition: "Owns the building and the FF&E budget; approves & pays" },
            { id: "c5", term: "Manufacturer's rep", definition: "Commission-only; gets product specified across many lines" },
            { id: "c6", term: "3PL / installer", definition: "Receives, warehouses, delivers & installs white-glove" },
          ],
        },
        modelAnswer:
          "Designer specifies (doesn't buy); purchasing agent budgets/bids/buys/expedites; brand dictates and audits the standard; owner owns the budget and pays; rep gets product specified for commission; 3PL receives/warehouses/installs.",
        estimatedMinutes: 4,
      },
      {
        id: "fd-task-14-3",
        title: "The prospect call you weren't ready for before this course",
        description:
          "Find a real hotel in your city. Determine if it's flagged or independent. Estimate FF&E budget per key, describe the PIP process for that brand if applicable, identify the most likely procurement pain point, and write the first four discovery-call questions.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 20,
      },
      {
        id: "fd-task-14-4",
        title: "Why is this industry built this way?",
        description:
          "Elaborative interrogation: explain why the specifier/buyer split, parallel procurement, and FF&E reserves are rational structural choices, not inefficiencies, and what breaks if you remove each. Apply it to your own knowledge of your customer base.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 16,
      },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findUnique({
    where: { githubNickname: ADMIN_GITHUB_NICKNAME },
    select: { id: true },
  });

  if (!admin) {
    console.error(`Admin user "${ADMIN_GITHUB_NICKNAME}" not found. Run create-admin.ts first.`);
    process.exit(1);
  }

  const COURSE_TITLE = "How Buildings Get Furnished";
  const COURSE_SUBTITLE = "The real FF&E business — who buys, who builds, who sells, and where the money goes";
  const COURSE_DESCRIPTION =
    "A 14-lesson course on the real FF&E (Furniture, Fixtures & Equipment) and hospitality-furnishing industry the platform serves. Built on real-world research — real firms, real money, real process — and follows one specifier and the whole value chain through a hospitality project, from a $40k mistake to a hotel that opens on time. The industry is the spine; the software is a thin overlay.";

  await prisma.$transaction(
    async (tx) => {
      await tx.course.upsert({
        where: { id: COURSE_ID },
        update: {
          slug: COURSE_SLUG,
          title: COURSE_TITLE,
          subtitle: COURSE_SUBTITLE,
          description: COURSE_DESCRIPTION,
          status: "published",
          ownerId: admin.id,
        },
        create: {
          id: COURSE_ID,
          slug: COURSE_SLUG,
          title: COURSE_TITLE,
          subtitle: COURSE_SUBTITLE,
          description: COURSE_DESCRIPTION,
          status: "published",
          ownerId: admin.id,
        },
      });

      // Full reset: remove every existing lesson for this course (homework cascades via
      // onDelete: Cascade). Lesson ids are deterministic and re-created below; the rewrite
      // changed which slug sits at which position, so a clean wipe avoids id/slug collisions.
      // TaskSubmission rows are not FK-linked to lessons/tasks, so they are unaffected.
      await tx.lesson.deleteMany({ where: { courseId: COURSE_ID } });

      for (const lesson of LESSONS) {
        const contentHtml = await readFile(
          join(process.cwd(), "public", "lessons", lesson.contentFile),
          "utf-8",
        );

        const upsertedLesson = await tx.lesson.upsert({
          where: { courseId_slug: { courseId: COURSE_ID, slug: lesson.slug } },
          update: {
            order: lesson.order,
            title: lesson.title,
            subtitle: lesson.subtitle,
            description: lesson.description,
            learningGoals: lesson.learningGoals,
            contentType: "html",
            contentHtml,
            isPublished: lesson.isPublished,
          },
          create: {
            id: lesson.id,
            courseId: COURSE_ID,
            slug: lesson.slug,
            order: lesson.order,
            title: lesson.title,
            subtitle: lesson.subtitle,
            description: lesson.description,
            learningGoals: lesson.learningGoals,
            contentType: "html",
            contentHtml,
            isPublished: lesson.isPublished,
          },
        });

        await tx.homeworkTask.deleteMany({
          where: { lessonId: upsertedLesson.id },
        });
        for (const task of lesson.homework) {
          await tx.homeworkTask.create({
            data: {
              id: task.id,
              lessonId: upsertedLesson.id,
              title: task.title,
              description: task.description,
              category: task.category,
              submissionType: task.submissionType,
              order: task.order,
              widgetId: task.widgetId ?? null,
              widgetConfig: task.widgetConfig
                ? (JSON.parse(JSON.stringify(task.widgetConfig)) as object)
                : undefined,
              modelAnswer: task.modelAnswer ?? null,
              estimatedMinutes: task.estimatedMinutes ?? null,
            },
          });
        }
      }
    },
    { timeout: 60_000, maxWait: 10_000 },
  );

  console.log("Fohlio Domain course seeded successfully.");
  console.log(`Course slug: ${COURSE_SLUG}`);
  console.log(`Lessons published: ${LESSONS.filter((l) => l.isPublished).length}/${LESSONS.length}`);
  const totalTasks = LESSONS.reduce((acc, l) => acc + l.homework.length, 0);
  const widgetTasks = LESSONS.reduce(
    (acc, l) => acc + l.homework.filter((t) => t.submissionType === "widget").length,
    0,
  );
  console.log(`Homework tasks: ${totalTasks} (widget recall tasks: ${widgetTasks})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
