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
