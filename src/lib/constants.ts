interface LegacyHomeworkTask {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  category: "required" | "advanced";
  submissionType: "pr_link" | "screenshot" | "text" | "quiz" | "checklist" | "widget";
  order: number;
  quizQuestions?: string[];
  checklistItems?: string[];
  widgetId?: string;
  widgetConfig?: Record<string, unknown>;
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
            title: "Why Git — pick the real reason",
            description:
              "Imagine your teammate says: 'Why can't we just put files in Dropbox or Google Drive and edit together? Why do we need Git at all?' Pick the strongest answer below and justify it in your own words — at least 25 words. The justification is the actual task; the choice without it does not count.",
            category: "required",
            submissionType: "widget",
            order: 1,
            estimatedMinutes: 12,
            widgetId: "mcq-justify",
            widgetConfig: {
              question:
                "Why do software teams use Git instead of just sharing files via Dropbox / Google Drive?",
              options: [
                {
                  id: "a",
                  label: "Git is free and Dropbox costs money.",
                },
                {
                  id: "b",
                  label:
                    "Git records the full history of every change as named commits and lets multiple people work in parallel on isolated branches without overwriting each other.",
                },
                {
                  id: "c",
                  label:
                    "Git stores files in the cloud automatically so you do not lose work.",
                },
                {
                  id: "d",
                  label:
                    "Git makes the code run faster than editing files directly.",
                },
              ],
              correctOptionId: "b",
              minJustificationWords: 25,
              rubric:
                "A strong justification names BOTH parallel work (branches) and history/traceability (commits). It also explains what would break with Dropbox — silent overwrites, no review point, no way to undo a change to a single file from yesterday.",
            },
            modelAnswer:
              "B is correct. Dropbox just synchronizes the latest version — when two people save at once, one overwrites the other silently. Git keeps the full history as named commits and lets each person work on a branch in isolation, so changes are reviewed and merged deliberately, not by 'whoever saved last wins'.",
          },
          {
            id: "task-1-2",
            lessonId: "lesson-1",
            title: "Match the Git vocabulary",
            description:
              "Drag each Git term to its plain-English definition. These are the four words you will see every single day in this course — repository, commit, branch, remote.",
            category: "required",
            submissionType: "widget",
            order: 2,
            estimatedMinutes: 10,
            widgetId: "concept-match",
            widgetConfig: {
              pairs: [
                {
                  id: "repo",
                  term: "Repository",
                  definition:
                    "The folder that Git is tracking — contains your code and the full history of every change.",
                },
                {
                  id: "commit",
                  term: "Commit",
                  definition:
                    "A named snapshot of your changes with a message — the unit of history Git stores.",
                },
                {
                  id: "branch",
                  term: "Branch",
                  definition:
                    "An isolated line of work that lets you change code without affecting main until you are ready to merge.",
                },
                {
                  id: "remote",
                  term: "Remote",
                  definition:
                    "A copy of the repository hosted somewhere else (usually GitHub) that the team pushes to and pulls from.",
                },
                {
                  id: "main",
                  term: "main",
                  definition:
                    "The default branch — the version of the code that everyone treats as the source of truth.",
                },
              ],
            },
            modelAnswer:
              "Repository is the folder; commit is one named snapshot in its history; branch is a parallel line of work; remote is the shared copy (usually on GitHub); main is the trunk everyone treats as the source of truth.",
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
            title: "Install Cursor + make your first commit",
            description:
              "Install Cursor from cursor.com. Open the integrated terminal (Cmd+` / Ctrl+`). Clone the fohlio-ai-courses repo, create a branch YOUR-NAME-hello, add a hello.txt file with one sentence about why you joined this course, then 'git add .', 'git commit -m \"Hello from YOUR-NAME\"', 'git log --oneline'. Send a screenshot of the terminal showing the git log output with your commit on your branch.",
            category: "advanced",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 30,
            modelAnswer:
              "A correct screenshot shows Cursor's integrated terminal with git log --oneline output that includes your commit hash and message. Verify: (1) 'git branch' shows your branch with the asterisk (not main), (2) the commit message is meaningful, (3) hello.txt is in the working tree, (4) 'git status' says 'nothing to commit, working tree clean'. Common miss: forgetting 'git add .' — 'git status' will show the file as untracked if so.",
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
            title: "Map Fohlio's environments to what they mean",
            description:
              "Match each piece of Fohlio's stack to its actual role. These are the names you will see in Slack threads and on PR descriptions every week — knowing which is which is the whole point.",
            category: "required",
            submissionType: "widget",
            order: 1,
            estimatedMinutes: 10,
            widgetId: "concept-match",
            widgetConfig: {
              pairs: [
                {
                  id: "fe",
                  term: "Frontend (fohlio-frontend)",
                  definition:
                    "The React app the user actually sees in the browser — pages, buttons, forms.",
                },
                {
                  id: "be",
                  term: "Backend",
                  definition:
                    "The server that owns the data, auth, and business logic — talks to the frontend over GraphQL.",
                },
                {
                  id: "test01",
                  term: "test01 / uat01",
                  definition:
                    "Staging servers — a copy of production where changes are tested before real users see them.",
                },
                {
                  id: "prod",
                  term: "Production",
                  definition:
                    "The real Fohlio that paying customers use — a bug here costs money.",
                },
                {
                  id: "jira",
                  term: "FOH-XXXX prefix on a branch",
                  definition:
                    "Links the branch to its Jira ticket so anyone reading git log can find the spec and context.",
                },
              ],
            },
            modelAnswer:
              "Frontend = React app in the browser; Backend = the GraphQL data/auth layer; test01/uat01 = staging copies of prod; Production = real customers; FOH-XXXX = Jira ticket prefix that makes every commit traceable to its spec.",
          },
          {
            id: "task-2-2",
            lessonId: "lesson-2",
            title: "You hit a merge conflict — what now?",
            description:
              "Walk through a real Git flow scenario step by step. There is one correct path; the others are common mistakes new engineers make. Pick at each branch and explain your reasoning when prompted.",
            category: "required",
            submissionType: "widget",
            order: 2,
            estimatedMinutes: 15,
            widgetId: "decision-tree",
            widgetConfig: {
              rootId: "start",
              nodes: {
                start: {
                  id: "start",
                  question:
                    "You finished your task on branch FOH-1234-fix-login. You try to merge main in and Git says: CONFLICT (content): Merge conflict in src/Login.tsx. What do you do first?",
                  options: [
                    {
                      label:
                        "Run 'git reset --hard main' to wipe your changes and start over.",
                      outcome: {
                        kind: "wrong",
                        explanation:
                          "That destroys your work. Conflicts are normal — they mean two people changed the same lines. You need to resolve, not delete.",
                      },
                    },
                    {
                      label:
                        "Open the conflicting file in Cursor and look at the <<<<<<< / ======= / >>>>>>> markers to see both versions.",
                      nextNodeId: "openFile",
                    },
                    {
                      label:
                        "Force-push your branch with 'git push --force' so main is overwritten with your version.",
                      outcome: {
                        kind: "wrong",
                        explanation:
                          "Force-push overwrites the shared branch and erases your teammate's work. Never force-push main. The whole point of a conflict is that Git refuses to silently lose changes.",
                      },
                    },
                  ],
                },
                openFile: {
                  id: "openFile",
                  question:
                    "You see both versions of the changed code separated by conflict markers. What now?",
                  options: [
                    {
                      label:
                        "Pick HEAD (your version) every time — your code is newer so it must be right.",
                      outcome: {
                        kind: "wrong",
                        explanation:
                          "'Newer wins' silently discards your teammate's change. The conflict exists exactly because Git cannot tell which intent is correct — you have to read both and decide.",
                      },
                    },
                    {
                      label:
                        "Read both sides, combine the changes so both intents are preserved, delete the markers, run the app to confirm it still works, then commit.",
                      nextNodeId: "commit",
                    },
                    {
                      label:
                        "Ask Cursor AI to auto-resolve every conflict without looking at the result.",
                      outcome: {
                        kind: "suboptimal",
                        explanation:
                          "Cursor can suggest a resolution, but you still have to read it and run the code. Blindly accepting AI conflict resolution is how silent regressions ship to prod.",
                      },
                    },
                  ],
                },
                commit: {
                  id: "commit",
                  question:
                    "Conflict resolved, app runs locally. What's the right final step before opening the PR?",
                  options: [
                    {
                      label:
                        "Stage the resolved files, commit with a clear message, push the branch, open a PR with the FOH-1234 ticket linked.",
                      outcome: {
                        kind: "correct",
                        explanation:
                          "Exactly. Staging confirms the resolution, the commit records what you decided, and the PR lets a teammate review before it hits main.",
                      },
                    },
                    {
                      label:
                        "Skip the commit and push the resolved files straight to test01.",
                      outcome: {
                        kind: "wrong",
                        explanation:
                          "You cannot 'push to test01' directly — staging is deployed FROM main (or a release branch) after merge. The PR is the review gate.",
                      },
                    },
                  ],
                },
              },
            },
            modelAnswer:
              "Correct path: open the file, read both versions, merge them intentionally, run the app, commit, push, PR. Wrong paths: hard reset (loses work), force push (overwrites teammates), blind AI auto-resolve (silent regressions), 'newer wins' (silently drops one side's intent).",
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
            title: "Run fohlio-frontend locally + explore the codebase",
            description:
              "Clone fohlio-frontend, run 'make setup', 'make use-test01', 'make s', and open the printed localhost URL. Then open Cursor and find three things in the code: the login page file, where GraphQL queries are defined, and what 'make s' actually runs (open the Makefile). Submit one screenshot — the browser showing the Fohlio login page — and 3-4 sentences naming the file paths you found and one thing that surprised you about the structure.",
            category: "advanced",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 35,
            modelAnswer:
              "A correct screenshot shows the Fohlio login page at a localhost URL. The reflection should name real file paths (not just folder names) for the login page and a GraphQL query, plus what 'make s' wraps. Surprises are usually about the FSD layer numbering, the Makefile abstraction, or how thin individual files are. If 'make s' errors: likely wrong Node version, missing yarn deps, or missing .env.local — message Ivan.",
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
            title: "Fill in a real Fohlio .env.local",
            description:
              "Fill in the missing pieces of a Fohlio frontend .env.local file. Each blank teaches you which variable controls what. There is one canonical correct value per blank — match exactly what the lesson and the Makefile expect.",
            category: "required",
            submissionType: "widget",
            order: 1,
            estimatedMinutes: 12,
            widgetId: "code-fill",
            widgetConfig: {
              language: "bash",
              code: "# fohlio-frontend / .env.local\n# Tells the React app which backend to talk to:\nREACT_APP_API_URL=https://{{1}}.fohlio.com/graphql\n\n# Node version pinned by .nvmrc (use 'nvm use' to activate):\nNODE_VERSION={{2}}\n\n# Token used by yarn to download @fohlio/ui-kit from GitHub Packages.\n# Generated by: gh auth refresh -s read:packages\nNPM_AUTH_TOKEN={{3}}\n\n# Which dev environment 'make s' should point at by default:\nFOHLIO_ENV={{4}}\n",
              blanks: [
                {
                  id: "1",
                  placeholder: "staging hostname",
                  answer: "test01",
                  accept: ["test01", "uat01"],
                },
                {
                  id: "2",
                  placeholder: "Node version",
                  answer: "20.12.2",
                  accept: ["20.12.2", "v20.12.2"],
                },
                {
                  id: "3",
                  placeholder: "gh token env var",
                  answer: "$GITHUB_TOKEN",
                  accept: [
                    "$GITHUB_TOKEN",
                    "${GITHUB_TOKEN}",
                    "GITHUB_TOKEN",
                  ],
                },
                {
                  id: "4",
                  placeholder: "default env",
                  answer: "test01",
                  accept: ["test01"],
                },
              ],
            },
            modelAnswer:
              "Blank 1 = test01 (staging hostname used by 'make use-test01'). Blank 2 = 20.12.2 (pinned by .nvmrc — wrong Node version is the #1 cause of 'make setup' failing). Blank 3 = $GITHUB_TOKEN (yarn needs read:packages to install @fohlio/ui-kit from GitHub Packages — 401 = missing token). Blank 4 = test01 (the env 'make s' points at unless you switch).",
          },
          {
            id: "task-3-2",
            lessonId: "lesson-3",
            title: "FSD layers — where does each thing belong?",
            description:
              "Three short multiple-choice questions about the FSD (Feature-Sliced Design) structure inside fohlio-frontend's src/__fsd__/. Pick the layer, then write one sentence justifying the choice. Open the actual folder if you need to check.",
            category: "required",
            submissionType: "widget",
            order: 2,
            estimatedMinutes: 15,
            widgetId: "quiz-explain",
            widgetConfig: {
              minExplanationWords: 12,
              questions: [
                {
                  id: "q1",
                  prompt:
                    "You are building the 'Create New Project' page. The page itself — its route, its layout, the data it loads on mount — should live in which layer?",
                  options: [
                    { id: "app", label: "1-app" },
                    { id: "pages", label: "2-pages" },
                    { id: "widgets", label: "3-widgets" },
                    { id: "shared", label: "6-shared" },
                  ],
                  correctOptionId: "pages",
                  rubric:
                    "Pages own the route + composition. App is for providers and global config; widgets are reusable UI blocks like a sidebar; shared is for cross-feature primitives.",
                },
                {
                  id: "q2",
                  prompt:
                    "You wrote a small Button component that the entire app reuses — no business logic, no API calls, just a styled button. Which layer?",
                  options: [
                    { id: "entities", label: "5-entities" },
                    { id: "features", label: "4-features" },
                    { id: "shared", label: "6-shared" },
                    { id: "pages", label: "2-pages" },
                  ],
                  correctOptionId: "shared",
                  rubric:
                    "Shared is for cross-cutting UI primitives and helpers with no business meaning. Entities = data models like User/Project; features = a single user-facing capability; pages = full routes.",
                },
                {
                  id: "q3",
                  prompt:
                    "A 'User' object — its TypeScript type, its GraphQL query, the hook that fetches it — should live in which layer?",
                  options: [
                    { id: "pages", label: "2-pages" },
                    { id: "features", label: "4-features" },
                    { id: "entities", label: "5-entities" },
                    { id: "shared", label: "6-shared" },
                  ],
                  correctOptionId: "entities",
                  rubric:
                    "Entities are reusable data models — the shape + how to fetch it. Pages would couple the User type to one screen; features are about user actions; shared is too generic.",
                },
              ],
            },
            modelAnswer:
              "Q1 = pages (a route + composition lives in 2-pages). Q2 = shared (a generic Button is a cross-cutting primitive in 6-shared). Q3 = entities (the User data model + its query are in 5-entities so every feature can reuse it). The general rule: lower-numbered layers may import from higher-numbered ones, never the other way.",
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
            title: "Challenge Cursor AI on the FSD structure",
            description:
              "Open fohlio-frontend in Cursor. Ask Cursor chat (Cmd+L) to explain the FSD layer structure of this specific project. Then navigate src/__fsd__/ yourself and find at least one place where Cursor's explanation was wrong, incomplete, or too generic. Write up: (a) what Cursor said, (b) what you actually found that contradicts or refines it, (c) why you think Cursor got it wrong (training data, hallucination, over-generalization?). Metacognitive memo: when do you trust AI explanations of a codebase, and when do you verify?",
            category: "advanced",
            submissionType: "text",
            order: 1,
            estimatedMinutes: 30,
            modelAnswer:
              "A strong response names a real discrepancy — e.g. Cursor gives a textbook FSD explanation that misses Fohlio's specific 1- through 6- numbering convention, or invents a layer that doesn't exist. The metacognitive memo should land on a concrete rule like 'AI is good for orientation but for any project-specific claim — file paths, naming conventions, internal patterns — I verify against the actual tree before quoting it.'",
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
            title: "Match the AI building blocks",
            description:
              "Match each term from Lesson 4 to its plain-English definition. These five words — LLM, context window, agent, MCP, skill — are the vocabulary you will use for the rest of the course.",
            category: "required",
            submissionType: "widget",
            order: 1,
            estimatedMinutes: 10,
            widgetId: "concept-match",
            widgetConfig: {
              pairs: [
                {
                  id: "llm",
                  term: "LLM (Large Language Model)",
                  definition:
                    "A model trained to predict the next token of text — the underlying engine behind Claude, ChatGPT, Gemini.",
                },
                {
                  id: "context",
                  term: "Context window",
                  definition:
                    "The total amount of text (in tokens) the model can see in one conversation — older messages fall out or lose weight when it fills up.",
                },
                {
                  id: "chatbot",
                  term: "Chatbot",
                  definition:
                    "Single-turn responder — answers from what it already knows; no tools, no autonomous multi-step actions.",
                },
                {
                  id: "agent",
                  term: "Agent",
                  definition:
                    "An LLM that can call tools, run multiple steps autonomously, observe results, and adapt — does work, not just answers.",
                },
                {
                  id: "mcp",
                  term: "MCP (Model Context Protocol)",
                  definition:
                    "An open standard that lets an AI client discover and invoke external tools (Notion, Jira, GitHub) without bespoke per-tool code.",
                },
                {
                  id: "skill",
                  term: "Skill",
                  definition:
                    "A packaged, reusable workflow with a trigger description — teaches the agent HOW you want a recurring task done.",
                },
              ],
            },
            modelAnswer:
              "LLM = next-token model under the hood; context window = how much text it can hold at once; chatbot = single-turn answers; agent = multi-step tool user; MCP = standard plug for tools; skill = packaged workflow with a trigger. The canonical mental model from the lesson: MCP = Hands, Skills = Brain, Subagents = Workers.",
          },
          {
            id: "task-4-2",
            lessonId: "lesson-4",
            title: "Chatbot or agent — pick the real distinction",
            description:
              "Someone on the GTM team asks you 'so what is the actual difference between Claude in the browser and an agent? Aren't they both just AI?'. Pick the most accurate answer below and justify it in your own words — at least 30 words. The justification must use a concrete multi-step example, NOT the travel-booking example from the lesson.",
            category: "required",
            submissionType: "widget",
            order: 2,
            estimatedMinutes: 15,
            widgetId: "mcq-justify",
            widgetConfig: {
              question:
                "What is the real difference between a chatbot (Claude in the browser, ChatGPT default) and an agent?",
              options: [
                {
                  id: "a",
                  label:
                    "Agents are bigger LLMs with more parameters; chatbots use smaller models.",
                },
                {
                  id: "b",
                  label:
                    "Agents have access to tools and can take multiple autonomous steps — observe a result, decide what to do next, and act — while a chatbot is a single-turn responder.",
                },
                {
                  id: "c",
                  label:
                    "Agents only work via API; chatbots only work in a browser.",
                },
                {
                  id: "d",
                  label:
                    "Chatbots are always wrong; agents are always right.",
                },
              ],
              correctOptionId: "b",
              minJustificationWords: 30,
              rubric:
                "Strong justification names a concrete multi-step task the agent does that a chatbot cannot — e.g. 'find all my open Jira tickets, open the linked Notion page for each, draft a status update'. Tie it to a real GTM workflow you would actually delegate.",
            },
            modelAnswer:
              "B is correct. The size of the model is independent — both can use the same LLM. What makes something an agent is the tool loop: read user goal, call a tool (Jira, Notion, web), observe the result, decide the next step, repeat until done. A chatbot ends after one reply. For GTM, that is the difference between 'tell me about HubSpot' and 'pull my 10 open opportunities, summarize each, flag the ones with no activity in 14 days'.",
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
            title: "Find the edge of the agent — real task on real data",
            description:
              "Install Claude Desktop, connect Notion and Jira via Settings → Connectors. Give Claude a real multi-step task from your work this week — something that requires looking at 2+ sources and producing a useful output. Run it. Then write: (a) the task and a summary of Claude's output, (b) one specific thing Claude got wrong or couldn't do (real, not hypothetical), (c) your theory of why it failed (context window? missing connector? bad reasoning?). Metacognitive memo: which kinds of tasks are safe to delegate to an agent, and which still need human judgment?",
            category: "advanced",
            submissionType: "text",
            order: 1,
            estimatedMinutes: 35,
            modelAnswer:
              "A strong response names a real task ('summarize my 8 open Jira tickets and cross-reference the linked Notion specs'), a specific failure (hallucinated ticket number, missed a page in a separate workspace, lost a constraint partway through), and a plausible cause (context filled up, connector scope was too narrow, ambiguous prompt). The memo should land on a concrete rule like 'verifiable look-up tasks are safe; tasks requiring judgment on business impact still need a human checkpoint.'",
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
            title: "API or MCP — pick the right tool for the job",
            description:
              "A teammate asks you whether to use 'the regular HubSpot API' or 'an MCP connector' for their AI workflow. Walk this scenario down the decision tree. At each branch, pick the choice you think is right — wrong picks include the most common GTM misconceptions about MCP.",
            category: "required",
            submissionType: "widget",
            order: 1,
            estimatedMinutes: 15,
            widgetId: "decision-tree",
            widgetConfig: {
              rootId: "start",
              nodes: {
                start: {
                  id: "start",
                  question:
                    "Your teammate wants Claude Desktop to read HubSpot deals and post a weekly summary in Slack. They ask: should we use the HubSpot REST API directly or set up the HubSpot MCP server?",
                  options: [
                    {
                      label:
                        "REST API. APIs are the universal way to talk to services — MCP is just a buzzword on top.",
                      outcome: {
                        kind: "wrong",
                        explanation:
                          "Calling HubSpot's REST API directly means writing custom code for auth, pagination, retries, and re-doing it for every other AI client. MCP exists precisely to remove that per-tool integration work.",
                      },
                    },
                    {
                      label:
                        "MCP. Claude Desktop can discover the HubSpot MCP tools at runtime and call them with no custom code on our side.",
                      nextNodeId: "next",
                    },
                    {
                      label:
                        "Build a custom Claude plugin from scratch in Python.",
                      outcome: {
                        kind: "suboptimal",
                        explanation:
                          "Possible but wasteful — HubSpot already publishes an official MCP server. Building a custom integration duplicates work that the MCP standard already solves.",
                      },
                    },
                  ],
                },
                next: {
                  id: "next",
                  question:
                    "Good. Now your teammate asks: 'so if MCP is so universal, why does Claude Desktop ALSO need the Notion connector and the Atlassian connector? Why not just one MCP?'",
                  options: [
                    {
                      label:
                        "Because each MCP server only exposes ONE tool — Notion needs its own server, Atlassian needs its own server. MCP is the standard PLUG; each tool ships its own server.",
                      nextNodeId: "final",
                    },
                    {
                      label:
                        "Because Claude Desktop has bugs that require separate connectors per tool.",
                      outcome: {
                        kind: "wrong",
                        explanation:
                          "Not a bug. The MCP standard is intentionally one server per service — like having one USB cable but plugging in different devices.",
                      },
                    },
                    {
                      label:
                        "Because Anthropic charges per connector.",
                      outcome: {
                        kind: "wrong",
                        explanation:
                          "No — MCP is an open standard, anyone can build a server. Connector count is about the number of tools you want to expose, not pricing.",
                      },
                    },
                  ],
                },
                final: {
                  id: "final",
                  question:
                    "Last question. You want to add a quick custom tool — 'fetch latest deals from our internal RevOps spreadsheet'. The team has 30 min. What is the right move?",
                  options: [
                    {
                      label:
                        "Write a tiny MCP server (a single Python or TypeScript file) that exposes one tool. Run it locally, point Claude Desktop at it.",
                      outcome: {
                        kind: "correct",
                        explanation:
                          "Exactly. A minimal MCP server can be one file with one tool. Once it follows the protocol, ANY MCP client — Claude Desktop, Cursor, Manus — can use it.",
                      },
                    },
                    {
                      label:
                        "Wait for Anthropic to ship an official 'spreadsheet' connector.",
                      outcome: {
                        kind: "wrong",
                        explanation:
                          "MCP is open — you do not need to wait. The whole point is that anyone can build a server in their own language.",
                      },
                    },
                    {
                      label:
                        "Copy-paste the spreadsheet contents into Claude's chat every week.",
                      outcome: {
                        kind: "suboptimal",
                        explanation:
                          "Works once, doesn't scale, and burns context window every time. MCP exists to remove this kind of manual paste.",
                      },
                    },
                  ],
                },
              },
            },
            modelAnswer:
              "Correct path: prefer MCP over direct API (1 standard vs N bespoke integrations), accept that each tool ships its own server (the USB analogy), and recognize that you can write your own MCP server for any internal data source in under an hour. MCP is the plug, the servers are the devices, the clients (Claude Desktop, Cursor, Manus) all speak the same protocol.",
          },
          {
            id: "task-5-2",
            lessonId: "lesson-5",
            title: "Order the steps of adding an MCP server",
            description:
              "Put the steps of adding the Notion MCP server to Claude Desktop in the right order. This is the exact flow from Part 4 of the lesson — get it right and you can do it from memory next time.",
            category: "required",
            submissionType: "widget",
            order: 2,
            estimatedMinutes: 8,
            widgetId: "flow-order",
            widgetConfig: {
              prompt:
                "Order the steps to connect Notion to Claude Desktop via MCP.",
              steps: [
                {
                  id: "1",
                  label: "Open Claude Desktop → Settings → Connectors.",
                },
                {
                  id: "2",
                  label: "Click 'Add Connector' and paste the URL https://mcp.notion.com/mcp.",
                },
                {
                  id: "3",
                  label: "Complete the OAuth flow in the popup — sign in to Notion and grant access.",
                },
                {
                  id: "4",
                  label: "Confirm the connector appears in the list with a green 'Connected' badge.",
                },
                {
                  id: "5",
                  label: "Open a new chat and ask Claude to read a specific Notion page to verify the tool actually works.",
                },
              ],
            },
            modelAnswer:
              "Open Settings → Connectors. Add Connector with the MCP URL. Do the OAuth. Confirm the green Connected badge. Test with a real question in a fresh chat. The verification step is critical — a 'Connected' badge does not guarantee Claude can read the data; only a real query proves the tool surface is exposed correctly.",
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
            title: "Run a real cross-tool workflow + reflect",
            description:
              "Connect at least 3 MCP tools in Claude Desktop (Notion, Atlassian/Jira, plus one more — HubSpot, GitHub, Linear, anything from the lesson's catalog). Then pick one real question from your work this week that requires 2+ sources. Run it. Send a screenshot of Claude's answer. Then write 4-6 sentences answering all three: (a) the question and the result, (b) how long the manual version would take, (c) what specifically broke or surprised you — context window? Permission scope? Wrong tool picked by Claude?",
            category: "advanced",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 35,
            modelAnswer:
              "A correct screenshot shows Claude answering a genuine cross-tool work question — visible Jira ticket IDs cross-referenced with Notion page titles, or PRs linked to issues. Strong reflections are specific: 'Took 40 seconds; manually 15 minutes of tab-switching. Surprise: Claude picked the wrong workspace in Notion at first because two workspaces have similar names — I had to clarify which one.' Vague reflections ('it was fast') score lower.",
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
            title: "Skill vs prompt vs MCP — which is which?",
            description:
              "Pick the answer that captures the canonical mental model from this lesson: MCP = Hands, Skills = Brain, Subagents = Workers. Then justify your choice in at least 30 words, using a concrete example from your role (sales, marketing, CS, RevOps, or PMM).",
            category: "required",
            submissionType: "widget",
            order: 1,
            estimatedMinutes: 12,
            widgetId: "mcq-justify",
            widgetConfig: {
              question:
                "A teammate asks: 'I already have MCP connectors set up. Why would I also need a Skill? Isn't that the same thing?' What's the right answer?",
              options: [
                {
                  id: "a",
                  label:
                    "Skills and MCP are the same thing — Skills are just a rebrand of MCP servers.",
                },
                {
                  id: "b",
                  label:
                    "MCP gives the agent HANDS (the ability to call external tools like Jira or HubSpot); a Skill is the BRAIN — a packaged, reusable workflow that tells the agent HOW you want a specific recurring task done. You need both.",
                },
                {
                  id: "c",
                  label:
                    "Skills replace MCP — once you have a Skill you can uninstall your MCP servers.",
                },
                {
                  id: "d",
                  label:
                    "MCP is for engineers; Skills are for non-engineers — they cannot be used together.",
                },
              ],
              correctOptionId: "b",
              minJustificationWords: 30,
              rubric:
                "Strong justification names a concrete workflow from your role where the Skill (the procedure) AND the MCP tools (Jira, Notion, HubSpot) work together — e.g. 'my account-brief Skill reads Jira tickets via MCP, then formats the brief in the Fohlio voice from my Project knowledge files.'",
            },
            modelAnswer:
              "B is correct. MCP = Hands (the connectors that let the agent reach into Notion, Jira, HubSpot). Skill = Brain (the packaged know-how — when to do something, what steps, in what format). A renewal-brief Skill calls the HubSpot MCP for account data and the Notion MCP for the spec, then assembles the brief in your team's voice. Take away MCP and the Skill has nothing to reach for; take away the Skill and you re-explain the workflow every time.",
          },
          {
            id: "task-6-2",
            lessonId: "lesson-6",
            title: "Spot the great Skill description",
            description:
              "Three short multiple-choice questions about the four rules of a great Skill description: (1) WHAT + WHEN + triggers, (2) matchable phrases in the first 250 chars, (3) pushy trigger language, (4) describe WHEN, not HOW. Pick the better description in each pair and justify in one sentence.",
            category: "required",
            submissionType: "widget",
            order: 2,
            estimatedMinutes: 15,
            widgetId: "quiz-explain",
            widgetConfig: {
              minExplanationWords: 12,
              questions: [
                {
                  id: "q1",
                  prompt:
                    "Which description is more likely to actually trigger when a sales rep asks 'help me prep for my Acme renewal call next Tuesday'?",
                  options: [
                    {
                      id: "a",
                      label:
                        "'This skill fetches account data from HubSpot, queries Jira for tickets, formats the output as a PDF using a template.'",
                    },
                    {
                      id: "b",
                      label:
                        "'Use this skill whenever you need to prepare for a renewal call or account review — it pulls the account history, recent tickets, and product usage into a one-page brief.'",
                    },
                  ],
                  correctOptionId: "b",
                  rubric:
                    "B leads with the trigger ('renewal call', 'account review') in the first 250 chars — matches the language a sales rep actually types. A describes HOW (fetches, queries, formats) which users never say.",
                },
                {
                  id: "q2",
                  prompt:
                    "Which description follows the rule 'describe WHEN, not HOW'?",
                  options: [
                    {
                      id: "a",
                      label:
                        "'Internally calls the GraphQL pipeline, serializes to JSON, then renders with handlebars.'",
                    },
                    {
                      id: "b",
                      label:
                        "'Activate when you need to summarize a long Slack thread or stand-up notes into 3-5 bullets.'",
                    },
                  ],
                  correctOptionId: "b",
                  rubric:
                    "B names the situation (long Slack thread, stand-up notes) — words the user types. A is internal implementation that no user describes a problem in.",
                },
                {
                  id: "q3",
                  prompt:
                    "Which opening uses 'pushy trigger language' the way the lesson recommends?",
                  options: [
                    {
                      id: "a",
                      label:
                        "'This skill can sometimes be useful in various marketing scenarios depending on context.'",
                    },
                    {
                      id: "b",
                      label:
                        "'Use this skill whenever a customer asks for a comparison between Fohlio and a competitor — it produces a battlecard-style answer in our brand voice.'",
                    },
                  ],
                  correctOptionId: "b",
                  rubric:
                    "B starts with 'Use this skill whenever...' — a clear, pushy trigger phrase tied to a specific scenario. A is hedged and vague and the agent will pass over it.",
                },
              ],
            },
            modelAnswer:
              "All three correct answers (B / B / B) follow the same pattern: lead with a pushy trigger phrase ('Use this skill whenever...', 'Activate when...'), front-load the words a user actually types ('renewal call', 'long Slack thread', 'comparison with a competitor'), and describe WHEN to invoke it, not HOW it works internally. Implementation detail is the skill's job; trigger words are what gets it found.",
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
            title: "Build a Skill in Manus + compare with/without a Project",
            description:
              "Part A: In Manus, run one repeated weekly workflow end-to-end, then type 'Package this workflow into a Skill.' Open the Skill Library, rename to kebab-case, trigger it with /your-skill-name in a fresh chat. Part B: Create a Manus Project ('Fohlio Sales', 'Fohlio CS' — your role). Write a Master Instruction with your role, ICP, 3-5 brand voice principles. Upload 2-3 knowledge files. Run your skill inside the Project, then outside it. Send one screenshot of the slash-command result and one paragraph (4-6 sentences) comparing the in-Project vs out-of-Project outputs — what specifically changed, and what does that tell you about how persistent context shapes Skill output?",
            category: "advanced",
            submissionType: "screenshot",
            order: 1,
            estimatedMinutes: 45,
            modelAnswer:
              "A correct screenshot shows /your-skill-name triggered in a fresh Manus chat with recognizable structured output (not a generic AI reply). The paragraph should name concrete differences — inside the Project the output uses Fohlio terminology, references the ICP doc, follows the brand voice; outside it falls back to generic B2B SaaS templates. The takeaway: structured persistent context (Master Instruction + knowledge files) is qualitatively different from dumping the same text into one long prompt. The Skill is the procedure; the Project is the memory the procedure draws from.",
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
