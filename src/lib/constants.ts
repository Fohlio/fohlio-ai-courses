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
            title: "Install Cursor and Git",
            description:
              "Install Cursor from cursor.com and verify Git is installed by running `git --version` in your terminal.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
          },
          {
            id: "task-1-2",
            lessonId: "lesson-1",
            title: "Clone the course repository",
            description:
              "Clone the fohlio-ai-courses repo to your local machine and send a screenshot of the cloned folder.",
            category: "required",
            submissionType: "screenshot",
            order: 2,
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
            title: "Add your totem to totems.txt",
            description:
              "Clone fohlio-ai-courses, create a branch, add your line to totems.txt in the format [github name] - [repo] - [totem animal], and create a PR.",
            category: "required",
            submissionType: "pr_link",
            order: 1,
          },
          {
            id: "task-2-2",
            lessonId: "lesson-2",
            title: "Resolve the merge conflict",
            description:
              "After someone else's PR gets merged, your PR will show a conflict. Resolve it using fetch, merge, fix markers, add, commit, push.",
            category: "required",
            submissionType: "pr_link",
            order: 2,
          },
          {
            id: "task-2-3",
            lessonId: "lesson-2",
            title: "Set up the frontend locally",
            description:
              "Clone fohlio-frontend, run make setup, run make use-test01, run make s and verify you see the login page. Send a screenshot.",
            category: "required",
            submissionType: "screenshot",
            order: 3,
          },
        ],
      },
      {
        id: "hw-2-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-2-4",
            lessonId: "lesson-2",
            title: "Explore the codebase",
            description:
              "Open fohlio-frontend in Cursor and find the following:",
            category: "advanced",
            submissionType: "checklist",
            order: 1,
            checklistItems: [
              "Where is the login page?",
              "Where are the GraphQL queries?",
              "What does make s actually do?",
            ],
          },
          {
            id: "task-2-5",
            lessonId: "lesson-2",
            title: "Quiz: answer these questions",
            description: "Answer the following questions about the architecture:",
            category: "advanced",
            submissionType: "quiz",
            order: 2,
            quizQuestions: [
              "What language does the backend use?",
              "What does Redis do? Name 2 use cases.",
              "What's the difference between test01 and uat01?",
              "Why do branch names start with a Jira ticket number?",
            ],
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
              "Follow the steps from the lesson: install nvm + Node.js v20.12.2, set up GitHub CLI token (gh auth refresh -s read:packages), clone fohlio-frontend, run make setup && make use-test01 && make s. Send a screenshot of the running app.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
          },
          {
            id: "task-3-2",
            lessonId: "lesson-3",
            title: "Get env variables and staging credentials",
            description:
              "Write Ivan in DMs to get the .env.local file and staging server login credentials. Confirm you received them.",
            category: "required",
            submissionType: "text",
            order: 2,
          },
          {
            id: "task-3-3",
            lessonId: "lesson-3",
            title: "Make your first fix via Cursor",
            description:
              "Create a branch (YOUR-NAME-first-fix), open the project in Cursor, add a comment '// Course exercise: YOUR-NAME was here' to src/__fsd__/6-shared/ui/index.ts, commit, push, and create a PR to develop. Send the PR link.",
            category: "required",
            submissionType: "pr_link",
            order: 3,
          },
        ],
      },
      {
        id: "hw-3-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-3-4",
            lessonId: "lesson-3",
            title: "Explore the FSD structure",
            description:
              "Open src/__fsd__/ in Cursor and find the following:",
            category: "advanced",
            submissionType: "checklist",
            order: 1,
            checklistItems: [
              "Where is the Dashboard page?",
              "What entities exist in 5-entities/?",
              "Can you find a Zustand store? (search for 'create(' from zustand)",
            ],
          },
          {
            id: "task-3-5",
            lessonId: "lesson-3",
            title: "Try Cursor AI on the codebase",
            description:
              "Open Cursor chat (Cmd+L) and ask these questions, then share what you learned:",
            category: "advanced",
            submissionType: "checklist",
            order: 2,
            checklistItems: [
              "What does 'make s' do?",
              "Explain the FSD layer structure",
              "Where are the GraphQL queries defined?",
            ],
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
            title: "Install Claude Desktop and connect Notion",
            description:
              "Download Claude Desktop from claude.ai/download. Go to Settings → Connectors, click Add Connector, enter https://mcp.notion.com/mcp and complete the OAuth flow. Ask Claude about any Notion page. Send a screenshot showing Claude reading a Notion page.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
          },
          {
            id: "task-4-2",
            lessonId: "lesson-4",
            title: "Connect Jira (Atlassian) to Claude Desktop",
            description:
              "In Claude Desktop Settings → Connectors, add the Atlassian connector and connect it to our Jira workspace. Ask Claude about your tickets (e.g. 'What are my open tickets?'). Send a screenshot of the result.",
            category: "required",
            submissionType: "screenshot",
            order: 2,
          },
          {
            id: "task-4-3",
            lessonId: "lesson-4",
            title: "Explain chatbot vs agent",
            description:
              "In your own words (2-3 sentences), explain the difference between a chatbot and an agent. Think about what you learned in this lesson and use a real example.",
            category: "required",
            submissionType: "text",
            order: 3,
          },
        ],
      },
      {
        id: "hw-4-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-4-4",
            lessonId: "lesson-4",
            title: "Quiz: AI Concepts",
            description:
              "Answer the following questions about AI concepts covered in this lesson:",
            category: "advanced",
            submissionType: "quiz",
            order: 1,
            quizQuestions: [
              "What happens when the context window fills up during a long conversation?",
              "Name 2 MCP connectors and what they do.",
              "What is a 'token' and why does it matter?",
              "Why is MCP compared to USB? What problem does it solve?",
            ],
          },
          {
            id: "task-4-5",
            lessonId: "lesson-4",
            title: "Connect more MCP tools",
            description:
              "Try connecting additional connectors in Claude Desktop and test each one:",
            category: "advanced",
            submissionType: "checklist",
            order: 2,
            checklistItems: [
              "Connect GitHub and ask Claude about a repository or PR",
              "Connect Google Drive and ask Claude to find a document",
              "Try any other connector that looks useful to you",
            ],
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
            title: "Connect 3 MCP tools and share one insight",
            description:
              "Connect at least 3 tools via Settings → Connectors: Notion, Atlassian (Jira), and one more of your choice. Send a screenshot showing all 3 connected, plus 2-3 sentences about what surprised you or worked differently than expected.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
          },
          {
            id: "task-5-2",
            lessonId: "lesson-5",
            title: "Solve a real work question using 2+ MCP tools",
            description:
              "Find a real question from your actual work (not from the lesson examples) that requires 2+ connected tools to answer. Ask Claude, send a screenshot, and estimate how long this would have taken before MCP.",
            category: "required",
            submissionType: "screenshot",
            order: 2,
          },
          {
            id: "task-5-3",
            lessonId: "lesson-5",
            title: "Explain API vs MCP to a non-technical friend",
            description:
              "In your own words (3-5 sentences), explain the difference between an API and MCP using an analogy that is NOT from the lesson (not USB, not restaurants). Your explanation should make a non-technical person say 'ah, got it!'",
            category: "required",
            submissionType: "text",
            order: 3,
          },
        ],
      },
      {
        id: "hw-5-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-5-4",
            lessonId: "lesson-5",
            title: "Design your personal MCP workflow",
            description:
              "Think about your role and typical work week. Design a workflow: which 3-5 tools to connect, what task to automate, old way vs MCP way, and estimated time savings. Write it in the format from Part 6: Old way → MCP way → Tools used.",
            category: "advanced",
            submissionType: "text",
            order: 1,
          },
          {
            id: "task-5-5",
            lessonId: "lesson-5",
            title: "Try Manus with a real task",
            description:
              "Create an account at manus.im and give it a task you'd normally spend 30+ minutes on. Send the result and answer: Would you use Manus or Claude Desktop for this task? Why?",
            category: "advanced",
            submissionType: "screenshot",
            order: 2,
          },
          {
            id: "task-5-6",
            lessonId: "lesson-5",
            title: "Quiz: MCP & Tools (active recall)",
            description:
              "Answer WITHOUT looking at the lesson, then check yourself and note what you got wrong:",
            category: "advanced",
            submissionType: "quiz",
            order: 3,
            quizQuestions: [
              "What are the two methods of adding MCP servers to Claude Desktop? When would you use each?",
              "Name 3 MCP connectors and what each does — from memory.",
              "What is the main difference between Claude Desktop and Manus? Use your own words.",
              "Why is MCP compared to USB? What specific problem does it solve?",
            ],
          },
          {
            id: "task-5-7",
            lessonId: "lesson-5",
            title: "Find and pitch a new MCP server",
            description:
              "Browse mcp.so or smithery.ai, find an MCP server nobody on the team uses yet. Write a 3-sentence pitch: what it connects to, what problem it solves, and who should try it first.",
            category: "advanced",
            submissionType: "text",
            order: 4,
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
    subtitle: "Claude Skills, the GTM skill stack, and building your first skill in 10 minutes",
    description:
      "Understand what Claude Skills are and how they differ from prompts and MCP. Learn the canonical mental model (Skills = Brain, MCP = Hands, Subagents = Workers), use Anthropic's built-in document skills, build your first custom skill via Skill Creator, and install proven skills tailored to your GTM role.",
    learningGoals: [
      "Understand what a Claude Skill is and how it differs from a prompt or MCP connector",
      "Know the canonical mental model: MCP = Hands, Skills = Brain, Subagents = Workers",
      "Be able to use Anthropic's built-in document skills (pptx, xlsx, docx, pdf, brand-guidelines)",
      "Build your first custom skill in under 10 minutes via Skill Creator (no code)",
      "Know how to write a description that actually triggers (the make-or-break field)",
      "Have a curated GTM skill stack tailored to your role",
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
    ],
    homework: [
      {
        id: "hw-6-required",
        category: "required",
        tasks: [
          {
            id: "task-6-1",
            lessonId: "lesson-6",
            title: "Build your first skill via Skill Creator",
            description:
              "Pick a repeated task from your work (recap email, meeting prep, status update, follow-up template). At claude.ai, type 'Use the skill-creator skill to help me build a skill for [your use case].' Answer the structured questions, download the ZIP, upload via Settings → Capabilities → Skills, and test it in a fresh chat. Send a screenshot of the skill activated plus 2-3 sentences on what surprised you.",
            category: "required",
            submissionType: "screenshot",
            order: 1,
          },
          {
            id: "task-6-2",
            lessonId: "lesson-6",
            title: "Install one community skill from the GTM stack",
            description:
              "Pick one skill from Part 7 that fits your role (Sales: Summit53 / OstraconAI; Marketing: Brand Voice / OpenClaudia; CS: customer-success-manager / FunnelStory; Content: Voice DNA; RevOps: /revenue-monitor). Install it, run it on a real task from your week. Send a screenshot and 2-3 sentences on what worked, what didn't, what you'd change.",
            category: "required",
            submissionType: "screenshot",
            order: 2,
          },
          {
            id: "task-6-3",
            lessonId: "lesson-6",
            title: "Write a great description",
            description:
              "Take the skill from task #1 and rewrite its description applying all four rules from Part 6 (WHAT+WHEN+trigger phrases, front-loaded matchable phrases, pushy language, describe WHEN not HOW). Send the description (under 1024 chars) plus one sentence per rule explaining how your description applies it.",
            category: "required",
            submissionType: "text",
            order: 3,
          },
        ],
      },
      {
        id: "hw-6-advanced",
        category: "advanced",
        tasks: [
          {
            id: "task-6-4",
            lessonId: "lesson-6",
            title: "Compose two skills",
            description:
              "Design and verify a scenario where Claude automatically uses two skills together (e.g. brand-guidelines + pptx for an on-brand deck). Send the output and name both skills Claude composed.",
            category: "advanced",
            submissionType: "screenshot",
            order: 1,
          },
          {
            id: "task-6-5",
            lessonId: "lesson-6",
            title: "Quiz: Skills, MCP, Subagents (active recall)",
            description: "Answer without looking back at the lesson. Then check yourself and note what you got wrong:",
            category: "advanced",
            submissionType: "quiz",
            order: 2,
            quizQuestions: [
              "What is progressive disclosure? Name the three levels.",
              "What are the four rules for writing a description?",
              "If a workflow needs live HubSpot data, do you need a Skill, an MCP server, or both? Why?",
              "Pick one analogy other than the restaurant or USB. Use it to explain Skills vs MCP vs Subagents in three sentences.",
            ],
          },
          {
            id: "task-6-6",
            lessonId: "lesson-6",
            title: "Pitch a custom skill for your team",
            description:
              "Write a 5-sentence pitch for a custom skill that would help your team. What workflow does it capture? Who would use it? What 3-5 example outputs would seed it? How much time/week would it save? Who else should help build/test it? Bonus: actually build it and ship it.",
            category: "advanced",
            submissionType: "text",
            order: 3,
          },
          {
            id: "task-6-7",
            lessonId: "lesson-6",
            title: "Find and pitch a new skill",
            description:
              "Browse github.com/anthropics/skills, awesome-skills.com, or skillsmp.com. Find a skill nobody on the team uses yet. Write a 3-sentence pitch: what it does, what problem it solves, who should try it first.",
            category: "advanced",
            submissionType: "text",
            order: 4,
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
