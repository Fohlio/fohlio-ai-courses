interface LegacyHomeworkTask {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  category: "required" | "advanced";
  submissionType: "pr_link" | "screenshot" | "text" | "quiz" | "checklist";
  order: number;
  quizQuestions?: string[];
  checklistItems?: string[];
  modelAnswer?: string;
  estimatedMinutes?: number;
}

interface LegacyHomeworkSection {
  id: string;
  category: "required" | "advanced";
  tasks: LegacyHomeworkTask[];
}

export interface LegacyLesson {
  id: string;
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  learningGoals: string[];
  contentType: "html" | "pdf" | "markdown";
  contentFile: string;
  videoUrl: string | null;
  isPublished: boolean;
  order: number;
  referenceMaterials?: Array<{
    title: string;
    url: string;
  }>;
  homework: LegacyHomeworkSection[];
}

export const ADMIN_GITHUB_NICKNAME = "ivanbunin";

export const LESSONS: LegacyLesson[] = [
  {
    id: "lesson-1",
    slug: "git-intro",
    number: 1,
    title: "Introduction to Collaborative Development",
    subtitle: "Installing tools, Git basics",
    description:
      "Learn why Git is essential for teamwork, install Cursor and Git, and understand core concepts: repository, commit, branch.",
    learningGoals: [
      "Understand why Git is essential for teamwork",
      "Have Cursor and Git installed on your computer",
      "Know basic Git concepts: repository, commit, branch",
      "Be ready to complete your first homework assignment",
    ],
    contentType: "html",
    contentFile: "lesson1-git_intro.html",
    videoUrl: null,
    isPublished: true,
    order: 1,
    homework: [
      {
        id: "hw-1-required",
        category: "required",
        tasks: [
          {
            id: "task-1-1",
            lessonId: "lesson-1",
            title: "Install Cursor and verify Git",
            description:
              "Install Cursor from cursor.com. Then open its built-in terminal (Ctrl+` / Cmd+`) and run: git --version. Send a screenshot showing both Cursor open and the terminal output with a version number like 'git version 2.x.x'.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 20,
            modelAnswer:
              "A correct screenshot shows the Cursor editor window open with the integrated terminal visible at the bottom. The terminal must display a line starting with 'git version' followed by a version number (any version 2.x or higher is fine). If you see 'command not found', Git is not installed — re-read Part 1 and follow the installation steps for your OS.",
          },
          {
            id: "task-1-2",
            lessonId: "lesson-1",
            title: "Make your first local commit",
            description:
              "Clone the fohlio-ai-courses repo to your computer. Then: create a new branch called YOUR-NAME-hello, create a file called hello.txt with one sentence about why you joined this course, stage it (git add .), commit it (git commit -m 'Hello from YOUR-NAME'), and run git log --oneline to confirm the commit is there. Send a screenshot of the terminal showing the git log output with your commit.",
            category: "required",
            submissionType: "screenshot",
            order: 2,
            estimatedMinutes: 25,
            modelAnswer:
              "A correct screenshot shows the terminal with git log --oneline output that includes your commit hash and message. Check these four things: (1) you are on your own branch, not main — run 'git branch' and verify it shows your branch with an asterisk; (2) the commit message is meaningful, not just 'test'; (3) the file hello.txt exists in the folder; (4) git status shows 'nothing to commit, working tree clean' after the commit. Common mistake: forgetting 'git add .' before committing — git status will show the file as 'untracked' if this happened.",
          },
        ],
      },
      {
        id: "hw-1-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-1-3",
            lessonId: "lesson-1",
            title: "Reflect on your first commit — staged process",
            description:
              "This task has three stages you must complete in order. Stage 1 — Plan: before touching the terminal, write 3-5 sentences describing what you expect to happen when you run 'git add . && git commit -m ...' on a new file. What does Git do internally? Stage 2 — Execute: now actually run the commit from task #2. Did anything surprise you compared to your prediction? Stage 3 — Revision note: in 2-3 sentences, describe one thing that was different from what you expected, or one thing you had to look up. Submit all three stages as a single text reply. Metacognitive memo: what would an AI summary of this lesson miss that you learned by doing?\n\nNote: this task is intentionally harder than the lesson — that gap is the learning.",
            category: "advanced",
            submissionType: "text",
            order: 1,
            estimatedMinutes: 25,
            modelAnswer:
              "There is no single correct answer — the value is in the process. A strong response: Stage 1 has a genuine prediction (even if wrong). Stage 2 names a specific surprise (e.g. 'I expected git add to confirm each file but it was silent'). Stage 3 shows genuine reflection, not a restatement. The metacognitive memo should name something experiential — muscle memory of commands, confusion reading the log format, the feeling of not knowing if it worked — not just 'I learned what a commit is'.",
          },
          {
            id: "task-1-4",
            lessonId: "lesson-1",
            title: "Why branches — elaborative interrogation",
            description:
              "Answer these two questions in your own words, without quoting the lesson directly. (1) Why does Git use branches instead of just letting everyone commit directly to main? What specific problem would arise if there were no branches? (2) Why doesn't Git automatically resolve merge conflicts by picking the most recent change? What would go wrong if it did?",
            category: "advanced",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 20,
            modelAnswer:
              "(1) Without branches, every commit would immediately affect the shared codebase. Two people editing the same file would constantly overwrite each other's work. A half-finished feature would break the code for everyone. Branches let each person work in isolation and only merge when the work is stable and reviewed. (2) 'Most recent wins' sounds logical but breaks down immediately: if Alice refactors a function and Bob adds a parameter to it, the most recent commit would silently discard the other's work with no warning. A conflict forces a human to look at both changes and decide — the machine cannot know which change is intentional.",
          },
        ],
      },
    ],
  },
  {
    id: "lesson-2",
    slug: "architecture",
    number: 2,
    title: "Architecture, Servers & Git Flow",
    subtitle: "How Fohlio works, staging servers, advanced Git",
    description:
      "Understand the Fohlio system architecture, learn about staging servers, and master Git branching and merge conflicts.",
    learningGoals: [
      "Understand how Fohlio's systems are organized",
      "Know the difference between staging and production",
      "Master Git branching and merge conflict resolution",
      "Be comfortable with the PR workflow",
    ],
    contentType: "html",
    contentFile: "lesson2-architecture.html",
    videoUrl: null,
    isPublished: true,
    order: 2,
    homework: [
      {
        id: "hw-2-required",
        category: "required",
        tasks: [
          {
            id: "task-2-1",
            lessonId: "lesson-2",
            title: "Run fohlio-frontend locally",
            description:
              "Clone fohlio-frontend to your computer. Run: make setup, then make use-test01, then make s. Wait for the dev server to start and open the URL it prints (usually http://localhost:3000). Send a screenshot of the browser showing the Fohlio login page. If you get an error at any step, include the terminal output in your screenshot — that way Ivan can help faster.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 25,
            modelAnswer:
              "A correct screenshot shows the browser open at a localhost URL with the Fohlio login page visible — it should have an email field, a password field, and a sign-in button. If you see a blank page or an error, the most common causes are: (1) missing env variables — message Ivan in Slack; (2) wrong Node.js version — re-read Part 3 and ensure you are on Node 20.12.2 via nvm; (3) yarn packages not installed — run 'make setup' again. A screenshot of the terminal with 'make s' running (but browser not shown) is not sufficient.",
          },
          {
            id: "task-2-2",
            lessonId: "lesson-2",
            title: "Explain the Fohlio architecture in your own words",
            description:
              "Without looking at the lesson slides, write 4-6 sentences describing how Fohlio's systems are connected. Cover: (a) what the frontend and backend do, (b) what staging vs production means in practice, and (c) why branch names start with a Jira ticket number. Use your own words — a direct quote from the lesson is a sign you haven't internalized it yet.",
            category: "required",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 20,
            modelAnswer:
              "A strong answer covers all three parts in plain language. Example: (a) The frontend is the React app the user sees in the browser; the backend handles data, auth, and business logic — they communicate via GraphQL. (b) Staging (test01, uat01) is a copy of production where changes are tested before real users see them — a bug on staging is embarrassing, a bug on production costs money. (c) Branch names start with the Jira ticket so anyone reading the Git log can immediately find the spec, business context, and discussion for that change without asking the author. Answers that just list bullet points from the lesson without explanation score lower.",
          },
        ],
      },
      {
        id: "hw-2-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-2-3",
            lessonId: "lesson-2",
            title: "Explore the codebase — staged investigation",
            description:
              "This task has three stages. Stage 1 — Predict: before opening Cursor, write down where you think the login page file is located in fohlio-frontend. Take a guess based on what you know about how web projects are structured. Stage 2 — Investigate: open fohlio-frontend in Cursor. Find: the login page file, where the GraphQL queries are defined, and what 'make s' actually runs (open the Makefile). Stage 3 — Compare: how close was your prediction? What surprised you about the file structure? Submit all three stages as a single text reply. Metacognitive memo: what would an AI miss about this codebase that you only learned by navigating it yourself?",
            category: "advanced",
            submissionType: "text",
            order: 1,
            estimatedMinutes: 30,
            modelAnswer:
              "A strong response shows genuine prediction in Stage 1 (even a wrong guess is fine — 'I thought it would be in src/pages/login.tsx'). Stage 2 should name actual file paths, not just folders. Stage 3 should contrast the prediction with reality. The metacognitive memo should mention something like folder naming conventions, the FSD layer structure, or the Makefile abstraction — things you only understand by navigating, not by reading a description.",
          },
          {
            id: "task-2-4",
            lessonId: "lesson-2",
            title: "Why staging — elaborative interrogation",
            description:
              "Answer in your own words: (1) Why do teams use staging servers instead of testing changes directly on production? What specific bad outcomes would happen without staging? (2) Why is it dangerous to test on production even if you are very careful and revert quickly if something goes wrong?",
            category: "advanced",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 15,
            modelAnswer:
              "(1) Without staging, every untested change goes immediately to real users. A broken deployment could take down the login page for paying customers, corrupt data, or expose a security bug before anyone notices. Staging lets you discover these issues in a controlled environment where only the team can see them. (2) Even a 30-second production incident is logged, noticed by monitoring tools, and potentially seen by customers. Some failures are not instantly reversible — a bad database migration can corrupt data before you realize it. 'Revert quickly' assumes you notice immediately, which is rarely true.",
          },
        ],
      },
    ],
  },
  {
    id: "lesson-3",
    slug: "frontend-deep-dive",
    number: 3,
    title: "Frontend Deep Dive: Setup & First Fix",
    subtitle: "FSD architecture, environment, cloning & first PR",
    description:
      "Explore the fohlio-frontend codebase through a story, understand environment variables, set up permissions for ui-kit, and make your first code change via Cursor.",
    learningGoals: [
      "Understand the fohlio-frontend architecture and key characters (React, Rspack, Apollo, Zustand)",
      "Know what FSD (Feature-Sliced Design) is and why we use it",
      "Understand environment variables and how they work",
      "Set up GitHub token for @fohlio/ui-kit access",
      "Make your first code fix and create a Pull Request",
    ],
    contentType: "html",
    contentFile: "lesson3-frontend-deep-dive.html",
    videoUrl: null,
    isPublished: true,
    order: 3,
    homework: [
      {
        id: "hw-3-required",
        category: "required",
        tasks: [
          {
            id: "task-3-1",
            lessonId: "lesson-3",
            title: "Clone fohlio-frontend and run it locally",
            description:
              "Install nvm and Node.js v20.12.2. Set up GitHub CLI token: run 'gh auth refresh -s read:packages' then set the yarn npm token (command from the lesson). Clone fohlio-frontend, run make setup, make use-test01, make s. Send a screenshot of the browser showing the running Fohlio app. If you get stuck at any step, include the terminal error in your screenshot.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 35,
            modelAnswer:
              "A correct screenshot shows the Fohlio app running in the browser at a localhost URL. Key checks: (1) the browser shows the login page or dashboard, not an error screen; (2) no red terminal errors in the background; (3) you are using Node 20.12.2 — run 'node --version' and include it if unsure. Common failures: wrong Node version (nvm not activated), missing GitHub token (yarn install fails with 401), missing .env.local (blank white page). For .env.local, message Ivan in Slack.",
          },
          {
            id: "task-3-2",
            lessonId: "lesson-3",
            title: "Describe what one FSD layer does — in your own words",
            description:
              "Pick any one layer from the FSD structure (1-app, 2-pages, 3-widgets, 4-features, 5-entities, or 6-shared). In 3-5 sentences, explain: (a) what kind of code belongs in that layer, (b) what kind of code must NOT go there and why, and (c) give one concrete example of something you found in that layer when you browsed the fohlio-frontend codebase. Do not just quote the lesson definition — use your own words and your own example from the real codebase.",
            category: "required",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 25,
            modelAnswer:
              "A strong answer names a specific layer and gives a concrete example from the actual codebase (e.g. 'In 5-entities I found a User entity that defines the shape of a user object and its API query — this is correct because entities are reusable data models. Business logic like redirecting after login does NOT belong here because that is a feature, not a data model'). Answers that just repeat the layer names without a real example from the codebase score lower. The goal is to demonstrate that you actually opened the folder and looked.",
          },
        ],
      },
      {
        id: "hw-3-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-3-3",
            lessonId: "lesson-3",
            title: "Challenge Cursor AI and catch its mistake",
            description:
              "Open fohlio-frontend in Cursor. Ask Cursor chat (Cmd+L) to explain the FSD layer structure of this specific project. Then: navigate the actual src/__fsd__/ folder yourself and find at least one place where Cursor's explanation was wrong, incomplete, or too generic. Write up: (a) what Cursor said, (b) what you actually found in the codebase that contradicts or refines it, (c) why you think Cursor got it wrong (training data, hallucination, over-generalization?). Metacognitive memo: what does this exercise tell you about when to trust AI explanations of a codebase vs when to verify yourself?",
            category: "advanced",
            submissionType: "text",
            order: 1,
            estimatedMinutes: 30,
            modelAnswer:
              "A strong response shows a genuine discrepancy — Cursor may give a textbook FSD explanation that doesn't match Fohlio's specific numbering convention (1-app through 6-shared), or it may miss project-specific patterns. The key is that you actually navigated the code to verify. The metacognitive memo should reach a concrete conclusion, e.g. 'AI is good for orientation but you must verify against the actual file tree for any specific project claim'. Vague answers ('Cursor was mostly right') without a specific example score lower.",
          },
          {
            id: "task-3-4",
            lessonId: "lesson-3",
            title: "Why environment variables — elaborative interrogation",
            description:
              "Answer in your own words: (1) Why are API keys and database URLs stored in .env.local files instead of directly in the code? What specifically would go wrong if a developer committed an API key to the git repository? (2) Why does the same codebase need different .env files for development, staging, and production? What breaks if you use the production database URL in development?",
            category: "advanced",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 20,
            modelAnswer:
              "(1) If an API key is committed to git, it becomes part of the permanent history of the repository. Anyone with access to the repo — now or in the future — can read it. On public repos, automated scanners find and abuse exposed keys within minutes. Even on private repos, rotating the key requires a git history rewrite or accepting the risk. (2) If development connects to the production database, every test, seed script, or accidental delete runs against real customer data. A developer running a migration locally would migrate production. Using staging/dev databases creates an isolated sandbox where mistakes are recoverable.",
          },
        ],
      },
    ],
  },
  {
    id: "lesson-4",
    slug: "ai-fundamentals",
    number: 4,
    title: "Understanding AI: LLMs, Agents & Tools",
    subtitle: "What is an LLM, context window, chatbots vs agents, MCP, skills & subagents",
    description:
      "Understand how Large Language Models work, what the context window is, the difference between chatbots and agents, and how MCP, skills, and subagents extend AI capabilities.",
    learningGoals: [
      "Understand what a Large Language Model (LLM) is and how it works at a high level",
      "Know what the context window is and why it matters",
      "Understand the difference between a chatbot and an agent",
      "Know what MCP (Model Context Protocol) is and why it exists",
      "Understand skills and subagents as building blocks for AI workflows",
    ],
    contentType: "html",
    contentFile: "lesson4-ai-fundamentals.html",
    videoUrl: null,
    isPublished: true,
    order: 4,
    referenceMaterials: [
      {
        title: "Skills Marketplace — discover and share AI skills",
        url: "https://skillsmp.com/",
      },
    ],
    homework: [
      {
        id: "hw-4-required",
        category: "required",
        tasks: [
          {
            id: "task-4-1",
            lessonId: "lesson-4",
            title: "Install Claude Desktop and connect Notion + Jira",
            description:
              "Download Claude Desktop from claude.ai/download. Go to Settings → Connectors and connect two tools: (1) Notion — click Add Connector, enter https://mcp.notion.com/mcp, complete OAuth. Ask Claude to summarize any Notion page. (2) Atlassian — add the Atlassian connector and connect it to our Jira. Ask Claude 'What are my open tickets?' or 'Summarize ticket FOH-XXXX'. Send one screenshot showing Claude successfully answering a question that required reading from one of these tools. Note: MCP connectors require a Pro/Max/Team Claude plan — message Ivan in Slack if you need access.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 30,
            modelAnswer:
              "A correct screenshot shows Claude's response to a question that required live data from Notion or Jira — not a generic answer Claude would give without the connector. Look for: Claude mentioning specific page names, ticket numbers, or content that only exists in your actual Notion or Jira. A screenshot of the Connectors settings page showing the tools listed is helpful but not sufficient on its own — we need to see Claude using the data. If a connector fails, include the error and what you tried.",
          },
          {
            id: "task-4-2",
            lessonId: "lesson-4",
            title: "Explain chatbot vs agent — in your own words",
            description:
              "Write 3-5 sentences explaining the difference between a chatbot and an agent. Requirements: (1) use a concrete example that is NOT from this lesson (not the travel-booking example); (2) explain what specifically the agent does that the chatbot cannot; (3) mention why this difference matters for a GTM team member's daily work. Do not quote the lesson — use your own analogy and your own example.",
            category: "required",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 20,
            modelAnswer:
              "A strong answer has three parts working together. Example: 'A chatbot is like asking a colleague a question — they answer from memory and that is where it ends. An agent is like giving that colleague a task and a set of tools: they go look things up, take actions, check the results, and report back. The key difference is that the agent can do multiple steps autonomously — for example, finding all open Jira tickets assigned to me, checking the corresponding Notion spec for each, and drafting a status update. For a GTM team member, this means I can delegate a 20-minute research task instead of just asking a single question.' Answers that just say 'chatbots respond, agents act' without a concrete multi-step example score lower.",
          },
        ],
      },
      {
        id: "hw-4-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-4-3",
            lessonId: "lesson-4",
            title: "Find the edge of the agent — process-visible task",
            description:
              "Give Claude Desktop (with at least Notion and Jira connected) a real multi-step task from your actual work this week — something that requires looking at 2+ sources and producing a useful output. Run it. Then: (a) describe the task and paste or summarize Claude's output; (b) identify one specific thing Claude got wrong or couldn't do — not a hypothetical, something that actually happened in this run; (c) explain why you think it failed there (context window? missing connector? bad reasoning?). Metacognitive memo: what does this tell you about which tasks are safe to delegate to an agent vs which ones need human judgment?\n\nNote: this task is deliberately harder than the lesson examples — finding the failure mode is the goal.",
            category: "advanced",
            submissionType: "text",
            order: 1,
            estimatedMinutes: 35,
            modelAnswer:
              "A strong response names a real task (e.g. 'I asked Claude to summarize all my open Jira tickets and cross-reference the related Notion specs'). The failure should be specific and real — Claude hallucinated a ticket number, missed a page because it was in a different Notion workspace, lost track of context partway through, or gave a confident wrong answer. The metacognitive memo should reach a concrete rule of thumb, e.g. 'tasks with verifiable outputs (find this ticket, read this page) are safer than tasks requiring judgment (prioritize these tickets by business impact)'. Generic answers ('AI is good but not perfect') score lower.",
          },
          {
            id: "task-4-4",
            lessonId: "lesson-4",
            title: "Why the context window matters — elaborative interrogation",
            description:
              "Answer in your own words: (1) Why does the context window cause problems in long conversations, even if the total text fits within the limit? What specifically happens to the quality of responses as context fills up? (2) Why can't AI companies just make the context window unlimited? What are the real constraints?",
            category: "advanced",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 20,
            modelAnswer:
              "(1) Even before hitting the hard limit, long contexts degrade quality because the model's attention is spread across more tokens — older information gets less 'weight' in the response. In practice, instructions given at the start of a long conversation are followed less precisely near the end. The model may also start contradicting itself or forgetting constraints you set early on. (2) Processing more tokens requires proportionally more compute (attention is quadratic in context length). A 10x longer context doesn't cost 10x more — it costs much more. There are also physical memory limits on current hardware. Researchers are working on efficient attention mechanisms, but there is no free lunch: longer context = higher latency and cost per response.",
          },
        ],
      },
    ],
  },
  {
    id: "lesson-5",
    slug: "mcp-in-practice",
    number: 5,
    title: "MCP in Practice: Connecting AI to Your Tools",
    subtitle: "API vs MCP, Claude Desktop & Manus setup, MCP catalog for GTM teams",
    description:
      "Understand what APIs are and how MCP differs from them, learn to add MCP servers to Claude Desktop and Manus step by step, and discover a curated catalog of MCP tools for GTM teams.",
    learningGoals: [
      "Understand what an API is and how MCP differs from traditional APIs",
      "Know how to add MCP servers to Claude Desktop step by step",
      "Know what Manus is and how to add MCP servers to it",
      "Have a catalog of useful MCP servers for GTM teams",
      "Be able to connect AI to your actual work tools: Notion, Jira, GitHub, HubSpot, and more",
    ],
    contentType: "html",
    contentFile: "lesson5-mcp-in-practice.html",
    videoUrl: null,
    isPublished: true,
    order: 5,
    referenceMaterials: [
      {
        title: "MCP Registry (official) — discover public MCP servers",
        url: "https://registry.modelcontextprotocol.io/",
      },
      {
        title: "MCP Servers (GitHub) — reference implementations",
        url: "https://github.com/modelcontextprotocol/servers",
      },
      {
        title: "mcp.so — largest community MCP server catalog",
        url: "https://mcp.so",
      },
      {
        title: "PulseMCP — MCP server ratings and analytics",
        url: "https://pulsemcp.com",
      },
      {
        title: "Smithery — MCP server marketplace",
        url: "https://smithery.ai",
      },
      {
        title: "HubSpot MCP — official setup guide",
        url: "https://developers.hubspot.com/mcp",
      },
      {
        title: "Manus AI — autonomous agent platform",
        url: "https://manus.im",
      },
    ],
    homework: [
      {
        id: "hw-5-required",
        category: "required",
        tasks: [
          {
            id: "task-5-1",
            lessonId: "lesson-5",
            title: "Connect 3 MCP tools and solve a real work question",
            description:
              "Connect at least 3 tools in Claude Desktop via Settings → Connectors (Notion, Atlassian/Jira, plus one more of your choice). Then find a real question from your actual work this week that requires looking at 2+ of those sources. Ask Claude with all tools connected. Send one screenshot showing Claude's answer to your real question. In 2-3 sentences: what surprised you, and how long would this have taken before MCP? (Tip: use a question you actually needed answered, not a demo question — transfer to real work is the point.)",
            category: "required",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 35,
            modelAnswer:
              "A correct screenshot shows Claude answering a genuine work question using data from at least two connected tools — for example, cross-referencing a Jira ticket with a Notion spec, or pulling a GitHub PR and its linked issue. The 2-3 sentence reflection should be specific: 'I asked Claude to find all Jira tickets tagged with my name and match them to the Notion pages they reference. It took 40 seconds. Manually this would have been 15 minutes of tab-switching.' Vague answers ('it was faster than expected') score lower.",
          },
          {
            id: "task-5-2",
            lessonId: "lesson-5",
            title: "Design your MCP workflow — current vs future state",
            description:
              "This is a cumulative task combining Lessons 3 and 5. Think about your role and a repeated weekly task. Write up the workflow in this exact format:\n\nTool stack: [list 3-5 MCP tools you would connect]\nOld way: [describe how you do this task today, step by step — be specific]\nMCP way: [describe how Claude + MCP would handle it]\nEstimated time saved per week: [your honest estimate in minutes]\nArchitecture note: In Lesson 3 you learned that fohlio-frontend communicates with the backend via GraphQL. How is MCP's tool protocol similar to or different from that pattern? (2-3 sentences — connect the technical concept from L3 to what you now understand about MCP.)",
            category: "required",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 30,
            modelAnswer:
              "A strong workflow answer is role-specific and concrete. The architecture note is the key check: a good answer notices that both GraphQL and MCP define a typed interface between a client and a data source — GraphQL queries specific fields from the backend, MCP requests specific tools from a server. The difference is that MCP is designed for AI agents to discover and invoke tools dynamically, whereas GraphQL is a fixed schema the developer writes against. Answers that just say 'both are ways to get data' without noting the dynamic discovery aspect are incomplete.",
          },
        ],
      },
      {
        id: "hw-5-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-5-3",
            lessonId: "lesson-5",
            title: "Try Manus vs Claude Desktop — comparative judgment",
            description:
              "Give the same real task to both Manus (manus.im) and Claude Desktop with your connected MCP tools. The task should be something requiring research + synthesis (e.g. analyze a competitor, draft an account brief, summarize a set of Jira tickets). Run both. Then write: (a) what each tool produced, (b) which was better for this task and why, (c) for what type of GTM task would you use Manus vs Claude Desktop going forward? Send a screenshot of one result (whichever was more interesting). Metacognitive memo: what assumption did you have before running this that the experiment changed?",
            category: "advanced",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 40,
            modelAnswer:
              "A strong answer runs the same task on both tools and makes a genuine comparison — not 'Manus was better' but 'Manus produced a more structured report because it can browse the web autonomously, while Claude Desktop with MCP was faster for tasks entirely within tools I had already connected.' The metacognitive memo should name a real changed assumption, e.g. 'I assumed Claude Desktop would be slower because it needs connectors pre-configured, but it was actually more accurate on internal data.' Answers that only run one tool score lower.",
          },
          {
            id: "task-5-4",
            lessonId: "lesson-5",
            title: "Why MCP instead of direct API calls — elaborative interrogation",
            description:
              "Answer in your own words: (1) If an AI model can already call APIs directly with the right code, why does MCP exist as a separate standard? What problem does it solve that 'just call the API' does not? (2) Why is the standardization aspect of MCP valuable, and not just the ability to connect tools? What breaks without a standard?",
            category: "advanced",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 20,
            modelAnswer:
              "(1) Calling an API directly requires writing integration code for every service, handling authentication differently for each, and the AI model cannot discover what a service can do — it must be pre-programmed. MCP gives services a standard way to advertise their capabilities so an AI agent can discover tools at runtime without bespoke integration code per service. (2) Without a standard, every AI client (Claude, GPT, Gemini) would need a custom connector for every tool. Tool builders would have to publish four versions of their integration. With a standard, you build the MCP server once and any compliant client works. This is exactly the USB analogy: before USB, every device needed a different port on the computer.",
          },
        ],
      },
    ],
  },
  {
    id: "lesson-6",
    slug: "skills-for-gtm",
    number: 6,
    title: "Skills: Teaching AI How You Work",
    subtitle: "Agent Skills in Manus & Claude, the GTM skill stack, and building your first skill in 10 minutes",
    description:
      "Understand what Claude Skills are and how they differ from prompts and MCP. Learn the canonical mental model (Skills = Brain, MCP = Hands, Subagents = Workers), use Anthropic's built-in document skills, build your first custom skill via Skill Creator, and install proven skills tailored to your GTM role.",
    learningGoals: [
      "Understand what an Agent Skill is and how it differs from a prompt or MCP connector",
      "Know the canonical mental model: MCP = Hands, Skills = Brain, Subagents = Workers",
      "Be able to use Anthropic's built-in document skills (pptx, xlsx, docx, pdf, brand-guidelines)",
      "Build your first custom Skill in Manus via auto-package (no code, no YAML editing)",
      "Know how to write a description that actually triggers (the make-or-break field)",
      "Have a curated GTM skill stack — Manus Playbooks + community Claude skills tailored to your role",
    ],
    contentType: "html",
    contentFile: "lesson6-skills-for-gtm.html",
    videoUrl: null,
    isPublished: true,
    order: 6,
    referenceMaterials: [
      {
        title: "Anthropic — Equipping agents for the real world with Agent Skills (engineering blog)",
        url: "https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills",
      },
      {
        title: "Skills explained: How Skills compares to prompts, Projects, MCP, and subagents (Anthropic)",
        url: "https://claude.com/blog/skills-explained",
      },
      {
        title: "Agent Skills overview — official Claude API docs",
        url: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      },
      {
        title: "Skill authoring best practices — official Claude API docs",
        url: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices",
      },
      {
        title: "anthropics/skills — official Anthropic skills repository (20k+ stars)",
        url: "https://github.com/anthropics/skills",
      },
      {
        title: "Agent Skills Specification (open standard, Dec 2025)",
        url: "https://agentskills.io",
      },
      {
        title: "The Complete Guide to Building Skills for Claude (Anthropic, 32-page PDF)",
        url: "https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf",
      },
      {
        title: "Summit53 — 7 open-source Claude Code skills for sales leaders",
        url: "https://www.summit53.com/blog/claude-code-skills-sales-intelligence",
      },
      {
        title: "alirezarezvani/claude-skills — customer-success-manager skill (open source)",
        url: "https://github.com/alirezarezvani/claude-skills",
      },
      {
        title: "OpenClaudia — 34 open-source marketing skills (MIT license)",
        url: "https://github.com/OpenClaudia/openclaudia-skills",
      },
      {
        title: "FunnelStory — Claude Skills for CSMs (15 slash commands)",
        url: "https://docs.funnelstory.ai/guides/claude-skills-for-csm",
      },
      {
        title: "Awesome Claude Skills directory (1,030+ entries)",
        url: "https://awesome-skills.com/",
      },
      {
        title: "Skills Marketplace (skillsmp.com)",
        url: "https://skillsmp.com/",
      },
      {
        title: "Manus AI Embraces Open Standards: Integrating Agent Skills",
        url: "https://manus.im/blog/manus-skills",
      },
      {
        title: "Manus Agent Skills — feature page",
        url: "https://manus.im/features/agent-skills",
      },
      {
        title: "Manus Playbook — ready-to-run GTM templates",
        url: "https://manus.im/playbook",
      },
      {
        title: "Manus Projects — persistent context + knowledge base",
        url: "https://manus.im/docs/features/projects",
      },
    ],
    homework: [
      {
        id: "hw-6-required",
        category: "required",
        tasks: [
          {
            id: "task-6-1",
            lessonId: "lesson-6",
            title: "Run a Playbook and build your first Skill",
            description:
              "Part A — Playbook: Open manus.im/playbook and pick one playbook matching your role (Sales: B2B Sales Deck Generator / Sales Funnel Builder; Marketing: Reddit Sentiment Analyzer / Marketing Presentation Maker; CS: Account Health Analyzer; RevOps: Commission Calculator; PMM: PRD Templates). Run it on a real task from this week. Part B — Skill: In the same or a new Manus conversation, run a repeated weekly task end-to-end, then type 'Package this workflow into a Skill.' Open the Skill Library, rename it to kebab-case, and trigger it with /your-skill-name in a fresh chat. Send one screenshot showing the skill activated via slash command. In 3-4 sentences: what worked, what surprised you, and how long the manual version of this task takes you normally.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 40,
            modelAnswer:
              "A correct screenshot shows the slash command /your-skill-name typed in a fresh Manus chat and the skill responding with structured output — not a generic AI response. Key checks: the skill name is in kebab-case, the output is recognizably shaped by the workflow you ran (not a blank template), and the slash command triggered it (not a manual prompt). The 3-4 sentence reflection should name something specific that surprised you about the auto-package experience — e.g. 'I expected to write YAML but Manus generated the SKILL.md entirely from the conversation' or 'The description it auto-wrote was too generic and I had to rewrite it.'",
          },
          {
            id: "task-6-2",
            lessonId: "lesson-6",
            title: "Write a great Skill description — and connect it to L4",
            description:
              "This is a cumulative task combining Lessons 4 and 6. Part A — Description: Open your skill from task #1 in the Manus Skill Library. Rewrite its description applying all four rules from Part 6: (1) WHAT + WHEN + trigger phrases; (2) matchable phrases front-loaded in the first 250 chars; (3) pushy trigger language; (4) describe WHEN, not HOW. Submit the description (under 1024 chars) plus one sentence per rule explaining how your description applies it. Part B — L4 connection: In Lesson 4 you learned the difference between a chatbot and an agent. In 2-3 sentences: is a Manus Skill closer to a chatbot or an agent behavior? Use the definition from L4 to justify your answer.",
            category: "required",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 30,
            modelAnswer:
              "Part A: a strong description starts with a trigger phrase like 'Use this skill whenever...' or 'Activate when you need to...' followed immediately by the specific scenario. The first 250 characters should contain words a GTM person would naturally type when they need this help. Rule 4 means the description says 'when preparing a renewal call brief' not 'this skill fetches data from Jira and formats it into sections.' Part B: a Skill is closer to an agent behavior — it encodes a multi-step workflow with defined inputs and outputs, not a single-turn response. A chatbot (L4 definition) responds to one prompt; a Skill packages a sequence of steps that run autonomously. However, a Skill without live tool access (MCP) behaves more like a chatbot — the distinction depends on what connectors are active.",
          },
        ],
      },
      {
        id: "hw-6-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-6-3",
            lessonId: "lesson-6",
            title: "Compose a Manus Project + Skill — with comparison",
            description:
              "Create a Manus Project for your role (e.g. 'Fohlio Sales' or 'Fohlio CS'). Write a Master Instruction with your role, ICP, and 3-5 brand voice principles. Upload 2-3 knowledge files (battlecards, ICP doc, brand guidelines, or sales playbook). Run your skill from task #1 inside that Project. Then run the same skill outside the Project. Send a screenshot of both outputs. Write one paragraph comparing them: what changed, and why does persistent context in a Project change the output quality? Metacognitive memo: what assumption about AI context did this experiment update for you?",
            category: "advanced",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 40,
            modelAnswer:
              "A strong comparison paragraph names specific differences — e.g. 'Inside the Project, Claude referenced our ICP doc and used Fohlio's terminology for deal stages. Outside, it gave a generic B2B SaaS template. The Project's Master Instruction acted as persistent system context that shaped every output.' The metacognitive memo should update a belief, e.g. 'I assumed context was context — a long prompt would do the same thing. The Project showed that structured, persistent knowledge is different from dumping text into a single conversation.'",
          },
          {
            id: "task-6-4",
            lessonId: "lesson-6",
            title: "Why the description is the make-or-break field — elaborative interrogation",
            description:
              "Answer in your own words: (1) Why does the skill description determine whether the agent triggers the skill at all? What is the agent actually doing when it decides which skill to use? (2) Why does 'describe WHEN not HOW' matter? If the description explains the steps in detail, why would that hurt rather than help?",
            category: "advanced",
            submissionType: "text",
            order: 2,
            estimatedMinutes: 20,
            modelAnswer:
              "(1) The agent uses the description as a semantic signal to match against the user's request. It is not reading a menu — it is doing a similarity match between the user's intent and the description text. If the description uses jargon or internal names that don't match how users phrase requests, the skill is invisible even if it is installed. (2) 'HOW' descriptions fill the character limit with implementation details that users never say. 'This skill fetches from Jira, formats into sections, and outputs a PDF' does not match any natural language request. 'Use this skill when preparing for a renewal call and you need a quick account brief' matches 'help me prep for my renewal with Acme Corp'. The HOW is the skill's job — the WHEN is the trigger.",
          },
        ],
      },
    ],
  },
];

export function getLessonBySlug(slug: string): LegacyLesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonByNumber(num: number): LegacyLesson | undefined {
  return LESSONS.find((l) => l.number === num);
}

export function getPublishedLessons(): LegacyLesson[] {
  return LESSONS.filter((l) => l.isPublished);
}

export function getAllHomeworkTasks(lesson: LegacyLesson) {
  return lesson.homework.flatMap((section) => section.tasks);
}
