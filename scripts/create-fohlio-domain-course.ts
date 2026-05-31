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
    title: "An Empty Project and a $40k Mistake",
    subtitle: "What FF&E is, the six phases, three clients, and why a spec is a database",
    description:
      "Meet the domain Fohlio builds for: who the customers are, how they work, and their jobs-to-be-done. FF&E at real scale, the six-phase lifecycle, the three client segments (Marriott / the Church of Jesus Christ / an SMB inn), and the core mental model — a spec is a database, not a document.",
    learningGoals: [
      "Explain what FF&E is and why it is a class of problems, not just furniture",
      "Name the six phases of a project lifecycle from intent to handover",
      "Tell the three customer types apart and understand why they think differently",
      "See the entities behind the UI (Workspace, Project, roles)",
      "Pin down which phase the $40k mistake happened in",
    ],
    contentFile: "fohlio-domain-1-kickoff.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-1-1",
        title: "Walk one line item through the six phases",
        description:
          "Take any object near you (a chair, a lamp, a mug) and run it through the six phases as if it were a line item in Grace's Cedar & Oak project. Describe each phase in one line, mark the phase with the highest risk for an SMB, and include a 60-second from-memory explanation of 'spec as a database vs document'. Submit the phase list plus the risk note.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Passes if all six phases are named in order (intent → spec → budget → procurement → delivery → handover) and tied to the object, with budget and procurement not swapped; the highest-risk phase for an SMB is procurement/delivery (no buyer to catch a discontinuation); and the database explanation states that a database answers 'what is true now' (current price/lead time/status) while a document records the past.",
        estimatedMinutes: 20,
      },
      {
        id: "fd-task-1-2",
        title: "Self-check on the chapter",
        description:
          "Without scrolling back: (a) what is and isn't FF&E — two examples each; (b) list the six phases in order; (c) state each of the three clients' JTBD in one sentence.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Is FF&E: furniture, lighting, rugs, mirrors. Isn't: walls, slabs, ductwork. (b) Intent → specification → budget → procurement → delivery → handover. (c) Marriott — one standard across all properties, no drift; the Church — replicate a standard design, careful with budget; Grace — finish the project solo without going over budget or losing threads.",
        estimatedMinutes: 8,
      },
      {
        id: "fd-task-1-3",
        title: "Argue with an AI",
        description:
          "Ask any LLM 'Why would an interior designer need special software if they have Excel?' Dissect the answer the way Dana would: what does it miss about scale (thousands of line items) and the time gap (a product going stale between phases)? Add 2-3 sentences on what the AI left out.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-1-4",
        title: "Why it's built this way",
        description:
          "Why does Fohlio make Workspace the isolation boundary rather than Project? And why is Dana's mistake a procurement-phase failure rather than 'a designer being careless'? Explain why the obvious alternatives (project-level isolation; 'just be more careful') don't solve the problem.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-2",
    slug: "design-intent",
    order: 2,
    title: "Where the Intent Comes From",
    subtitle: "Moodboards, Pinterest/Revit, and how 'I want it cozy' becomes a spec line",
    description:
      "Phase 1, design intent: how a specifier turns a client's moodboard into the first real product in the spec, why a Pinterest pin is not data, and how the three clients differ in the kind of input they bring to this phase.",
    learningGoals: [
      "Understand what design intent is and how it differs from a spec line",
      "Know the three sources of a moodboard and which client uses each",
      "Explain why a picture cannot be a spec line (no SKU, finish, supplier)",
      "Walk the steps from moodboard to the first CatalogItem in a slot",
      "See how different input types change the length of the intent phase per client",
    ],
    contentFile: "fohlio-domain-2-design-intent.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-2-1",
        title: "Turn a moodboard into data",
        description:
          "For three imagined Pinterest pins, list at least four fields missing before each product could enter a spec. Include a 60-second from-memory explanation of the design-intent vs spec-line distinction.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Strong answers name fields like exact model/SKU, finish/colorway code, dimensions, supplier/source, unit price, lead time, quantity. The distinction: design intent is a desired look/feeling; a spec line is a buyable, attributed record.",
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-2-2",
        title: "Self-check on the chapter",
        description:
          "Without looking: (a) three sources of a moodboard plus the client that arrives with the least raw intent; (b) why the Church still verifies its past standard album; (c) at which step intent officially becomes data.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Pinterest board, PDF brand book, Revit/CAD; the Church arrives with a finished standard album. (b) Products in the album may have changed or been discontinued since it was built. (c) When a CatalogItem (a specific buyable variant) is linked to a project slot.",
        estimatedMinutes: 8,
      },
      {
        id: "fd-task-2-3",
        title: "Dissect an AI answer",
        description:
          "Ask an LLM how a designer works with a client moodboard. Find the step where it fails to explain why a moodboard isn't data yet, and write 2-3 sentences on the gap from a Fohlio-domain perspective.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-2-4",
        title: "Why it's built this way",
        description:
          "Why is the moodboard stored as its own project artifact rather than an attachment on the first spec line? What is lost if pictures just get dropped into Slack?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 10,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-3",
    slug: "products",
    order: 3,
    title: "Product and Catalog",
    subtitle: "Web clipper, families vs variants, the firm's shared library, and BOM",
    description:
      "Phase 2, capture: how the web clipper structures supplier data, how CatalogFamily/CatalogItem separate the parent model from a specific variant, why the catalog is a Workspace-level shared library, and how Parts/BOM handle composite products.",
    learningGoals: [
      "Explain what the web clipper does and why it beats copying from supplier emails",
      "Distinguish CatalogFamily (model) from CatalogItem (SKU variant)",
      "Understand catalog statuses (draft / new_from_project / ready_to_use)",
      "Know what Parts/BOM are and when they are needed",
      "Compare how Marriott, Grace, and the Church populate the catalog",
    ],
    contentFile: "fohlio-domain-3-products.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-3-1",
        title: "Break a product into catalog levels",
        description:
          "Pick a real piece of furniture (IKEA or Herman Miller). Map it to a CatalogFamily, at least 3 CatalogItem variants, and assess whether Parts apply. Include a 60-second from-memory explanation of the Family vs Item distinction.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Family = the model (e.g. 'Eames Lounge Chair'); Items = specific variants (walnut/black leather, santos palisander/white, etc.); Parts apply when the product is assembled from separately-sourced components (a bed = frame + headboard + slats). The spec links to an Item, not a Family.",
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-3-2",
        title: "Self-check on the chapter",
        description:
          "Without scrolling: (a) what the web clipper does vs copy-from-email; (b) which catalog status means 'approved for new projects'; (c) why a ProjectItemSlot stores a reference instead of copying the data.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) The clipper pulls structured fields (name, dimensions, finish, price, image) from a supplier page into one consistent shape, instead of re-keying from 14 different email formats. (b) ready_to_use. (c) A reference keeps the spec in sync with the catalog — if the product changes, the link can surface it (the basis of Lesson 8).",
        estimatedMinutes: 8,
      },
      {
        id: "fd-task-3-3",
        title: "Find the gap in an AI's answer",
        description:
          "Ask an LLM how a product catalog is structured in FF&E software. Find where it conflates family-level and item-level data, or mixes catalog data with spec data. Quote it and explain why the distinction matters for procurement and sync.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-3-4",
        title: "Why it's built this way",
        description:
          "Why is the catalog scoped to the Workspace rather than to each project? What problems does that solve, and what new problems does it create (e.g. competing brand standards inside one firm)?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-4",
    slug: "spec",
    order: 4,
    title: "A Spec Is Data, Not a Document",
    subtitle: "Areas, Schedules, columns, and why a spec row answers questions",
    description:
      "Phase 2, the spec build, for engineers: Area as the unit of place and repetition, Schedule as a category with typed columns, the ProjectItemSlot/ProjectItem pair, and why 'queryable data' is an engineering requirement, not a metaphor.",
    learningGoals: [
      "Understand Area and why a line item is attached to a zone",
      "Know what a Schedule is — a category with typed ItemColumns, not a calendar",
      "Distinguish ProjectItemSlot (the place) from ProjectItem (the chosen product)",
      "Explain qty, totalQty, finish (a code), and columnsAttributes",
      "Articulate why a queryable structure beats text in a cell",
    ],
    contentFile: "fohlio-domain-4-spec.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-4-1",
        title: "Sort line items into Schedules",
        description:
          "For six Cedar & Oak FF&E items, decide the Schedule each belongs to and list 3-4 concrete ItemColumns for it. Include a from-memory explanation of why a finish should be a code, not free text.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Lounge chair → Seating (columns: finish code, upholstery, dimensions, COM yardage). Pendant → Lighting (lumens, color temp, dimmable, mounting). Area rug → Soft goods (material, pile, size, edge). A finish must be a code because free text ('greige', 'warm grey') can't be filtered, rolled up, or matched against a supplier SKU.",
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-4-2",
        title: "Interleaved self-check (L1-L4)",
        description:
          "Without looking: (a) L1 — which phase a finish goes stale in; (b) L3 — CatalogFamily vs CatalogItem; (c) L4 — why finish must be a code; (d) L4 — qty vs totalQty when an Area repeats 40 times.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Between specification and procurement (surfaces at delivery). (b) Family = model, Item = variant/SKU. (c) So it can be filtered, totaled, and matched to a supplier SKU. (d) qty is per-Area (e.g. 2 nightstands per room); totalQty = qty × repeatCount = 2 × 40 = 80.",
        estimatedMinutes: 10,
      },
      {
        id: "fd-task-4-recall",
        title: "Recall: which Schedule does each item belong to?",
        description:
          "Match each FF&E line item to its Schedule. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "p1", term: "Lounge chair in the lobby", definition: "Seating schedule" },
            { id: "p2", term: "Pendant lamp over reception", definition: "Lighting schedule" },
            { id: "p3", term: "Wool area rug in suite 4", definition: "Soft goods schedule" },
            { id: "p4", term: "Walnut console table", definition: "Casegoods schedule" },
            { id: "p5", term: "Blackout drapery in guest rooms", definition: "Window treatments schedule" },
            { id: "p6", term: "Framed mirror above the vanity", definition: "Accessories schedule" },
          ],
        },
        estimatedMinutes: 4,
      },
      {
        id: "fd-task-4-3",
        title: "Model a real hotel's Areas and Schedules",
        description:
          "Sketch the Areas and Schedules for a realistic 50-room hotel with 4 room types. Explain what changes when a nightstand's qty drops from 2 to 1 per room — and where that change propagates.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-4-4",
        title: "Why the Slot holds what it holds",
        description:
          "What does a ProjectItemSlot hold that neither the Item nor the Area does? Why would a model that puts the Item directly in the Area break once you add alternatives? Give the concrete failure.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-5",
    slug: "standards",
    order: 5,
    title: "Brand Standards and the Obsession with Consistency",
    subtitle: "Approved catalogs, statuses, push/pull — how firms enforce sameness",
    description:
      "The segment lesson: Brand Standards as approved sub-catalogs that enforce consistency at scale, the three catalog statuses, push/pull between spec and catalog, and how Marriott, the Church, and Grace each relate to an approved list.",
    learningGoals: [
      "Define Brand Standard and distinguish it from a plain catalog",
      "Trace the three catalog statuses and what gates each transition",
      "Explain push and pull as two directions of the catalog reference",
      "Connect alternatives to a Brand Standard and why it matters on discontinuation",
      "Explain why Grace's lack of a standard is a calculated risk",
    ],
    contentFile: "fohlio-domain-5-standards.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-5-1",
        title: "Find the brand-standard violation and explain it",
        description:
          "Given four Marriott spec items and a Brand Standard (approved finishes and suppliers), identify which items violate it and why, then decide whether one borderline item should be a warning or a hard block.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "A violation is any item whose finish code or supplier is not on the approved list. Hard block when the deviation defeats the standard's purpose (off-brand finish on a guest-facing item); warning when it's a non-visible or interchangeable component. The judgment call is the point.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-5-2",
        title: "Mixed self-check (L1 + L4 + L5)",
        description:
          "Without looking: (a) Brother Andersen's JTBD and why a Brand Standard matters more to him than to Grace; (b) does adding an alternative to a Slot change totalQty; (c) pull vs push in one sentence each, and who pulls most often.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) Replicate a fixed design across many sites within budget — a standard guarantees sameness and cost control; Grace builds one bespoke project. (b) No — alternatives are options on the same Slot; totalQty is driven by qty × repeatCount. (c) Pull = accept catalog updates into the spec; Push = save spec edits back to the catalog. Designers pull most often; curators push.",
        estimatedMinutes: 10,
      },
      {
        id: "fd-task-5-recall",
        title: "Recall: is this spec item brand-compliant?",
        description:
          "Pick the item that violates the brand standard and justify it. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "mcq-justify",
        widgetConfig: {
          question:
            "Marriott's brand standard approves only finish code OAK-07 from supplier Vanguard for guest-room desk chairs. Which spec line violates the standard?",
          options: [
            { id: "opt-a", label: "Desk chair, finish OAK-07, supplier Vanguard, qty 600" },
            { id: "opt-b", label: "Desk chair, finish OAK-07, supplier 'BetterPrice Furniture', qty 600" },
            { id: "opt-c", label: "Desk chair, finish OAK-07, supplier Vanguard, qty 580 (2 rooms still in design)" },
            { id: "opt-d", label: "Desk chair, finish OAK-07, supplier Vanguard, marked as primary item" },
          ],
          correctOptionId: "opt-b",
          minJustificationWords: 15,
          rubric:
            "Option B swaps the approved supplier Vanguard for an unapproved one — the finish code matches but the source does not, so it breaks the standard. A and D are compliant; C is just an incomplete quantity, not a standard violation.",
        },
        estimatedMinutes: 4,
      },
      {
        id: "fd-task-5-3",
        title: "A real approved list in the wild",
        description:
          "Find a real, public brand standard or approved-vendor list. Describe its structure and map it onto the Fohlio model (BrandStandard + CatalogFamily/Item). What fits cleanly, what would need custom handling?",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-5-4",
        title: "Why exactly three statuses",
        description:
          "Why aren't two statuses enough? What does new_from_project cover that neither draft nor ready_to_use does? How would adding a fourth status (deprecated) change the model's behavior?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-6",
    slug: "budget",
    order: 6,
    title: "Money: Spec ≠ Budget ≠ Actual",
    subtitle: "Three numbers about the same chairs: markup, soft costs, variance",
    description:
      "Phase 3, budget — the heaviest concept. Spec total vs planned vs actual, where the gap comes from (markup, soft costs, duties), value engineering via alternatives, and how byArea/bySchedule give different clients different lenses on one budget.",
    learningGoals: [
      "Explain what spec total, planned, and actual each answer and why they differ",
      "List the components of soft costs and why a flat percentage is unreliable",
      "Describe value engineering using the alternatives mechanism",
      "Understand how currency, duties, freight, and tax layer onto a catalog price",
      "Read byArea vs bySchedule budget slices and who benefits from each",
    ],
    contentFile: "fohlio-domain-6-budget.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-6-1",
        title: "Work the numbers",
        description:
          "Compute spec total, planned (with markup and soft costs), and variance for four Cedar & Oak items; reason about actual after a partial payment; pick the right budget slice for Grace. Start with a 60-second from-memory recall of the four definitions.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "spec total = sum of unit price × qty. planned = spec total × (1 + markup) + soft costs. variance = planned - spec total (positive = over the approved spec). actual = sum of paid invoices, which is below planned until everything is paid. Grace cares about byArea ('what does one room cost?').",
        estimatedMinutes: 20,
      },
      {
        id: "fd-task-6-2",
        title: "Cross-lesson question (L3 + L5 + L6)",
        description:
          "Dana finds a cheaper alternative chair from a different supplier (a new Source, L3). It needs no new brand standard (Grace, L5), but the supplier sells only in batches: minimum order quantity (MOQ) is 30 and only 24 are needed. Predict the effect on variance, on Marco's workflow without a quote, and whether value engineering can create a new budget problem.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "Swapping lowers spec total, reducing variance all else equal. But a new Source needs a new RFQ before planned can be recomputed (no price yet). MOQ 30 at qty 24 means ordering 30 — planned grows by 6 × unit cost + markup. Value engineering saved on the unit but MOQ takes part of it back unless a no-MOQ supplier is found.",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-6-recall",
        title: "Recall: which number is which?",
        description:
          "Pick the right number for each budget question and explain. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "quiz-explain",
        widgetConfig: {
          minExplanationWords: 10,
          questions: [
            {
              id: "q-spec",
              prompt:
                "The spec lists 12 chairs at $400 each, nothing ordered yet. Which number is $4,800?",
              options: [
                { id: "a", label: "spec total" },
                { id: "b", label: "planned" },
                { id: "c", label: "actual" },
                { id: "d", label: "variance" },
              ],
              correctOptionId: "a",
              rubric:
                "spec total is the sum of what was specified (unit price x qty), before markup, soft costs, or any PO. Nothing is ordered, so planned and actual don't apply yet.",
            },
            {
              id: "q-variance",
              prompt:
                "spec total is $37,920 and planned (with markup + freight) is $49,608. What is the variance?",
              options: [
                { id: "a", label: "$49,608 (it equals planned)" },
                { id: "b", label: "+$11,688 (planned minus spec total)" },
                { id: "c", label: "$37,920 (it equals spec total)" },
                { id: "d", label: "$0 until invoices are paid" },
              ],
              correctOptionId: "b",
              rubric:
                "variance = planned - spec total = 49,608 - 37,920 = +$11,688. Positive means committed spend is over the approved spec; markup and soft costs are the usual cause.",
            },
          ],
        },
        estimatedMinutes: 5,
      },
      {
        id: "fd-task-6-3",
        title: "Budget walkthrough with a colleague",
        description:
          "Reproduce the three-numbers explanation with a real teammate. Record three questions you couldn't answer immediately, then submit those questions plus the answers you found.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 25,
      },
      {
        id: "fd-task-6-4",
        title: "Why three separate fields?",
        description:
          "Describe one specific decision that would break for each of the three clients if any two of spec total / planned / actual were collapsed into one field.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 14,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-7",
    slug: "procurement",
    order: 7,
    title: "Procurement: RFQ → Quote → PO",
    subtitle: "Sources, purchase orders, lead time, and MOQ",
    description:
      "Phase 4, procurement, from Marco's seat: Source/Supplier as a structured record, the RFQ to quote to PO pipeline, the PurchaseOrder status machine, lead time and MOQ, and how procurement leverage differs across the three segments.",
    learningGoals: [
      "Explain what a Source is and how family vs item sources differ",
      "Describe the RFQ to quote to PO cycle and each transition condition",
      "Name the PO statuses and what each transition allows",
      "Understand lead time and MOQ as the factors that decide the order date",
      "Explain the difference in procurement leverage between enterprise and SMB",
    ],
    contentFile: "fohlio-domain-7-procurement.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-7-1",
        title: "Order the pipeline and explain the transitions",
        description:
          "List the procurement steps in order and write one transition condition per step. Start with a 90-second from-memory recall of the list.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "RFQ → quotes compared → PO draft → open → approved → shipment → received_partially → received_fully → closed. Key transitions: a quote is selected to build a PO; 'approved' is the legally binding point where the lead-time clock starts; 'closed' requires all items received and all invoices reconciled.",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-7-2",
        title: "Cross-lesson analysis (L3 + L4 + L6 + L7)",
        description:
          "Grace specs 10 chairs. The current Source has MOQ 1 and a 4-week lead time. An alternative Source is $40 cheaper but has MOQ 15 and an 8-week lead time; Cedar & Oak opens in 10 weeks. Answer: how the switch affects spec total and planned; whether a new RFQ is needed; whether the 8-week lead time fits; whether ordering 15 for a need of 10 is worth it.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "Cheaper unit price lowers spec total; planned can't be recomputed until the new Source returns a quote (new RFQ required). 8 weeks fits inside 10 with little buffer — risky but workable. MOQ 15 for a need of 10 means paying for 5 extra; worth it only if the per-unit saving on 15 beats the current Source's total for 10, or the spares have value.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-7-recall",
        title: "Recall: order the procurement steps",
        description:
          "Put the procurement pipeline in the right order. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "flow-order",
        widgetConfig: {
          prompt: "Order the steps Marco follows to turn a spec into received goods.",
          steps: [
            { id: "s1", label: "Send RFQ to the Sources on the spec", detail: "Grouped by supplier" },
            { id: "s2", label: "Compare returned quotes on landed cost", detail: "Unit price + freight + duties" },
            { id: "s3", label: "Create the PO (draft)", detail: "Selected quote becomes an order" },
            { id: "s4", label: "Open the PO", detail: "Enters planned; changes require negotiation" },
            { id: "s5", label: "Approve the PO", detail: "Legally binding; lead-time clock starts" },
            { id: "s6", label: "Receive shipments (partial then full)", detail: "qtyReceived rises toward qtyOrdered" },
            { id: "s7", label: "Close the PO", detail: "All items received, all invoices reconciled" },
          ],
          lockFirst: false,
          lockLast: false,
        },
        modelAnswer:
          "RFQ → compare quotes → PO draft → open → approved → receive → close. The approved step is the irreversible one: it starts the lead-time clock and makes the order binding.",
        estimatedMinutes: 4,
      },
      {
        id: "fd-task-7-3",
        title: "Play Marco",
        description:
          "Find a real custom item with a stated MOQ or lead time on a public B2B furniture site. Describe how the RFQ-to-PO process would differ for Marriott (600 rooms, many properties) vs Grace (12-room inn). Paste the product URL.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-7-4",
        title: "Why it's built this way",
        description:
          "Why is received_partially a distinct status rather than a flag? What breaks in invoice/actual accounting without it? Give a concrete scenario for each of the three clients.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 12,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-8",
    slug: "sync",
    order: 8,
    title: "Why a Spec Rots: The Sync Engine",
    subtitle: "Sync states, push/pull/replace, and catching the discontinued finish",
    description:
      "The payoff: the sync engine catches a discontinued finish before the PO ships — the exact $40k failure from Lesson 1. Sync states (new/ready/updates/broken), the SyncStateCache, push/pull/replace, orphaned references, and optimistic concurrency.",
    learningGoals: [
      "Explain why a spec goes stale with no user action and where the cost peaks",
      "Name the four sync states and what each requires from the user",
      "Distinguish pull, push, and replace — and why pull fails on a broken item",
      "Define an orphaned reference and why it is more dangerous than 'updates'",
      "Explain optimistic concurrency: version field, HTTP 409, why not pessimistic locking",
    ],
    contentFile: "fohlio-domain-8-sync.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-8-1",
        title: "Reconstruct Dana's $40k failure technically",
        description:
          "Describe the sync state of the problem item at PO time, why the old process didn't catch it, and which state-machine transition fixes it. 3-5 sentences, from memory first.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "The item's catalog reference became broken (orphaned) when the supplier discontinued the finish — the item it pointed to no longer exists. The old (Excel) process had no link back to the catalog, so nothing flagged it. The fix is replace (pick a current variant), not pull — pull is useless when the target is gone.",
        estimatedMinutes: 14,
      },
      {
        id: "fd-task-8-2",
        title: "Self-check: sync states + prior concepts",
        description:
          "Without looking: (a) updates vs broken and when pull is useless; (b) the three catalog statuses from L5 and how they relate to sync; (c) why an item references a catalog family instead of copying its data, and the trade-off.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) updates = the catalog changed and can be merged (pull works); broken = the reference is gone (pull is useless, replace instead). (b) draft/new_from_project/ready_to_use govern what can be linked; only ready_to_use should be pulled into live specs. (c) A reference keeps the spec current and lets the engine detect drift; the trade-off is that catalog changes can orphan references, which is exactly what sync states surface.",
        estimatedMinutes: 10,
      },
      {
        id: "fd-task-8-recall",
        title: "Recall: the catalog changed — what do you do?",
        description:
          "Walk the decision: pull, push, or replace, depending on the situation. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "decision-tree",
        widgetConfig: {
          rootId: "n1",
          nodes: {
            n1: {
              id: "n1",
              question:
                "The catalog item your spec line points to was deleted — the supplier discontinued it. Sync state is 'broken'. What do you do?",
              options: [
                {
                  label: "Pull the latest catalog version into the item",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Pull merges updates from a target that still exists. The target is gone (orphaned), so there is nothing to pull. You must point the line at a different product.",
                  },
                },
                { label: "Replace the item with a current catalog variant", nextNodeId: "n2" },
                {
                  label: "Push your spec values back to the catalog",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Push writes your edits into the shared catalog. It neither restores the deleted item nor fixes the broken reference, and it risks polluting the catalog.",
                  },
                },
              ],
            },
            n2: {
              id: "n2",
              question:
                "Different case: the catalog item still exists but its price rose 8%. Sync state is 'updates'. The project is mid-budget-review. What is the right move?",
              options: [
                { label: "Pull the update so planned reflects the real price", nextNodeId: "n3" },
                {
                  label: "Ignore it — the spec already has a number",
                  outcome: {
                    kind: "suboptimal",
                    explanation:
                      "Ignoring keeps a stale price in the budget; the gap shows up later at PO time. Pulling now keeps planned honest during the review.",
                  },
                },
              ],
            },
            n3: {
              id: "n3",
              question:
                "You made a small project-specific tweak (a custom finish note) that the team wants in the shared catalog. Which operation publishes it?",
              options: [
                {
                  label: "Push — write the item changes back to the catalog",
                  outcome: {
                    kind: "correct",
                    explanation:
                      "Push is spec → catalog. A curator typically reviews before it becomes ready_to_use for everyone. Pull is catalog → spec; replace swaps the linked product.",
                  },
                },
                {
                  label: "Pull — it syncs everything anyway",
                  outcome: {
                    kind: "wrong",
                    explanation:
                      "Pull is the opposite direction (catalog → spec). It would not publish your local change to the shared catalog.",
                  },
                },
              ],
            },
          },
        },
        modelAnswer:
          "broken → replace (the target is gone). updates → pull (merge the change). Publishing a local change to the shared catalog → push. Pull and push are opposite directions; replace is for a dead reference.",
        estimatedMinutes: 5,
      },
      {
        id: "fd-task-8-3",
        title: "The scenario where bulk pull makes things worse",
        description:
          "A Marriott project is in final client review; budget is approved. 40 items show 'updates' from description-only catalog edits. Argue whether to bulk-pull now — what you gain, what you risk, and what sync policy fits late-stage vs early-stage projects.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 18,
      },
      {
        id: "fd-task-8-4",
        title: "Why optimistic, not pessimistic concurrency",
        description:
          "Why does pessimistic locking break in SaaS? What scenario does optimistic concurrency still miss (two concurrent pulls on the same item, both at version 14)? Hypothesize a guard.",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 14,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-9",
    slug: "delivery",
    order: 9,
    title: "The Physical Tail: Shipment → Receiving → Install",
    subtitle: "Partial receiving, invoices, field tracking, and closeout",
    description:
      "Phase 5, delivery: how an approved PO spawns shipments, why partial receiving is first-class, how warehouse and install are separate events, how invoices feed actual, what field tracking solves, and what closeout means for reporting.",
    learningGoals: [
      "Explain the PO to Shipment to ShipmentItem hierarchy and why one PO yields many shipments",
      "Describe partial receiving and the PO status progression",
      "Distinguish warehouse staging from install as separate stages",
      "Trace how supplier and client invoices drive actual",
      "Explain field tracking (GrCode) and why closeout is explicit",
    ],
    contentFile: "fohlio-domain-9-delivery.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-9-1",
        title: "Walk one item through Phase 5",
        description:
          "Trace the chair from Lesson 1 through PO → shipment → receiving → warehouse → install → invoice → closeout. One line per step: what happens and what the system records. From memory first.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "PO (qtyOrdered=1, approved) → Shipment (dispatch date recorded) → Receiving (qtyReceived=1; PO becomes received_partially/received_fully) → Warehouse (staged, GrCode label) → Install (placed in the room, install date) → Invoice (supplier invoice updates actual) → Closeout (PO explicitly closed once settled).",
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-9-2",
        title: "Self-check: delivery + prior concepts",
        description:
          "Without scrolling: (a) received_partially vs received_fully vs closed; (b) planned vs actual and why actual only appears in Phase 5; (c) which phase receiving belongs to and why install is separate.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) received_partially = at least one line short; received_fully = all lines arrived; closed = explicitly closed after invoice reconciliation. (b) planned = committed in POs; actual = paid invoices — and invoices only exist against physical deliveries, which start in Phase 5. (c) Receiving is Phase 5; install is separate because weeks can pass between 'goods accepted at warehouse' and 'goods standing in the room', with different dates and owners.",
        estimatedMinutes: 10,
      },
      {
        id: "fd-task-9-3",
        title: "The over-delivery edge case",
        description:
          "A PO is for 8 chairs; 10 arrive and Marco accepts all 10. Design how the system models it: qtyReceived, the effect on actual, and what happens to the 2 surplus units. Propose concrete fields and statuses.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 16,
      },
      {
        id: "fd-task-9-4",
        title: "Why warehouse and install are separate entities",
        description:
          "What queries does separating warehouse from install enable that a single flag would not? How does it affect budget reporting and closeout? Which Marriott-scale scenario would be hard without it?",
        category: "advanced",
        submissionType: "text",
        order: 5,
        estimatedMinutes: 14,
      },
    ],
  },
  {
    id: "fohlio-domain-lesson-10",
    slug: "handoff",
    order: 10,
    title: "Project Handover: Collaboration, Roles, and the Close",
    subtitle: "Approval chains, roles/permissions, deliverables — the capstone",
    description:
      "The synthesis capstone — no new concepts. Phase 6 handover: Collaboration (share / approval_request), external collaborators via tokens, roles and permissions by segment, and spec-generated deliverables. Traces one chair through all six phases for all three clients, and closes the $40k arc.",
    learningGoals: [
      "Explain Collaboration: share vs approval_request, tokenized links, comments",
      "Name system and custom roles and what each prevents",
      "Describe the three clients' approval chains and the engineering implications",
      "List Phase 6 deliverables and why they are generated from spec data",
      "Trace one line item through all six phases for all three clients",
    ],
    contentFile: "fohlio-domain-10-handoff.html",
    isPublished: true,
    homework: [
      {
        id: "fd-task-10-1",
        title: "Trace the chair through six phases for three clients",
        description:
          "For each client (Marriott, the Church, Cedar & Oak), write one sentence per phase describing what happens to the chair. Identify the phase where the three journeys diverge most and explain why. Include a 90-second from-memory recall of the handover-phase differences.",
        category: "required",
        submissionType: "text",
        order: 1,
        modelAnswer:
          "Divergence is sharpest at handover/approval: Marriott runs a multi-stakeholder brand approval, the Church a long institutional budget chain, Grace a one-tap chain of herself plus the client. Earlier phases differ in scale and standard strictness but follow the same six-phase spine.",
        estimatedMinutes: 22,
      },
      {
        id: "fd-task-10-2",
        title: "Course-wide self-check",
        description:
          "Without looking: (a) what SyncStateCache is and why it's transient; (b) spec total vs planned vs actual vs variance; (c) why a Collaborator can't see other Workspace projects; (d) two scenarios where sync state becomes broken.",
        category: "required",
        submissionType: "text",
        order: 2,
        modelAnswer:
          "(a) The computed link state between a spec item and its catalog source; transient because the catalog changes and a stored value would go stale. (b) spec = specified; planned = ordered (POs); actual = paid (invoices); variance = planned - spec total. (c) A Collaborator enters via a token scoped to a project/area/slot, not an authenticated workspace account. (d) Orphaned reference (item deleted) and componentsDiverged (BOM changed beyond auto-merge).",
        estimatedMinutes: 12,
      },
      {
        id: "fd-task-10-recall",
        title: "Recall: match the stakeholder to their job",
        description:
          "Match each role/stakeholder to what they actually do on the platform. Auto-checked — retry until correct.",
        category: "required",
        submissionType: "widget",
        order: 3,
        widgetId: "concept-match",
        widgetConfig: {
          pairs: [
            { id: "r1", term: "Specifier (Dana)", definition: "Builds and edits the spec; links items to the catalog" },
            { id: "r2", term: "Procurement (Marco)", definition: "Turns the spec into RFQs and purchase orders" },
            { id: "r3", term: "Collaborator (a vendor)", definition: "Token-scoped external access to specific items only" },
            { id: "r4", term: "Owner / Admin", definition: "Manages the workspace, members, and roles" },
            { id: "r5", term: "Brand manager (Linda)", definition: "Approves items against the brand standard" },
            { id: "r6", term: "SMB owner (Grace)", definition: "Plays every role herself on one small project" },
          ],
        },
        estimatedMinutes: 4,
      },
      {
        id: "fd-task-10-3",
        title: "A real feature from your backlog, across three clients",
        description:
          "Take a real task from your backlog or last sprint. Describe how it behaves for Marriott, the Church, and Grace. Identify a requirement that conflicts between segments.",
        category: "advanced",
        submissionType: "text",
        order: 4,
        estimatedMinutes: 20,
      },
      {
        id: "fd-task-10-4",
        title: "Why the domain is built this way",
        description:
          "Three questions in obvious-answer → why-incomplete → real-answer form: (1) why Collaboration is a separate entity with tokens, not a restricted Member; (2) why sync state has four values, not two; (3) why budget stores three numbers, not one running total.",
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

  await prisma.$transaction(
    async (tx) => {
      await tx.course.upsert({
        where: { id: COURSE_ID },
        update: {
          slug: COURSE_SLUG,
          title: "The Fohlio Domain for Engineers",
          subtitle: "Who our customers are, how they work, and their jobs-to-be-done",
          description:
            "A 10-lesson course for Fohlio engineers on the FF&E business domain we build for. Follows one specifier across three client segments (Marriott, the Church of Jesus Christ, and a small boutique inn) through the full project lifecycle — intent, spec, budget, procurement, sync, delivery, and handover.",
          status: "published",
          ownerId: admin.id,
        },
        create: {
          id: COURSE_ID,
          slug: COURSE_SLUG,
          title: "The Fohlio Domain for Engineers",
          subtitle: "Who our customers are, how they work, and their jobs-to-be-done",
          description:
            "A 10-lesson course for Fohlio engineers on the FF&E business domain we build for. Follows one specifier across three client segments (Marriott, the Church of Jesus Christ, and a small boutique inn) through the full project lifecycle — intent, spec, budget, procurement, sync, delivery, and handover.",
          status: "published",
          ownerId: admin.id,
        },
      });

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
