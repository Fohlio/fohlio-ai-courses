import type { Lesson } from "./types";

export const ADMIN_GITHUB_NICKNAME = "ivanbunin";

export const LESSONS: Lesson[] = [
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
    contentType: "pdf",
    contentUrl: "/lessons/lesson1-git_intro.pdf",
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
    contentUrl: "/lessons/lesson2-architecture.html",
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
              "Where is the login page? (hint: look in src/__fsd__/)",
              "Where are the GraphQL queries? (hint: look for .graphql files)",
              "What does make s actually do? (hint: look at the Makefile)",
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
    slug: "html-css-js",
    number: 3,
    title: "HTML, CSS & JavaScript Basics",
    subtitle: "Building blocks of the web",
    description:
      "Learn the fundamentals of HTML structure, CSS styling, and JavaScript interactivity.",
    learningGoals: [
      "Understand HTML document structure",
      "Style elements with CSS",
      "Add interactivity with JavaScript",
      "Use browser DevTools for debugging",
    ],
    contentType: "html",
    contentUrl: "",
    videoUrl: null,
    isPublished: false,
    order: 3,
    homework: [],
  },
  {
    id: "lesson-4",
    slug: "react-basics",
    number: 4,
    title: "React Fundamentals",
    subtitle: "Components, props, state",
    description:
      "Learn React core concepts including components, JSX, props, and state management.",
    learningGoals: [
      "Understand component-based architecture",
      "Create React components with JSX",
      "Pass data with props",
      "Manage state with useState",
    ],
    contentType: "html",
    contentUrl: "",
    videoUrl: null,
    isPublished: false,
    order: 4,
    homework: [],
  },
  {
    id: "lesson-5",
    slug: "frontend-codebase",
    number: 5,
    title: "Exploring the Frontend Codebase",
    subtitle: "FSD architecture, GraphQL queries",
    description:
      "Navigate the Fohlio frontend codebase, understand Feature-Sliced Design, and work with GraphQL.",
    learningGoals: [
      "Understand Feature-Sliced Design structure",
      "Navigate the fohlio-frontend repo",
      "Read and write GraphQL queries",
      "Use Apollo Client for data fetching",
    ],
    contentType: "html",
    contentUrl: "",
    videoUrl: null,
    isPublished: false,
    order: 5,
    homework: [],
  },
  {
    id: "lesson-6",
    slug: "backend-basics",
    number: 6,
    title: "Backend & Database Basics",
    subtitle: "Rails, PostgreSQL, Redis",
    description:
      "Introduction to the Fohlio backend stack: Ruby on Rails, PostgreSQL database, and Redis caching.",
    learningGoals: [
      "Understand the backend architecture",
      "Know how PostgreSQL stores data",
      "Understand Redis caching patterns",
      "Read Rails controller actions",
    ],
    contentType: "html",
    contentUrl: "",
    videoUrl: null,
    isPublished: false,
    order: 6,
    homework: [],
  },
  {
    id: "lesson-7",
    slug: "api-graphql",
    number: 7,
    title: "APIs & GraphQL",
    subtitle: "Queries, mutations, Apollo",
    description:
      "Deep dive into GraphQL: writing queries, mutations, and understanding the API layer.",
    learningGoals: [
      "Write GraphQL queries and mutations",
      "Understand the API schema",
      "Use Apollo DevTools",
      "Handle loading and error states",
    ],
    contentType: "html",
    contentUrl: "",
    videoUrl: null,
    isPublished: false,
    order: 7,
    homework: [],
  },
  {
    id: "lesson-8",
    slug: "testing",
    number: 8,
    title: "Testing & Quality",
    subtitle: "Unit tests, QA process",
    description:
      "Learn about testing strategies, writing unit tests, and the QA process at Fohlio.",
    learningGoals: [
      "Write unit tests with Jest",
      "Understand testing best practices",
      "Know the QA workflow",
      "Debug test failures",
    ],
    contentType: "html",
    contentUrl: "",
    videoUrl: null,
    isPublished: false,
    order: 8,
    homework: [],
  },
  {
    id: "lesson-9",
    slug: "deployment",
    number: 9,
    title: "Deployment & DevOps",
    subtitle: "CI/CD, staging, production",
    description:
      "Understand the deployment pipeline, CI/CD workflows, and how code moves from development to production.",
    learningGoals: [
      "Understand the CI/CD pipeline",
      "Know how deployments work",
      "Read build logs and fix failures",
      "Understand staging vs production",
    ],
    contentType: "html",
    contentUrl: "",
    videoUrl: null,
    isPublished: false,
    order: 9,
    homework: [],
  },
  {
    id: "lesson-10",
    slug: "capstone",
    number: 10,
    title: "Capstone Project",
    subtitle: "Putting it all together",
    description:
      "Apply everything you've learned in a guided capstone project that touches all parts of the Fohlio stack.",
    learningGoals: [
      "Plan a small feature end-to-end",
      "Implement frontend changes",
      "Understand backend implications",
      "Submit a complete PR with tests",
    ],
    contentType: "html",
    contentUrl: "",
    videoUrl: null,
    isPublished: false,
    order: 10,
    homework: [],
  },
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonByNumber(num: number): Lesson | undefined {
  return LESSONS.find((l) => l.number === num);
}

export function getPublishedLessons(): Lesson[] {
  return LESSONS.filter((l) => l.isPublished);
}

export function getAllHomeworkTasks(lesson: Lesson) {
  return lesson.homework.flatMap((section) => section.tasks);
}
