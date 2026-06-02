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
          "Picture a hotel guest room. Sort each item into the segment it belongs to: FF&E, OS&E, Finishes, or Architectural. Use the 'shake the building' test — what falls out is FF&E, what's bolted in is Architectural, what's consumable is OS&E, what's a surface is Finishes. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "categorize",
        widgetConfig: {
          prompt: "Sort each item from a hotel guest room into the correct segment.",
          categories: [
            { id: "ffe", label: "FF&E", hint: "Movable, durable, capitalized — falls out if you shake the building" },
            { id: "ose", label: "OS&E", hint: "Consumable / replaced often — an operating expense" },
            { id: "finishes", label: "Finishes", hint: "Applied surfaces — paint, tile, flooring" },
            { id: "arch", label: "Architectural", hint: "Part of the building structure / bolted in" },
          ],
          items: [
            { id: "i1", label: "Upholstered lounge chair", correctCategoryId: "ffe" },
            { id: "i2", label: "Writing desk", correctCategoryId: "ffe" },
            { id: "i3", label: "Bedside table lamp", correctCategoryId: "ffe" },
            { id: "i4", label: "Bath towels", correctCategoryId: "ose" },
            { id: "i5", label: "Drinking glasses", correctCategoryId: "ose" },
            { id: "i6", label: "Guest toiletries", correctCategoryId: "ose" },
            { id: "i7", label: "Carpet / flooring", correctCategoryId: "finishes" },
            { id: "i8", label: "Wall paint", correctCategoryId: "finishes" },
            { id: "i9", label: "Built-in closet millwork", correctCategoryId: "arch" },
            { id: "i10", label: "HVAC ducting", correctCategoryId: "arch" },
          ],
        },
        modelAnswer:
          "FF&E = movable durable goods (lounge chair, desk, lamp). OS&E = consumables replaced often (towels, glasses, toiletries) — an operating expense, not a capital asset. Finishes = applied surfaces (carpet, paint). Architectural = part of the building (built-in closet, HVAC). FF&E is durable and capitalized; OS&E is consumable, expensed, and has vastly more SKUs.",
        estimatedMinutes: 8,
      },
      {
        id: "fd-task-1-2",
        title: "Self-check on this chapter",
        description:
          "Recall the money anchors and the timeline of the $40k mistake, then explain in your own words. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-share",
              prompt:
                "Roughly what share of a hotel's total development cost is FF&E, and what is the approximate global hotel FF&E market size?",
              options: [
                { id: "a", label: "8-15% of development cost; ~$60B hotel FF&E market" },
                { id: "b", label: "30-40% of development cost; ~$5B market" },
                { id: "c", label: "1-3% of development cost; ~$500B market" },
                { id: "d", label: "50%+ of development cost; ~$60M market" },
              ],
              correctOptionId: "a",
              rubric:
                "FF&E is roughly 8-15% of total hotel development cost; the hotel FF&E market is on the order of $60B. The shell and core dominate the budget; FF&E is a meaningful minority, not the majority.",
            },
            {
              id: "q-timeline",
              prompt:
                "When did the $40k mistake arise, and when did it surface?",
              options: [
                { id: "a", label: "Arose at design; surfaced at design review" },
                { id: "b", label: "Arose in the gap between spec and shipment (silent substitution); surfaced at receiving/install" },
                { id: "c", label: "Arose at receiving; surfaced at closeout" },
                { id: "d", label: "Arose at the moodboard; surfaced at the RFQ" },
              ],
              correctOptionId: "b",
              rubric:
                "The finish was discontinued and silently substituted in the gap between specification and shipment, then surfaced at receiving/install — the most expensive moment to catch it.",
            },
          ],
        },
        modelAnswer:
          "FF&E is ~8-15% of total hotel development cost; the hotel FF&E market is roughly $60B. The $40k error arose in the gap between specification and shipment (a discontinued finish, silently substituted) and surfaced at receiving/install, when it was expensive to fix.",
        estimatedMinutes: 6,
      },
      {
        id: "fd-task-1-3",
        title: "Rebut the 'it's just shopping' framing",
        description:
          "A skeptic says: 'Why would a hotel need special software to buy its furniture — isn't that just shopping?' Pick the single strongest reason that framing is wrong, then justify it in your own words drawing on scale, the time gap, and the fixed opening date. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 4,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "'Buying hotel FF&E is just shopping.' Which is the strongest single reason that framing is wrong?",
          options: [
            { id: "a", label: "It combines scale (thousands of items, dozens of suppliers), a months-long time gap where specs go stale, and a fixed opening date with hard money at stake — so it is coordination under deadline, not a checkout." },
            { id: "b", label: "Hotel furniture is simply more expensive than consumer furniture." },
            { id: "c", label: "Hotels prefer to use software because it looks more professional to investors." },
            { id: "d", label: "There are no online stores that sell contract-grade furniture." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "The right answer captures all three forces at once: scale (thousands of SKUs across many suppliers), the time gap (a finish chosen on a moodboard can go stale or be discontinued over a months-long project), and the fixed opening date where a late or wrong item costs real money (~$15k/day). 'Shopping' is a single transaction; FF&E is keeping a living spec true across time, people, and suppliers.",
        },
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-1-4",
        title: "Why it's built this way",
        description:
          "Answer two reasoning questions about the industry's structure — the specifier/buyer split and the FF&E reserve — then explain each choice in your own words. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 12,
          questions: [
            {
              id: "q-split",
              prompt:
                "Why does the industry separate the designer who specifies from the agent who buys, instead of having one person do both?",
              options: [
                { id: "a", label: "The split avoids a conflict of interest and matches different skills — design judgment vs sourcing/logistics/fiduciary buying — at a scale one person can't cover." },
                { id: "b", label: "It is a legal requirement in every US state." },
                { id: "c", label: "Designers refuse to touch money for ethical reasons unrelated to the client." },
                { id: "d", label: "Manufacturers only sell to licensed buyers, never to designers." },
              ],
              correctOptionId: "a",
              rubric:
                "Specifying (design intent, aesthetics, performance) and buying (sourcing, negotiation, logistics, fiduciary duty to the owner) are different skills, and joining them creates a conflict of interest when a markup tempts the specifier. At hotel scale neither role is part-time work.",
            },
            {
              id: "q-reserve",
              prompt:
                "Why does a hotel keep an FF&E reserve (2-5% of revenue/year) rather than paying for renovations only when they happen?",
              options: [
                { id: "a", label: "FF&E wears out and brand standards force recurring refresh, so the reserve smooths a predictable, recurring cost instead of taking a large unbudgeted hit at renovation time." },
                { id: "b", label: "Tax law forbids paying for renovations out of operating cash." },
                { id: "c", label: "Reserves earn interest that fully funds the renovation by itself." },
                { id: "d", label: "Brands require the cash be held so they can seize it." },
              ],
              correctOptionId: "a",
              rubric:
                "FF&E is durable but not permanent; it wears and brands mandate periodic refresh (PIPs). 'Pay as you go' breaks because the bills arrive in large lumps on the brand's schedule, not the owner's cash flow — the reserve turns a lumpy, predictable expense into a steady set-aside.",
            },
          ],
        },
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
        title: "Sort the demand side outsiders collapse into one",
        description:
          "Outsiders treat 'the hotel' as a single buyer. It isn't. Sort each statement under the demand-side entity it describes: owner/REIT, brand/flag, management company, or franchisee. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "categorize",
        widgetConfig: {
          prompt: "Sort each statement under the demand-side entity it describes.",
          categories: [
            { id: "owner", label: "Owner / REIT", hint: "Owns the real estate and the FF&E budget" },
            { id: "brand", label: "Brand / flag", hint: "Franchises or manages; dictates standards; earns fees" },
            { id: "mgmt", label: "Management company", hint: "Runs the hotel day-to-day" },
            { id: "franchisee", label: "Franchisee", hint: "Licenses the flag for a specific property and funds the work" },
          ],
          items: [
            { id: "i1", label: "Holds the FF&E budget and signs off on capital spend", correctCategoryId: "owner" },
            { id: "i2", label: "A REIT that owns the building but never touches operations", correctCategoryId: "owner" },
            { id: "i3", label: "Writes the brand standards and issues the PIP", correctCategoryId: "brand" },
            { id: "i4", label: "Earns franchise / management fees, not FF&E margin", correctCategoryId: "brand" },
            { id: "i5", label: "Runs the front desk, housekeeping and day-to-day P&L", correctCategoryId: "mgmt" },
            { id: "i6", label: "Lives with the furniture every day and feels the wear first", correctCategoryId: "mgmt" },
            { id: "i7", label: "Licenses the flag for one property and pays for the renovation", correctCategoryId: "franchisee" },
            { id: "i8", label: "Must hit the brand's PIP deadline or risk losing the flag", correctCategoryId: "franchisee" },
          ],
        },
        modelAnswer:
          "Owner/REIT owns the building and the FF&E budget and approves capital spend. The brand/flag writes standards, issues PIPs, and earns fees (not FF&E margin). The management company runs operations and lives with the furniture. The franchisee licenses the flag for a specific property and funds the work under the brand's deadlines. The distinction matters because the brand defines 'done right,' the owner funds and approves, and the operator lives with it.",
        estimatedMinutes: 7,
      },
      {
        id: "fd-task-2-2",
        title: "Draw the chain for Dana's project",
        description:
          "Match each actor in the FF&E value chain to what flows through them or what they actually do. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "p1", term: "Owner / developer / REIT", definition: "Owns the building and the FF&E budget; money flows from here; approves and pays" },
            { id: "p2", term: "Brand / flag (Marriott, Hilton)", definition: "Franchises or manages; dictates the standard; earns fees" },
            { id: "p3", term: "Management company", definition: "Runs the hotel day-to-day and lives with the result" },
            { id: "p4", term: "Interior designer", definition: "Specifies every item, finish and dimension — does not buy" },
            { id: "p5", term: "Purchasing agent", definition: "Buys what the designer specified; paid a fiduciary fee or a markup" },
            { id: "p6", term: "Manufacturer's rep", definition: "Commission-only; paid by the maker, free to the buyer" },
          ],
        },
        modelAnswer:
          "Money flows from the owner, who holds the FF&E budget; the brand dictates the standard and earns fees; the management company operates the property; the designer specifies (not buys); the purchasing agent buys for a fee or markup; the rep is paid by the manufacturer, free to the buyer. The three client types: luxury flag (consistency), institutional owner (budget/replication), independent boutique (solo, speed).",
        estimatedMinutes: 6,
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
          "Pick the best account of what breaks when one party both specifies and buys, then justify it — and note how Grace, working solo, carries both roles' tension at once. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "What primarily breaks if the designer who specifies also owns purchasing (and keeps the markup)?",
          options: [
            { id: "a", label: "The spec stops being neutral: the specifier is now tempted to pick products that pay the best margin rather than what serves the owner — the fiduciary, markup-free model exists precisely to remove that temptation." },
            { id: "b", label: "Nothing breaks; combining the roles is simply more efficient and always cheaper for the owner." },
            { id: "c", label: "The designer would no longer be allowed to attend site visits." },
            { id: "d", label: "Manufacturers would refuse to ship because only buyers can place orders." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "When the specifier profits from the purchase, the spec quietly bends toward margin instead of the owner's interest. The fiduciary model (disclosed fee, trade discounts passed through) restores trust by removing the hidden incentive. Grace, working solo, feels both pulls at once — she must specify honestly and still get paid for the buying work — which is the same tension the two-party split resolves structurally.",
        },
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
          "Put the real FF&E project phases into the right order, from design intent to a furnished room. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "flow-order",
        widgetConfig: {
          prompt: "Order the phases of an FF&E project in the sequence the industry actually runs them (AIA vocabulary).",
          steps: [
            { id: "s1", label: "Programming", detail: "Define needs, room types, budget anchors" },
            { id: "s2", label: "Schematic Design (SD)", detail: "Look and feel; moodboards; rough direction" },
            { id: "s3", label: "Design Development (DD)", detail: "Specific products start getting selected" },
            { id: "s4", label: "Specification / CDs", detail: "Buyable spec sheets — model, finish, dimensions" },
            { id: "s5", label: "Budgeting / value engineering", detail: "Price the spec; trim to hit the number" },
            { id: "s6", label: "Bidding / RFQ", detail: "Get vendor pricing on the defined spec" },
            { id: "s7", label: "Purchase orders", detail: "Binding commitment; deposit; the clock starts" },
            { id: "s8", label: "Expediting", detail: "Actively chase the factory; catch substitutions" },
            { id: "s9", label: "Manufacturing & freight", detail: "Production, then ocean/inland transit and customs" },
            { id: "s10", label: "Receiving & inspection", detail: "Check qty/condition/finish vs the approved sample" },
            { id: "s11", label: "Delivery & install", detail: "Room-by-room white-glove installation" },
            { id: "s12", label: "Punch list & closeout", detail: "Resolve defects; hand over warranties and records" },
          ],
          lockFirst: true,
          lockLast: true,
        },
        modelAnswer:
          "Programming -> SD -> DD -> spec/CDs -> budget/VE -> bidding/RFQ -> PO -> expediting -> manufacturing & freight -> receiving & inspection -> install -> punch list & closeout. The visible phases are install/punch; spec, expediting and receiving are invisible from outside. Parallel-track pain: long lead times force POs before construction is finished.",
        estimatedMinutes: 6,
      },
      {
        id: "fd-task-3-2",
        title: "Cumulative self-check (L1 + L2 + L3)",
        description:
          "Closed-book recall across the first three lessons: lead-time ranges and why they force parallel tracks, plus the four segments. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-lead",
              prompt:
                "Which set of FF&E lead-time ranges is right, and why does overseas sourcing force parallel-track POs?",
              options: [
                { id: "a", label: "Domestic 6-10 wk, overseas 18-24 wk, custom 6-12 mo" },
                { id: "b", label: "Domestic 1-2 wk, overseas 4-6 wk, custom 8-10 wk" },
                { id: "c", label: "Domestic 6 mo, overseas 1 wk, custom 2 wk" },
                { id: "d", label: "All categories ship in under 30 days" },
              ],
              correctOptionId: "a",
              rubric:
                "Domestic 6-10 weeks, overseas 18-24 weeks, custom 6-12 months. Overseas lead times are longer than the construction time remaining, so POs must be placed in parallel with the build rather than after it.",
            },
            {
              id: "q-segments",
              prompt:
                "Which segment is the recurring operating expense (not a capitalized asset)?",
              options: [
                { id: "a", label: "FF&E" },
                { id: "b", label: "OS&E" },
                { id: "c", label: "Finishes" },
                { id: "d", label: "Architectural" },
              ],
              correctOptionId: "b",
              rubric:
                "OS&E (Operating Supplies & Equipment) is consumable and replaced often, so it is expensed as an operating cost — unlike FF&E, which is capitalized and depreciated.",
            },
          ],
        },
        modelAnswer:
          "Lead times: domestic 6-10 wk, overseas 18-24 wk, custom 6-12 mo; overseas lead times exceed the remaining construction time, so POs run parallel to the build. OS&E is the operating expense; FF&E/Finishes/Architectural are capital. The $40k mistake arose during expediting (silent substitution) and surfaced at receiving.",
        estimatedMinutes: 6,
      },
      {
        id: "fd-task-3-3",
        title: "The expediting gap",
        description:
          "Expediting is the active follow-up between PO and shipment. Sort each activity into what expediting actually covers versus what belongs to a different phase. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 4,
        widgetId: "categorize",
        widgetConfig: {
          prompt:
            "Sort each activity into 'Part of expediting (PO → shipment)' or 'Belongs to a different phase'.",
          categories: [
            { id: "exp", label: "Part of expediting", hint: "Active tracking between a placed PO and goods leaving the factory" },
            { id: "other", label: "Different phase", hint: "Specifying, approving, receiving, or installing — not the PO→shipment chase" },
          ],
          items: [
            { id: "i1", label: "Confirming the factory's production start date against the PO", correctCategoryId: "exp" },
            { id: "i2", label: "Chasing weekly status updates on a custom order in production", correctCategoryId: "exp" },
            { id: "i3", label: "Verifying the deposit cleared and the order is truly in queue", correctCategoryId: "exp" },
            { id: "i4", label: "Flagging a slipping ship date early enough to act", correctCategoryId: "exp" },
            { id: "i5", label: "Writing the original product specification", correctCategoryId: "other" },
            { id: "i6", label: "Approving the vendor's submittal / CFA", correctCategoryId: "other" },
            { id: "i7", label: "Inspecting goods on the receiving dock", correctCategoryId: "other" },
            { id: "i8", label: "Installing the furniture in the guest room", correctCategoryId: "other" },
          ],
        },
        modelAnswer:
          "Expediting is the active chase between a placed PO and the goods shipping: confirming production start, weekly status, deposit-cleared-so-it's-really-queued, and catching a slipping date early. Specifying, submittal approval, receiving inspection, and install are separate phases. The whole point is to replace 'no news is good news' with early warning while there is still time to act.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-3-4",
        title: "Why does lead time force parallel tracks?",
        description:
          "Pick the best explanation for why FF&E work runs as parallel tracks rather than one sequence, then justify it — covering mixed lead-time clocks and why even Grace's small project feels it. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "Why does long lead time force FF&E to run as parallel tracks instead of one strict sequence?",
          options: [
            { id: "a", label: "Items sit on different lead-time clocks (long-lead custom, mid-lead, quick domestic), so long-lead pieces must be specified and ordered early — in parallel with everything else — or they miss a fixed opening date." },
            { id: "b", label: "Parallel tracks are simply a project-management fashion with no real time driver." },
            { id: "c", label: "Manufacturers refuse to accept sequential orders." },
            { id: "d", label: "It lets the designer avoid making any decisions until the end." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "The driver is that lead times differ wildly. A 24-week custom item can't wait until short-lead items are settled; it has to be locked early and run concurrently. With three clocks running, sequencing them end-to-end would blow the opening date. Even Grace's 40 chairs face a small version: the long-lead item sets the critical path, so she must start it before the quick items. If domestic lead were 2 weeks for everything, the pressure to parallelize would mostly vanish.",
        },
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
          "A moodboard shows a single hero image of a lounge chair. Sort each attribute by whether you can reasonably read it from the image alone, or whether it is missing and must be pinned down before anything can be bought. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "categorize",
        widgetConfig: {
          prompt: "For a chair shown only as a moodboard image, sort each attribute: readable from the image, or missing (a buyable-spec field the agent still needs)?",
          categories: [
            { id: "have", label: "Readable from the image", hint: "You can reasonably infer it just by looking" },
            { id: "missing", label: "Missing — needed to buy", hint: "Cannot be bid, ordered or scheduled without it" },
          ],
          items: [
            { id: "i1", label: "General style / look", correctCategoryId: "have" },
            { id: "i2", label: "Rough product type (it's a lounge chair)", correctCategoryId: "have" },
            { id: "i3", label: "Approximate color family", correctCategoryId: "have" },
            { id: "i4", label: "Exact model number / SKU", correctCategoryId: "missing" },
            { id: "i5", label: "Finish / fabric code", correctCategoryId: "missing" },
            { id: "i6", label: "Exact dimensions", correctCategoryId: "missing" },
            { id: "i7", label: "Supplier / source", correctCategoryId: "missing" },
            { id: "i8", label: "Unit price", correctCategoryId: "missing" },
            { id: "i9", label: "Lead time", correctCategoryId: "missing" },
          ],
        },
        modelAnswer:
          "From an image you can read style, rough type, and a color family. You cannot know the exact model/SKU, finish code, dimensions, supplier/source, unit price, or lead time. Those missing fields are the purchasing agent's problem: nothing can be bid, ordered, or scheduled until each one is pinned down.",
        estimatedMinutes: 8,
      },
      {
        id: "fd-task-4-2",
        title: "Distinguish the documents",
        description:
          "Match each FF&E document to what it actually is. These get confused constantly — get the distinctions right. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "p1", term: "Tear sheet", definition: "One-page product summary for client presentation" },
            { id: "p2", term: "Cut sheet", definition: "Detailed dimensions/materials/install detail, often for custom items" },
            { id: "p3", term: "Spec sheet", definition: "Everything about one product: model, finish, price, warranties" },
            { id: "p4", term: "FF&E schedule", definition: "Project-wide tracker: vendor, qty, cost, lead time, status" },
            { id: "p5", term: "Finish schedule", definition: "Hard finishes (paint, flooring, tile) listed by room" },
            { id: "p6", term: "Spec book", definition: "All spec sheets compiled into one bound reference" },
          ],
        },
        modelAnswer:
          "Tear sheet = presentation summary; cut sheet = detailed dimensions/materials/install for custom items; spec sheet = one product end to end; FF&E schedule = the project-wide tracker; finish schedule = hard finishes by room; spec book = all spec sheets compiled. From the spec book Marco builds budgets and a bid package and starts RFQs on the long-lead items.",
        estimatedMinutes: 6,
      },
      {
        id: "fd-task-4-3",
        title: "Describing a product vs specifying one",
        description:
          "A generic AI 'spec sheet' for a cognac leather lounge chair sounds complete but isn't buyable. Sort each attribute by whether a generic description can supply it credibly, or whether it must come from a real specified product. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 4,
        widgetId: "categorize",
        widgetConfig: {
          prompt:
            "Sort each spec attribute: can a generic AI/marketing description supply it credibly, or must it come from a real, specified, buyable product?",
          categories: [
            { id: "describe", label: "Describable in general", hint: "Adjectives / intent an AI can plausibly generate" },
            { id: "specify", label: "Requires a real specified product", hint: "Verifiable, sourceable, contract-binding facts" },
          ],
          items: [
            { id: "i1", label: "'Cognac-toned, mid-century-inspired lounge chair'", correctCategoryId: "describe" },
            { id: "i2", label: "'Comfortable, durable, hospitality-appropriate look'", correctCategoryId: "describe" },
            { id: "i3", label: "Exact manufacturer + model/SKU number", correctCategoryId: "specify" },
            { id: "i4", label: "Specific COM/leather grade, finish, and flammability rating (e.g. CAL 117)", correctCategoryId: "specify" },
            { id: "i5", label: "Real dimensions, weight, and warranty terms", correctCategoryId: "specify" },
            { id: "i6", label: "Actual lead time, MOQ, and trade price from the maker", correctCategoryId: "specify" },
          ],
        },
        modelAnswer:
          "An AI can generate the describable layer — colour mood, style adjectives, vague 'durable/comfortable' claims — but a real spec needs the verifiable layer: manufacturer + model/SKU, COM/leather grade and flammability rating, true dimensions and warranty, and real lead time/MOQ/trade price. Describing a product is adjectives; specifying one is committing to a sourceable, contract-binding item a vendor can actually quote and ship.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-4-4",
        title: "Why phases exist",
        description:
          "Answer two reasoning questions about why design runs Programming → SD → DD instead of picking products on day one, then explain each in your own words. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 12,
          questions: [
            {
              id: "q-early",
              prompt:
                "What is the main problem with selecting specific products at the very start, before Programming and SD?",
              options: [
                { id: "a", label: "Locking specific SKUs before requirements and intent are settled means rework: products get chosen against unknowns, then discontinued, repriced, or proven wrong as the design firms up." },
                { id: "b", label: "It is impossible to find products before construction begins." },
                { id: "c", label: "Manufacturers won't quote until a hotel is fully built." },
                { id: "d", label: "Early selection is illegal under franchise rules." },
              ],
              correctOptionId: "a",
              rubric:
                "Phases move from abstract to concrete on purpose: Programming sets requirements, SD sets look/intent, DD pins exact products. Picking SKUs first forces expensive rework when intent shifts, and ties money to items that may be discontinued or repriced before they're ever ordered.",
            },
            {
              id: "q-prevent",
              prompt:
                "How does the sequential phase structure prevent that problem?",
              options: [
                { id: "a", label: "It defers irreversible, money-committing choices until enough is known — cheap-to-change decisions happen early, expensive-to-change product locks happen only after intent is fixed." },
                { id: "b", label: "It removes the designer from the project after Programming." },
                { id: "c", label: "It guarantees the lowest possible price on every item." },
                { id: "d", label: "It lets the owner skip approvals entirely." },
              ],
              correctOptionId: "a",
              rubric:
                "The structure sequences decisions by reversibility: shape the cheap-to-change intent first (moodboards, requirements), then commit to specific, hard-to-undo products only once that intent is stable — minimizing rework and protecting committed budget.",
            },
          ],
        },
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
        title: "Order the takeoff steps",
        description:
          "A takeoff turns a room count into an order quantity. Put the steps in the order a purchasing agent actually performs them — from per-room-type counts to cases ready to order. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "flow-order",
        widgetConfig: {
          prompt:
            "Order the takeoff for a 90-room hotel (Standard King x60, Standard Double x30) — from counting per room type to a case-level order quantity.",
          steps: [
            { id: "s1", label: "Count the items in each room type", detail: "King: 1 desk + 1 lounge chair + 2 nightstands; Double: 1 desk + 0 chairs + 2 nightstands" },
            { id: "s2", label: "Multiply each by the number of rooms of that type", detail: "60 Kings and 30 Doubles" },
            { id: "s3", label: "Sum across room types into building totals", detail: "Desks 90, lounge chairs 60, nightstands 180" },
            { id: "s4", label: "Apply the overage buffer and round up", detail: "+5%: desks 95, chairs 63, nightstands 189" },
            { id: "s5", label: "Convert to case/pack quantities to order", detail: "Nightstands at 4/case → ceil(189/4) = 48 cases" },
          ],
          lockFirst: true,
          lockLast: true,
        },
        modelAnswer:
          "Count per room type → multiply by room counts → sum to building totals (desks 90, chairs 60, nightstands 180) → apply 5% overage rounded up (95 / 63 / 189) → convert to cases (nightstands 4/case → 48 cases). Overage matters because a damaged or short item found near a fixed opening date can't be reordered in time, so the buffer protects the schedule.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-5-2",
        title: "Cumulative self-check (L1-L5)",
        description:
          "Closed-book recall spanning the first five lessons: why orders go out before construction ends, and why a product library compounds. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-parallel",
              prompt:
                "Why must the purchasing agent place orders before construction is complete?",
              options: [
                { id: "a", label: "Lead times are longer than the remaining build time, so orders must run parallel to construction" },
                { id: "b", label: "Vendors only accept orders before a building exists" },
                { id: "c", label: "It is cheaper to order early; price never changes" },
                { id: "d", label: "Brand standards forbid ordering after construction starts" },
              ],
              correctOptionId: "a",
              rubric:
                "Long lead times (overseas 18-24 wk, custom 6-12 mo) often exceed the construction time remaining, so POs must be placed in parallel with the build to hit a fixed opening date.",
            },
            {
              id: "q-library",
              prompt:
                "Why does a structured product library compound in value over time?",
              options: [
                { id: "a", label: "It stores nothing reusable; each project starts blank" },
                { id: "b", label: "Each project adds vetted records, so the next project starts from real data instead of a blank sheet" },
                { id: "c", label: "It automatically lowers vendor prices" },
                { id: "d", label: "It replaces the need for takeoffs entirely" },
              ],
              correctOptionId: "b",
              rubric:
                "Each completed project leaves behind vetted product records (real specs, finishes, vendors, lead times). The next project reuses them, so the library's value accumulates instead of being re-created from scratch.",
            },
          ],
        },
        modelAnswer:
          "Orders run parallel to construction because lead times exceed the remaining build time. The library compounds because every project adds vetted records the next project reuses. (Shake-the-building: FF&E like a lounge chair falls out, OS&E like towels is consumable; a moodboard lacks model/SKU, finish, dimensions, source, price, lead time.)",
        estimatedMinutes: 6,
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
          "Undocumented knowledge living in one person's head is fragile. Pick the best statement of why the FF&E library problem is the same risk, then justify it in your own words. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 4,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "Why is an FF&E library that lives only in a senior designer's head the same risk as any undocumented institutional knowledge?",
          options: [
            { id: "a", label: "Vendor contacts, tested products, pricing history and 'what failed last time' are unwritten, so if that person leaves the firm loses sourcing speed and repeats old mistakes — the value can't be reconstructed quickly." },
            { id: "b", label: "Designers are simply unwilling to share information." },
            { id: "c", label: "Software can already capture everything, so there is no real risk." },
            { id: "d", label: "The library is only paper samples and has no informational value." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "A library is more than samples: it's vetted vendors, who delivers on time, real trade prices, and hard-won 'don't use this fabric in a lobby' lessons. When that lives only in someone's head, departure erases it — the same single-point-of-failure as any tribal knowledge. The difference: an FF&E library is unusually high-value and slow to rebuild because it's accumulated across many projects and suppliers.",
        },
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-5-4",
        title: "Why two tracks, not one?",
        description:
          "A hotel runs FF&E and OS&E procurement as two separate tracks. Sort each trait into the track it characterizes — that contrast is exactly why collapsing them into one process backfires. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "categorize",
        widgetConfig: {
          prompt:
            "Sort each trait into the procurement track it characterizes: FF&E or OS&E.",
          categories: [
            { id: "ffe", label: "FF&E track", hint: "Durable, capitalized goods bought to open the building" },
            { id: "ose", label: "OS&E track", hint: "Consumables and operating supplies, replenished forever" },
          ],
          items: [
            { id: "i1", label: "Long, custom lead times (often 12-24 weeks)", correctCategoryId: "ffe" },
            { id: "i2", label: "One-time purchase tied to the opening, then capitalized", correctCategoryId: "ffe" },
            { id: "i3", label: "Bought through reps/dealers with submittals and approvals", correctCategoryId: "ffe" },
            { id: "i4", label: "Recurring reorders that never end while the hotel operates", correctCategoryId: "ose" },
            { id: "i5", label: "Treated as an operating expense, not a capital asset", correctCategoryId: "ose" },
            { id: "i6", label: "Sourced from distributors/foodservice/linen suppliers off the shelf", correctCategoryId: "ose" },
          ],
        },
        modelAnswer:
          "FF&E: long custom lead times, a one-time capitalized purchase to open the building, bought via reps with submittals/approvals. OS&E: never-ending reorders, expensed not capitalized, sourced off-the-shelf from distributors. The cadence, vendor types, budget classification, and the open-ended nature of OS&E are all different, so one process would either over-engineer the towels or under-manage the custom millwork — two tracks fit two problems.",
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
          "Match each PIP concept to the real-world fact that illustrates it — the trigger, the cost band, the deadline, and why lead time makes that deadline hard. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "p1", term: "Common PIP trigger", definition: "Franchise renewal, change of ownership, conversion/rebrand, or low audit / guest-satisfaction scores" },
            { id: "p2", term: "Soft-goods PIP cost band", definition: "Roughly $50k-$150k for carpet, drapery, and case-good refresh" },
            { id: "p3", term: "Major PIP cost band", definition: "$500k+ when bathrooms, lobby, and full FF&E are in scope" },
            { id: "p4", term: "Typical PIP deadline", definition: "About 12-18 months from the brand's notice to completion" },
            { id: "p5", term: "Why the deadline is structurally hard", definition: "Custom FF&E lead times of 6-12 months eat most of the window, leaving little margin if anything slips" },
          ],
        },
        modelAnswer:
          "Triggers: renewal, ownership change, conversion, or weak scores. Soft-goods PIPs run ~$50k-$150k; major PIPs $500k+. Deadlines are ~12-18 months, and they're hard because custom FF&E lead times (6-12 months) consume most of the window — a single slip in approvals or production can blow it.",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-6-2",
        title: "Self-check on PIP mechanics",
        description:
          "Recall the golden-sample mechanism and the consequence of a missed PIP deadline, then explain. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-golden",
              prompt:
                "What is a golden sample (first-article), and what problem does it solve?",
              options: [
                { id: "a", label: "An approved physical reference all production must match, ensuring consistency across many rooms and properties" },
                { id: "b", label: "A discounted demo unit the vendor keeps for marketing" },
                { id: "c", label: "The cheapest available substitute for an approved item" },
                { id: "d", label: "A digital rendering used in place of a real sample" },
              ],
              correctOptionId: "a",
              rubric:
                "A golden sample / first-article is a physically approved reference unit; every production unit must match it, which holds consistency across hundreds of rooms and multiple properties.",
            },
            {
              id: "q-deadline",
              prompt:
                "What is the two-step consequence of missing a PIP deadline?",
              options: [
                { id: "a", label: "An added penalty franchise fee (~1-3%) during the PIP period, escalating to loss of the flag" },
                { id: "b", label: "An automatic deadline extension at no cost" },
                { id: "c", label: "The brand pays for the renovation itself" },
                { id: "d", label: "Nothing — PIP deadlines are advisory" },
              ],
              correctOptionId: "a",
              rubric:
                "A missed PIP deadline first triggers an added penalty franchise fee (roughly 1-3%) during the non-compliance period, then escalates to losing the flag entirely — the existential risk.",
            },
          ],
        },
        modelAnswer:
          "A golden sample is an approved physical reference unit that all production must match, holding consistency across rooms and properties. A missed PIP deadline first adds a penalty franchise fee (~1-3%) during the PIP period, then escalates to flag loss. (Triggers: renewal, sale, conversion, low scores.)",
        estimatedMinutes: 6,
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
          "Pick the best explanation for why flagged (branded) properties generate more FF&E tracking demand than independents, then justify it — and address what relaxing a standard does to brand value. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "Why do brand standards create structurally higher demand for FF&E tracking than independent properties?",
          options: [
            { id: "a", label: "A flag mandates specific approved products, recurring PIPs, and auditable proof of compliance — so every property must document and prove what it bought, repeatedly, in a way an independent never has to." },
            { id: "b", label: "Flagged hotels simply buy more expensive furniture." },
            { id: "c", label: "Independent hotels are legally barred from tracking software." },
            { id: "d", label: "Brands forbid any use of spreadsheets, forcing software." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "The flag turns 'what did we buy' into a compliance obligation: approved suppliers, mandated refresh cycles, and audits that demand proof. That recurring, documented burden is the demand driver. Relaxing a standard erodes the guest-consistency that the brand sells — so the tension is 'consistency without rigidity': enough conformity to protect brand value, enough flexibility to handle real properties.",
        },
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
        title: "Trace the money: cost-plus vs fiduciary",
        description:
          "The same furniture package earns money in two different ways. Sort each statement into the pricing model it describes — cost-plus (markup) or fiduciary (disclosed fee). Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "categorize",
        widgetConfig: {
          prompt:
            "Sort each statement into the pricing model it belongs to: cost-plus (markup) or fiduciary (disclosed fee).",
          categories: [
            { id: "costplus", label: "Cost-plus (markup)", hint: "Firm earns on the spread between trade and client price" },
            { id: "fiduciary", label: "Fiduciary (disclosed fee)", hint: "Trade discounts pass through; firm earns a stated fee" },
          ],
          items: [
            { id: "i1", label: "Firm buys at trade (e.g. 40% off list) and adds a markup (e.g. 30%)", correctCategoryId: "costplus" },
            { id: "i2", label: "The firm keeps the spread between its cost and the client price", correctCategoryId: "costplus" },
            { id: "i3", label: "The exact discount the firm received is not shown to the owner", correctCategoryId: "costplus" },
            { id: "i4", label: "All trade discounts are passed straight through to the owner", correctCategoryId: "fiduciary" },
            { id: "i5", label: "The agent earns a disclosed fee (3-6% of FF&E value)", correctCategoryId: "fiduciary" },
            { id: "i6", label: "On large packages the owner usually pays less overall", correctCategoryId: "fiduciary" },
          ],
        },
        modelAnswer:
          "Cost-plus: buy at trade, add a markup, keep the spread, and the real discount stays hidden — the rep commission (5-15% from the maker) is also invisible to the buyer. Fiduciary: pass all trade discounts to the owner and charge a disclosed 3-6% fee. On large packages the owner usually comes out ahead under fiduciary, and the firm earns transparently rather than on the spread.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-7-2",
        title: "Cumulative interleave — connect L6 and L7",
        description:
          "Reason across two lessons: when a brand mandates an approved supplier (L6), which pricing model best protects the owner (L7), and why? Pick the answer and justify it. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "A brand standard mandates a single approved supplier for the guestroom casegoods — there is no competitive bid. Which arrangement best protects the owner on price, and why does removing the bid change the answer?",
          options: [
            { id: "opt-a", label: "Cost-plus markup — the agent buys at trade and adds a markup the owner doesn't see" },
            { id: "opt-b", label: "Fiduciary / disclosed-fee — all discounts pass to the owner; the agent earns only a disclosed fee" },
            { id: "opt-c", label: "It doesn't matter — a mandated supplier already guarantees a fair price" },
            { id: "opt-d", label: "Keystone markup — double the trade price, since there's no competition anyway" },
          ],
          correctOptionId: "opt-b",
          minJustificationWords: 15,
          rubric:
            "When the brand mandates the supplier, there is no competitive bid to discipline price, so the market can no longer keep the agent honest. The fiduciary/disclosed-fee model passes all discounts to the owner and pays the agent only a transparent fee, removing the incentive to inflate product price — exactly the protection lost when bidding is off the table. A and D let the agent capture hidden spread; C is wrong because a mandated supplier sets the list, not a fair net to the owner.",
        },
        modelAnswer:
          "A mandated supplier eliminates the competitive bid, so the owner can't rely on the market to discipline price. The fiduciary model passes all discounts through and pays only a disclosed fee, removing the incentive to inflate product cost — making it more important, not less, exactly when bidding is off the table.",
        estimatedMinutes: 6,
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
          "Pick the best account of why residential designers historically kept trade prices private while hospitality procurement moved to full transparency, then justify it. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "What structural market difference best explains why hospitality procurement is transparent while residential design often is not?",
          options: [
            { id: "a", label: "Hospitality buyers are sophisticated owners/brands spending large sums who demand audited, fiduciary buying — so disclosure is a competitive requirement; residential clients are smaller and the markup model is accepted, so trade prices stayed private." },
            { id: "b", label: "Hospitality furniture has no trade discounts to disclose." },
            { id: "c", label: "Residential designers are legally required to hide all prices." },
            { id: "d", label: "Hotels do not care about cost, only residential clients do." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "The buyer drives the norm. Hotel owners and brands deploy large capital, hire purchasing professionals, and expect fiduciary, auditable buying — transparency wins business there. Residential clients spend less and historically accepted the designer's markup as how the service is paid for, so non-disclosure persisted. Same products, different buyer sophistication and deal size, different transparency norm.",
        },
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
        title: "Stack the landed-cost layers",
        description:
          "Landed cost is FOB plus a stack of layers that accrue as goods move from factory to installed. Put the layers in the order they are added for a Vietnam-sourced chair. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "flow-order",
        widgetConfig: {
          prompt:
            "Order the landed-cost layers for a $620-FOB Vietnam lounge chair, from the factory price up to the chair standing in the room.",
          steps: [
            { id: "s1", label: "FOB factory price", detail: "$620 — the bare unit price on the quote, free on board at origin port" },
            { id: "s2", label: "Ocean freight & insurance", detail: "Moving the container from origin port to US port" },
            { id: "s3", label: "Import tariff / duty", detail: "~20% on Vietnam furniture, charged on the customs value" },
            { id: "s4", label: "Customs brokerage & clearance", detail: "Fees to clear the goods through US customs" },
            { id: "s5", label: "Warehousing / receiving / consolidation", detail: "Holding and staging before delivery" },
            { id: "s6", label: "Delivery & installation", detail: "Last-mile to site and placing the chair in the room" },
          ],
          lockFirst: true,
          lockLast: true,
        },
        modelAnswer:
          "FOB $620 → ocean freight & insurance → ~20% tariff → brokerage/clearance → warehousing/receiving → delivery & install. The stack adds roughly +40-55%, landing each chair near $870-$960, so the 90-unit landed total runs well above 90 x $620. Doubling the tariff adds ~20% of FOB more per unit. The concept: the bare FOB price always understates true cost, and tariffs widen the gap.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-8-2",
        title: "Cross-lesson budget scenario (L1 + L3 + L5 + L8)",
        description:
          "A 60-room midscale hotel; the contractor quotes $600k furniture-only. Reason across lessons about whether that number is plausible and what it implies, pick the best read, and justify it. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "A 60-room midscale hotel has a $600k furniture-only quote. Which reading is most correct across per-key benchmarks, soft costs, and the FF&E share of development cost?",
          options: [
            { id: "opt-a", label: "$10k/key — plausible for midscale; expect +20-35% after soft costs; implies ~$4M-$7.5M total development at an 8-15% FF&E share" },
            { id: "opt-b", label: "$10k/key — implausibly low; midscale runs $40k+/key" },
            { id: "opt-c", label: "$600k is the fully loaded landed number; no soft costs remain to add" },
            { id: "opt-d", label: "$600k implies ~$600k total development cost; FF&E is ~100% of the build" },
          ],
          correctOptionId: "opt-a",
          minJustificationWords: 15,
          rubric:
            "$600k / 60 = $10k/key, plausible for midscale. The quote is furniture-only, so soft costs (freight, taxes, install, PM, contingency) add roughly 20-35% on top — it is not the loaded number (rules out C). At an 8-15% FF&E share, $600k implies roughly $4M-$7.5M total development (rules out D). B is wrong because $40k+/key is a luxury, not midscale, figure. Value engineering is still feasible only if done during design, not at purchase.",
        },
        modelAnswer:
          "$10k/key is plausible for midscale. Furniture-only means soft costs add ~20-35% to reach the loaded number. At an 8-15% FF&E share, $600k implies ~$4M-$7.5M total development. Value engineering is feasible only during design — doing it at purchase blows the schedule.",
        estimatedMinutes: 7,
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
        title: "How a tariff rate is actually built",
        description:
          "An effective furniture tariff is a stack, not a single number. Match each tariff concept to what it means when you look up a Chapter 94 furniture HTS code. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 4,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "p1", term: "HTS code", definition: "The Harmonized Tariff Schedule classification number that determines a product's duty (e.g. Chapter 94 for furniture / seats)" },
            { id: "p2", term: "MFN / base duty", definition: "The standard 'most-favored-nation' rate applied to imports from normal-trading-status countries" },
            { id: "p3", term: "Section 301 add-on", definition: "An extra punitive duty layered on top for specific origins (notably China-origin goods)" },
            { id: "p4", term: "Effective stacked rate", definition: "Base duty + any Section 301/232 additions = the real rate actually paid at the border" },
            { id: "p5", term: "Why a static answer goes stale", definition: "Rates change with trade policy, so the authoritative figure must be looked up live at hts.usitc.gov / ustr.gov" },
          ],
        },
        modelAnswer:
          "The HTS code classifies the product and sets which duty applies. The MFN base duty is the standard rate; Section 301 (and 232) add-ons stack on top for origins like China; the effective stacked rate is base + add-ons — the number actually paid. Because policy shifts, the real figure must be pulled live from hts.usitc.gov / ustr.gov, which is exactly why a memorized or AI-generated rate can be wrong.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-8-4",
        title: "Why is contingency structured this way?",
        description:
          "Answer two reasoning questions about FF&E contingency — why hospitality runs higher than residential, and why cutting it to hit a headline number backfires — then explain each in your own words. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 12,
          questions: [
            {
              id: "q-higher",
              prompt:
                "Why does hospitality FF&E carry a higher contingency than residential — beyond just 'hotels are bigger'?",
              options: [
                { id: "a", label: "More uncontrolled variables: long overseas lead times, currency/tariff swings, custom-fabrication risk, and a fixed opening date that turns any slip into real cost — each adds variance a reserve must absorb." },
                { id: "b", label: "Hotels are required by law to hold a 15% reserve." },
                { id: "c", label: "Residential projects never have any surprises." },
                { id: "d", label: "Designers add contingency to inflate their fee." },
              ],
              correctOptionId: "a",
              rubric:
                "Hospitality has more sources of variance — global supply chains, tariffs/currency, custom manufacturing, and a hard opening date — so the expected size of surprises is larger and the cost of being short is higher. Contingency sizes to risk, not to project size alone.",
            },
            {
              id: "q-cut",
              prompt:
                "Why does removing contingency to hit a lower headline budget make things worse, not better?",
              options: [
                { id: "a", label: "The risks don't disappear; when one lands there's no funded buffer, forcing emergency cuts, value-engineering, or a schedule slip that costs more than the contingency would have." },
                { id: "b", label: "It is fine to remove it because surprises are rare." },
                { id: "c", label: "Lenders reward projects with zero contingency." },
                { id: "d", label: "Removing it automatically lowers tariffs." },
              ],
              correctOptionId: "a",
              rubric:
                "Cutting the reserve only hides risk on paper. The underlying variance is unchanged, so when a tariff jump or delay hits there's no money to absorb it — the project pays more in rushed substitutions, value engineering, or a missed opening than the contingency ever cost.",
            },
          ],
        },
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
          "Order the path a guestroom product takes from the contract manufacturer to a placed order — the channel model real makers like Kimball, Bernhardt Contract, OFS, or KI actually use. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "flow-order",
        widgetConfig: {
          prompt:
            "Order how a contract guestroom product reaches a placed order through the rep/dealer channel.",
          steps: [
            { id: "s1", label: "Manufacturer makes the product and sets trade pricing", detail: "e.g. Kimball Hospitality, Bernhardt Contract, OFS, KI" },
            { id: "s2", label: "Independent rep carries the line in a territory", detail: "Commission-only, multiple non-competing lines" },
            { id: "s3", label: "Rep gets the product specified into the designer's drawings", detail: "The rep's core job — winning the spec" },
            { id: "s4", label: "Designer specifies it; purchasing agent issues the RFQ", detail: "MOQ and lead time, rarely posted publicly, are quoted here" },
            { id: "s5", label: "Order placed through the rep or a contracted dealer", detail: "Not direct-to-consumer; the channel handles the PO" },
          ],
          lockFirst: true,
          lockLast: true,
        },
        modelAnswer:
          "Manufacturer → independent rep carrying the line → rep gets it specified into the designer's drawings → designer specifies, agent RFQs (MOQ/lead time quoted, rarely public) → order placed via rep or dealer, not direct. A manufacturer's rep is an independent, commission-only salesperson who carries multiple non-competing lines in a territory and whose core job is getting products specified — paid by the maker, free to the buyer.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-9-2",
        title: "Cross-lesson sourcing analysis (L2 + L6 + L8 + L9)",
        description:
          "150-room upper-upscale hotel with a fixed opening date. Rank the factors Marco should weigh most heavily when choosing between an overseas option (low FOB, MOQ 50, 21-week lead) and a domestic option (higher price, 12-week lead), then commit to the single most decisive factor and justify it as the owner's advocate. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "rank-order",
        widgetConfig: {
          prompt:
            "A 150-room upper-upscale hotel has a fixed opening date. Option A: Vietnam $1,100 FOB, MOQ 50, 21-week lead. Option B: US $1,480, MOQ 24, 12-week lead. Rank these decision factors from most to least decisive for the owner.",
          criterion: "how decisive it is for protecting the owner on a fixed-date project",
          topLabel: "Most decisive",
          bottomLabel: "Least decisive",
          items: [
            { id: "f1", label: "Schedule risk vs the fixed opening date", detail: "21 weeks leaves little buffer; a slip means an opening missed at ~$15k/day." },
            { id: "f2", label: "Brand-standard / approved-supplier compliance", detail: "If the flag names an approved supplier, an option may be off the table outright." },
            { id: "f3", label: "True landed cost (not FOB)", detail: "The $1,100 FOB grows ~40-55% with tariff + freight + stack, narrowing the gap to $1,480." },
            { id: "f4", label: "Headline FOB unit price", detail: "The number on the quote before any of the real cost or risk is added." },
          ],
          correctOrder: ["f2", "f1", "f3", "f4"],
          topPickId: "f2",
          minJustificationWords: 12,
          explanation:
            "Compliance ranks first because a non-approved supplier can disqualify an option entirely regardless of price — there's no decision to optimize if the brand won't allow it. Schedule risk is next: on a fixed opening date, a 21-week lead with no buffer threatens revenue at roughly $15k/day. True landed cost comes third — once compliant and on schedule, the $1,100 FOB grows 40-55% landed and may erase its advantage over $1,480. The bare FOB price ranks last: it is the most visible number but the least reliable basis for the decision.",
        },
        modelAnswer:
          "Compliance first (a non-approved supplier disqualifies an option outright), then schedule risk against the fixed opening date, then true landed cost (FOB + 40-55%), and bare FOB price last. Marco frames it for the owner's rep as compliance + delivery certainty + landed cost — not headline unit price.",
        estimatedMinutes: 7,
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
          "Pick the strongest reason the manufacturer's-rep model survives despite digital catalogs and direct platforms, then justify it. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "What value does the rep model create that a digital catalog or direct-to-manufacturer platform cannot easily replicate?",
          options: [
            { id: "a", label: "Reps live in the specification relationship — they get products into designers' drawings, give local territory service, and steer complex custom/contract decisions; a catalog lists products but doesn't win the spec or hold the relationship." },
            { id: "b", label: "Reps are simply cheaper than running a website." },
            { id: "c", label: "Manufacturers are legally prohibited from selling online." },
            { id: "d", label: "Designers cannot read product specifications without a rep present." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "The rep's value is relational and consultative: getting specified, knowing the territory and the designers, and guiding custom/contract decisions that a static catalog can't. The model would weaken only if specification became fully self-serve and custom complexity disappeared — conditions that don't broadly hold today, which is why the commission-only rep persists.",
        },
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
          "Each situation calls for one specific document. Sort each scenario under the right one: RFQ, RFP, submittal, RFI, or CFA sample. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "categorize",
        widgetConfig: {
          prompt: "Sort each project situation under the document it calls for.",
          categories: [
            { id: "rfq", label: "RFQ", hint: "Price on an already-defined spec" },
            { id: "rfp", label: "RFP", hint: "Fuller proposal when the approach is open" },
            { id: "submittal", label: "Submittal", hint: "Vendor proves a product conforms before fabrication" },
            { id: "rfi", label: "RFI", hint: "Question to resolve an ambiguous / conflicting spec" },
            { id: "cfa", label: "CFA sample", hint: "Cutting from the actual production run, approved before delivery" },
          ],
          items: [
            { id: "i1", label: "You have a fully defined chair spec and want three vendors to quote a price", correctCategoryId: "rfq" },
            { id: "i2", label: "You need a turnkey lobby concept but haven't decided the approach yet", correctCategoryId: "rfp" },
            { id: "i3", label: "The vendor sends product data and shop drawings to prove conformance before building", correctCategoryId: "submittal" },
            { id: "i4", label: "The finish schedule and the spec sheet name two different fabrics — which governs?", correctCategoryId: "rfi" },
            { id: "i5", label: "A swatch is cut from the actual dye lot and approved so delivered goods can't differ", correctCategoryId: "cfa" },
          ],
        },
        modelAnswer:
          "RFQ = price on a defined spec; RFP = fuller proposal when the approach is open; submittal = vendor proving conformance before fabrication; RFI = a question resolving an ambiguous/conflicting spec; CFA sample = a cutting from the actual production run, approved to prevent dye-lot disputes at delivery.",
        estimatedMinutes: 7,
      },
      {
        id: "fd-task-10-2",
        title: "Which loop catches this failure?",
        description:
          "Loop A is design sign-off (designer to owner/brand); Loop B is conformance (vendor proves the product matches the spec). Read the failure, pick which loop would have caught it, and justify it. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "120 lounge chairs arrive built exactly to the approved spec — correct model, finish and dimensions — but the owner says the silhouette is wrong and they never wanted this chair. Which approval loop was the one that failed here?",
          options: [
            { id: "opt-a", label: "Loop A (design sign-off) — the owner never approved this selection" },
            { id: "opt-b", label: "Loop B (submittal/conformance) — the vendor built the wrong product" },
            { id: "opt-c", label: "Neither — this is a freight problem" },
            { id: "opt-d", label: "Both failed equally" },
          ],
          correctOptionId: "opt-a",
          minJustificationWords: 15,
          rubric:
            "Loop A failed. The chairs conform perfectly to the spec, so Loop B (conformance) did its job — the vendor built exactly what was specified. The breakdown is that the design itself was never properly signed off by the owner, which is Loop A's purpose: it catches 'the owner didn't want this.' Skipping Loop A means you correctly build the wrong design. C and D miss that conformance was met; the defect is upstream in design approval.",
        },
        modelAnswer:
          "Loop A (design sign-off) failed: the chairs conform exactly to the spec, so Loop B worked — the vendor built what was specified. The owner simply never approved the design. Skip Loop A and you build the wrong design correctly; skip Loop B and the wrong product ships.",
        estimatedMinutes: 6,
      },
      {
        id: "fd-task-10-3",
        title: "The approval gap",
        description:
          "A formal approval step (the CFA / submittal sign-off) exists for a reason. Pick the best statement of what its absence costs at hotel scale, then justify it. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 4,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "What does the absence of a formal submittal/CFA approval step cost at hotel scale?",
          options: [
            { id: "a", label: "Errors are discovered after production or delivery instead of before — a wrong finish across hundreds of units becomes a reorder, a schedule slip, and a dispute with no record of who approved what." },
            { id: "b", label: "Nothing; vendors always send exactly what was specified." },
            { id: "c", label: "It only slows the project down with paperwork and adds no protection." },
            { id: "d", label: "It just means the designer gets paid later." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "The CFA is the last cheap moment to catch a mismatch — before the factory makes hundreds of units. Without it, a wrong finish or dimension surfaces at receiving or install, when fixing it means a reorder against a fixed opening date and an argument no one can win because nothing was signed. At one-off scale a return is annoying; at hotel scale it's a project event.",
        },
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-10-4",
        title: "Why four outcomes, not two?",
        description:
          "Answer two reasoning questions about the four submittal outcomes — why 'Approved as Noted' must exist, and how 'Rejected' differs from 'Revise and Resubmit' — then explain each in your own words. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 12,
          questions: [
            {
              id: "q-asnoted",
              prompt:
                "Why must 'Approved as Noted' exist as a separate outcome instead of collapsing to just Approved / Rejected?",
              options: [
                { id: "a", label: "It lets production proceed with a small binding correction, avoiding a full resubmit cycle for a minor fix — saving weeks while still recording the exact change as the vendor's obligation." },
                { id: "b", label: "It is a polite way of saying Rejected." },
                { id: "c", label: "It exists only for legal boilerplate and is never used." },
                { id: "d", label: "It lets the vendor ignore the comments and ship anyway." },
              ],
              correctOptionId: "a",
              rubric:
                "Without it, every minor correction would force a full re-review, burning lead time. 'Approved as Noted' keeps the schedule moving while making the noted change binding and on record — proceed, but you must incorporate this.",
            },
            {
              id: "q-reject",
              prompt:
                "How does 'Rejected' differ from 'Revise and Resubmit'?",
              options: [
                { id: "a", label: "Revise and Resubmit means fix and send it back for another review; Rejected means this submission is dead — wrong product/non-conforming — and a fundamentally different one is required." },
                { id: "b", label: "They are identical; the words are interchangeable." },
                { id: "c", label: "Rejected means approved with conditions." },
                { id: "d", label: "Revise and Resubmit means the owner cancels the project." },
              ],
              correctOptionId: "a",
              rubric:
                "Revise and Resubmit keeps the same product in play pending corrections; Rejected ends that path — the item is non-conforming or wrong and must be re-specified. Collapsing them would blur 'fix this' with 'start over,' losing the signal a vendor needs.",
            },
          ],
        },
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
          "Each failure is caught (or missed) at a specific phase of the post-PO pipeline. Sort each scenario under the phase whose discipline should catch it. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "categorize",
        widgetConfig: {
          prompt: "Sort each failure mode under the phase whose discipline is responsible for catching it.",
          categories: [
            { id: "expedite", label: "Expediting", hint: "Active factory-chasing between PO and shipment" },
            { id: "receiving", label: "Receiving inspection", hint: "Check qty/condition/finish vs the approved CFA" },
            { id: "closeout", label: "Closeout / debrief", hint: "Capture lessons; feed data back to the library" },
          ],
          items: [
            { id: "i1", label: "COM fabric isn't tracked to the factory and the frame can't be built on time", correctCategoryId: "expedite" },
            { id: "i2", label: "A discontinued finish is silently substituted by the factory mid-production", correctCategoryId: "expedite" },
            { id: "i3", label: "Crates arrive water-damaged but nobody checks until install day", correctCategoryId: "receiving" },
            { id: "i4", label: "The delivered finish doesn't match the approved CFA sample", correctCategoryId: "receiving" },
            { id: "i5", label: "Real sourcing data from a closed project never makes it back into the library", correctCategoryId: "closeout" },
            { id: "i6", label: "The next project re-learns the same vendor lessons from scratch", correctCategoryId: "closeout" },
          ],
        },
        modelAnswer:
          "Expediting catches the COM gap and silent substitution (active factory-chasing before shipment). Receiving inspection catches transit damage and CFA mismatch (check before it reaches install day, when there's no time to reorder). Closeout/debrief catches lost sourcing data and un-captured lessons, so the library compounds instead of resetting each project.",
        estimatedMinutes: 7,
      },
      {
        id: "fd-task-11-2",
        title: "The cumulative picture (L3 + L8 + L10 + L11)",
        description:
          "Trace 120 custom lounge chairs at $850 FOB from Vietnam by matching each step in the chain to its real value or content. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "p1", term: "Deposit on the PO", definition: "About 50% of the order value, paid up front to start production" },
            { id: "p2", term: "Lead-time range (overseas)", definition: "Production 30-90 days + ~3-5 weeks ocean transit, often 18-24 weeks total" },
            { id: "p3", term: "Tariff layer", definition: "~20% Vietnam furniture duty added to the FOB price" },
            { id: "p4", term: "Freight layer", definition: "~12% ocean freight, on top of brokerage/warehousing/install (~40-55% landed over $850)" },
            { id: "p5", term: "Receiving report contents", definition: "Quantity, condition, and finish checked against the approved CFA" },
            { id: "p6", term: "Step that must precede the wire/PO", definition: "Submittal + CFA approval from Lesson 10" },
          ],
        },
        modelAnswer:
          "Deposit ~50% on PO. Lead time: production 30-90 days + 3-5 weeks ocean (18-24 weeks total). Landed additions: ~20% tariff and ~12% freight plus brokerage/warehousing/install — ~40-55% over $850. The receiving report records quantity, condition, and finish vs the approved CFA. The step that must precede the wire: submittal + CFA approval.",
        estimatedMinutes: 14,
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
          "Expediting trades 'no news is good news' for active follow-up. Pick the best statement of why finding out late is so much more expensive than finding out early, then justify it. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 4,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "Why is learning about a delay late so much more costly than learning about it early?",
          options: [
            { id: "a", label: "Early warning preserves options — expedite, air-freight, re-sequence, or swap a backup; once the opening date is near those options are gone and the only choices left are expensive or damaging." },
            { id: "b", label: "Late news is cheaper because the factory absorbs all costs." },
            { id: "c", label: "There is no difference; a delay is a delay." },
            { id: "d", label: "Early news forces the owner to cancel the project." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "Time is the asset expediting protects. Found early, a slip can be managed with cheap-ish fixes (push production, air-freight a subset, re-sequence install). Found late, near a fixed opening date, those levers are gone and the project eats premium freight, a partial opening, or lost revenue. 'No news is good news' is the trap; active follow-up buys back the options.",
        },
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-11-4",
        title: "Why does the model room exist as a separate step?",
        description:
          "Answer two reasoning questions about the model room — why it's needed even after clean approvals, and who bears the cost of a conflict it reveals — then explain each in your own words. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 12,
          questions: [
            {
              id: "q-why",
              prompt:
                "If both approval loops from Lesson 10 closed cleanly, why is a physical model room still necessary?",
              options: [
                { id: "a", label: "Each item was approved in isolation; the model room is the first time everything is assembled together, revealing interaction problems — scale, color, lighting, and fit — that no paper submittal can show." },
                { id: "b", label: "It exists only to photograph the room for marketing." },
                { id: "c", label: "It replaces the need for any submittals." },
                { id: "d", label: "Brands require it purely as a formality with no function." },
              ],
              correctOptionId: "a",
              rubric:
                "Submittals approve products one at a time; they can't show how the carpet, drapery, lighting, and case goods look and fit together in a real room. The model room catches whole-room conflicts before they're replicated across hundreds of rooms — the last full-scale test before commitment.",
            },
            {
              id: "q-cost",
              prompt:
                "If the model room reveals a lighting/finish conflict, who typically bears the cost, and why?",
              options: [
                { id: "a", label: "Usually the owner, because each item conformed to its approved submittal — the conflict is a design-coordination issue, not a vendor defect, so it's a change the owner decides and funds." },
                { id: "b", label: "Always the vendor, because anything wrong is the vendor's fault." },
                { id: "c", label: "No one; conflicts in the model room are free to fix." },
                { id: "d", label: "The freight forwarder, since it shipped the goods." },
              ],
              correctOptionId: "a",
              rubric:
                "If every item matched its approved CFA, no vendor breached anything — the clash is in how the approved pieces combine, which is the owner/design side's call. The owner generally funds the change because it's a coordination decision, not a defect; the timestamped approvals show the vendors performed.",
            },
          ],
        },
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
          "Each dispute is settled by a specific record. Sort each dispute under the document that resolves it. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "categorize",
        widgetConfig: {
          prompt: "Sort each dispute under the record that resolves it and decides who pays.",
          categories: [
            { id: "cfa", label: "Approved CFA record", hint: "The cutting from the production run that was signed off" },
            { id: "signoff", label: "Timestamped sign-off / history log", hint: "Who approved what, and when" },
            { id: "quote", label: "Approved quote vs invoice", hint: "The price that was agreed vs the price billed" },
          ],
          items: [
            { id: "i1", label: "Delivered fabric is a different dye lot than what was approved", correctCategoryId: "cfa" },
            { id: "i2", label: "The wood finish on arrival doesn't match the approved sample", correctCategoryId: "cfa" },
            { id: "i3", label: "The owner says they never approved this chair selection", correctCategoryId: "signoff" },
            { id: "i4", label: "A vendor claims a change was verbally agreed but it isn't in the record", correctCategoryId: "signoff" },
            { id: "i5", label: "The invoice is higher than the price the owner approved", correctCategoryId: "quote" },
            { id: "i6", label: "A quote expired and the vendor billed a new higher price", correctCategoryId: "quote" },
          ],
        },
        modelAnswer:
          "Dye-lot and finish mismatches are settled by the approved CFA record — if delivered goods differ, the vendor bears it. 'I never approved that' and disputed verbal changes are settled by the timestamped sign-off / history log. Price disputes are settled by the approved quote vs the invoice. In each case the record with a timestamp and author decides who pays.",
        estimatedMinutes: 6,
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
          "Pick the best explanation for why the owner-approval loop and the vendor-submittal loop are kept separate, then justify it — covering what each loop checks and why each needs different expertise. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "Why are the owner-approval loop and the vendor-submittal loop kept as two separate loops?",
          options: [
            { id: "a", label: "They check different things with different expertise: the owner loop confirms design intent and money/scope decisions; the submittal loop verifies technical conformance of what the vendor will actually make — collapsing them would let unreviewed product reach the owner or unfunded changes reach the factory." },
            { id: "b", label: "It is just tradition with no functional reason." },
            { id: "c", label: "Owners are not allowed to talk to vendors ever." },
            { id: "d", label: "Two loops exist only to create more billable hours." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "The owner loop is about intent and authority — does this match the vision, and will the owner fund it. The submittal loop is technical — does the vendor's product conform to the spec. Different questions, different reviewers. If owners signed off before submittals were checked, they'd approve products that may not conform; if submittals went straight to the owner, non-experts would judge technical conformance. Separation puts the right check with the right expert.",
        },
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
          "Match each recurring FF&E pain point to the tool category that actually addresses it. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "p1", term: "Discontinued finish substituted mid-order", definition: "FF&E spec/procurement tool — links the spec line to a live vendor record and flags the change before the PO ships" },
            { id: "p2", term: "Version chaos across many editors", definition: "A single shared database of record — one source of truth instead of emailed spreadsheet copies" },
            { id: "p3", term: "Construction RFIs, submittals and schedule", definition: "Construction PM platform (Procore) — runs the building track, not the FF&E spec track" },
            { id: "p4", term: "Recurring OS&E spend across properties", definition: "GPO / group purchasing — aggregates operational volume for discounts" },
            { id: "p5", term: "Designer billing, time and trade pricing", definition: "Design business / accounting tool (Studio Designer, Design Manager)" },
            { id: "p6", term: "Tariff & freight volatility on landed cost", definition: "Live landed-cost tracking in the procurement tool, re-verified against current rates" },
          ],
        },
        modelAnswer:
          "A discontinued finish is caught by an FF&E spec/procurement tool linking spec to a live vendor record; version chaos is solved by a single shared database; construction RFIs/submittals belong to a construction PM platform (Procore), a different track from FF&E; recurring OS&E spend fits a GPO; designer billing fits a design-business tool; tariff/freight volatility needs live landed-cost tracking. Excel+email+PDF fails because the spreadsheet has no live connection and changes hide in an inbox.",
        estimatedMinutes: 6,
      },
      {
        id: "fd-task-13-2",
        title: "Cumulative check (L1 + L8 + L9 + L12 + L13)",
        description:
          "Closed-book recall across five lessons: the submittal action distinction and the practical point where Excel breaks. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-approved",
              prompt:
                "What is the difference between 'Approved' and 'Approved as Noted' on a submittal?",
              options: [
                { id: "a", label: "'Approved' = proceed as submitted; 'Approved as Noted' = proceed only after a binding correction" },
                { id: "b", label: "They are identical; both mean rejected" },
                { id: "c", label: "'Approved' means re-bid; 'Approved as Noted' means stop work" },
                { id: "d", label: "Both require a brand-new RFQ before any work" },
              ],
              correctOptionId: "a",
              rubric:
                "'Approved' lets the vendor proceed exactly as submitted. 'Approved as Noted' is conditional: the vendor may proceed only after incorporating the stated correction, which is binding and recorded.",
            },
            {
              id: "q-excel",
              prompt:
                "At roughly what point does Excel + email + PDF stop being adequate for FF&E?",
              options: [
                { id: "a", label: "Past ~100 items, 3+ projects, or multiple simultaneous editors" },
                { id: "b", label: "Only above 10,000 items" },
                { id: "c", label: "Never — Excel scales fine to any size" },
                { id: "d", label: "Immediately, even for a single 5-item project" },
              ],
              correctOptionId: "a",
              rubric:
                "Excel breaks in practice past roughly 100 items, 3+ concurrent projects, or multiple editors — version chaos, no live vendor link, and lost change history are where it fails.",
            },
          ],
        },
        modelAnswer:
          "'Approved' = proceed as submitted; 'Approved as Noted' = proceed only after a binding, recorded correction. Excel breaks past ~100 items, 3+ projects, or multiple editors. (The $40k mistake arose during expediting via silent substitution and surfaced at receiving; the two budget leaks are landed-cost surprises and scope creep.)",
        estimatedMinutes: 6,
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
          "Pick the best reason two adjacent FF&E tool categories stay separate rather than merging into one product, then justify it — naming what each category's user cares about that the other doesn't. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "Why do FF&E specification/library tools and procurement/expediting tools stay separate rather than merging into one product?",
          options: [
            { id: "a", label: "They serve different users and jobs — specification cares about design intent, libraries, and accurate specs; procurement cares about POs, money, lead times, and delivery — so one merged tool would be shallow at both instead of strong at either." },
            { id: "b", label: "It is impossible technically to combine them." },
            { id: "c", label: "Vendors refuse to let their data appear in two categories." },
            { id: "d", label: "Buyers prefer paying for more separate tools." },
          ],
          correctOptionId: "a",
          minJustificationWords: 12,
          rubric:
            "Adjacent categories split along the user and the job-to-be-done. The designer's specification/library world optimizes for intent, accuracy, and reuse; the agent's procurement/expediting world optimizes for orders, cost, and on-time delivery. Forcing both into one product usually means each side gets a compromised feature set — which is why the categories persist even though the data flows between them.",
        },
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
        title: "Trace a chair through the full chain",
        description:
          "Capstone: put the full FF&E process in order — from the budget decision to closeout — the way a single chair actually travels through every actor. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 1,
        widgetId: "flow-order",
        widgetConfig: {
          prompt:
            "Order the full FF&E journey of one chair, from the owner's budget decision to project closeout, naming the actor at each step.",
          steps: [
            { id: "s1", label: "Owner / brand set scope and standard", detail: "Budget per key and the brand-standard requirements" },
            { id: "s2", label: "Designer specifies the chair", detail: "Design intent → exact product (DD)" },
            { id: "s3", label: "Library + takeoff produce quantities", detail: "Per-room counts rolled up with overage" },
            { id: "s4", label: "Budget is built and approved", detail: "Landed cost + contingency" },
            { id: "s5", label: "RFQ to the vendor via the rep", detail: "Purchasing agent sources and quotes" },
            { id: "s6", label: "Submittal + CFA approval", detail: "Vendor sample/data signed off before production" },
            { id: "s7", label: "PO issued + deposit paid", detail: "~50% on the order" },
            { id: "s8", label: "Expediting during manufacturing", detail: "Active follow-up between PO and shipment" },
            { id: "s9", label: "Freight + customs clearance", detail: "Ocean transit, tariff, brokerage" },
            { id: "s10", label: "Receiving inspection on the dock", detail: "Quantity, condition, finish vs CFA" },
            { id: "s11", label: "Model room sign-off", detail: "Whole-room check before mass install" },
            { id: "s12", label: "Install + punch list + closeout", detail: "Place, fix defects, document, hand over" },
          ],
          lockFirst: true,
          lockLast: true,
        },
        modelAnswer:
          "Owner/brand scope → designer specifies → library/takeoff → budget → RFQ via rep → submittal + CFA → PO + deposit → expediting → freight/customs → receiving inspection → model room sign-off → install/punch list/closeout. The two highest-risk steps are the spec-to-shipment gap (silent substitution) and receiving (a skipped inspection lets a non-conforming item through).",
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-14-2",
        title: "Self-check: the three property types",
        description:
          "Recall how the three property types differ on who buys and on PIP risk, then explain. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 2,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-buyer",
              prompt:
                "Who typically does the buying across a Four Seasons (luxury flag), a Courtyard by Marriott (brand rollout), and an independent boutique?",
              options: [
                { id: "a", label: "Flag and rollout use a dedicated purchasing agent; the independent owner often buys solo" },
                { id: "b", label: "All three always use the same in-house brand buyer" },
                { id: "c", label: "The independent uses a big agency; the flags buy solo" },
                { id: "d", label: "None of them use purchasing agents" },
              ],
              correctOptionId: "a",
              rubric:
                "The luxury flag and the brand rollout typically run through a dedicated FF&E purchasing agent; the independent boutique owner often buys solo, juggling design and procurement together.",
            },
            {
              id: "q-pip",
              prompt:
                "How does PIP risk differ across the three property types?",
              options: [
                { id: "a", label: "High for flagged properties (audits, deadlines, flag loss); essentially absent for the independent" },
                { id: "b", label: "Highest for the independent; flags have none" },
                { id: "c", label: "Identical for all three" },
                { id: "d", label: "Only the boutique faces PIP deadlines" },
              ],
              correctOptionId: "a",
              rubric:
                "PIP risk is high for flagged properties — brand audits, hard deadlines, penalty fees, and ultimately flag loss. The independent has no brand to satisfy, so its risk is budget and dropped threads, not a PIP.",
            },
          ],
        },
        modelAnswer:
          "Flag and rollout use a dedicated purchasing agent; the independent owner often buys solo. Brand approval runs against a strict standard (model rooms, golden samples) for the flag and rollout; the independent has no brand to satisfy. PIP risk is high for flagged properties and essentially absent for the independent.",
        estimatedMinutes: 6,
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
          "Capstone synthesis: answer two reasoning questions tying the course together — why the specifier/buyer split and parallel procurement are rational structure, not waste — then explain each in your own words. Auto-checked — retry until correct.",
        category: "advanced",
        submissionType: "widget",
        order: 5,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 12,
          questions: [
            {
              id: "q-split",
              prompt:
                "Why is the specifier/buyer split a rational structural choice rather than an inefficiency?",
              options: [
                { id: "a", label: "It separates design judgment from money and removes the conflict of interest where a markup would bend the spec — protecting the owner and keeping the spec neutral, which one combined role cannot guarantee." },
                { id: "b", label: "It exists only because the industry resists change." },
                { id: "c", label: "It is cheaper to pay two firms than one." },
                { id: "d", label: "Regulators randomly imposed it decades ago." },
              ],
              correctOptionId: "a",
              rubric:
                "The split aligns incentives: the specifier serves the design, the buyer serves the budget and logistics, and neither profits from steering the other. Remove it and the spec quietly follows margin. It's structure that buys trust and skill coverage, not red tape.",
            },
            {
              id: "q-parallel",
              prompt:
                "Why is parallel procurement (plus FF&E reserves) rational rather than wasteful?",
              options: [
                { id: "a", label: "Long, varied lead times against a fixed opening date force long-lead items to start early and run concurrently, and reserves fund predictable, recurring refresh — both absorb time-and-money risk the project would otherwise eat in full." },
                { id: "b", label: "Parallel work just keeps more people busy." },
                { id: "c", label: "Reserves are idle cash that should always be spent down." },
                { id: "d", label: "It is required only for overseas projects." },
              ],
              correctOptionId: "a",
              rubric:
                "Parallel tracks exist because the critical path is set by the longest-lead item against a hard date — sequencing everything would miss the opening. FF&E reserves smooth the lumpy, brand-driven refresh cost. Remove parallelism and you blow the date; remove the reserve and a predictable bill becomes an emergency. Both are risk structure, not waste.",
            },
          ],
        },
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
