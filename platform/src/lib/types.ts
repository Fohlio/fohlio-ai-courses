// ============================================================
// CORE ENTITIES
// ============================================================

export interface User {
  id: string;
  githubNickname: string;
  displayName: string | null;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "student" | "admin";

// ============================================================
// COURSE STRUCTURE
// ============================================================

export interface Lesson {
  id: string;
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  learningGoals: string[];
  contentType: LessonContentType;
  contentFile: string;
  videoUrl: string | null;
  isPublished: boolean;
  order: number;
  homework: HomeworkSection[];
}

export type LessonContentType = "html" | "pdf" | "markdown";

export interface HomeworkSection {
  id: string;
  category: HomeworkCategory;
  tasks: HomeworkTask[];
}

export type HomeworkCategory = "required" | "advanced";

export interface HomeworkTask {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  category: HomeworkCategory;
  submissionType: SubmissionType;
  order: number;
  quizQuestions?: string[];
  checklistItems?: string[];
}

export type SubmissionType =
  | "pr_link"
  | "screenshot"
  | "text"
  | "quiz"
  | "checklist";

// ============================================================
// STUDENT PROGRESS & SUBMISSIONS
// ============================================================

export interface TaskSubmission {
  id: string;
  userId: string;
  taskId: string;
  lessonId: string;
  status: SubmissionStatus;
  submittedAt: Date;
  updatedAt: Date;
  content: SubmissionContent;
}

export type SubmissionStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "reviewed";

export type SubmissionContent =
  | PrLinkContent
  | ScreenshotContent
  | TextContent
  | QuizContent
  | ChecklistContent;

export interface PrLinkContent {
  type: "pr_link";
  url: string;
}

export interface ScreenshotContent {
  type: "screenshot";
  fileUrl: string;
  fileName: string;
}

export interface TextContent {
  type: "text";
  text: string;
}

export interface QuizContent {
  type: "quiz";
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionIndex: number;
  question: string;
  answer: string;
}

export interface ChecklistContent {
  type: "checklist";
  items: ChecklistItemData[];
}

export interface ChecklistItemData {
  label: string;
  checked: boolean;
}

// ============================================================
// PROGRESS TRACKING
// ============================================================

export interface LessonProgress {
  lessonId: string;
  lessonNumber: number;
  totalTasks: number;
  completedTasks: number;
  requiredTotal: number;
  requiredCompleted: number;
  advancedTotal: number;
  advancedCompleted: number;
  status: LessonStatus;
}

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface StudentProgress {
  userId: string;
  githubNickname: string;
  displayName: string | null;
  totalLessons: number;
  completedLessons: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lessonProgress: LessonProgress[];
  lastActivityAt: Date | null;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface LoginRequest {
  githubNickname: string;
  password: string;
}

export interface RegisterRequest {
  githubNickname: string;
  displayName?: string;
  password: string;
}

export interface AuthSession {
  user: Pick<User, "id" | "githubNickname" | "displayName" | "role">;
  expiresAt: Date;
}

// ============================================================
// ADMIN VIEW TYPES
// ============================================================

export interface AdminStudentSummary {
  user: Pick<User, "id" | "githubNickname" | "displayName">;
  progress: StudentProgress;
}

export interface AdminLessonSummary {
  lesson: Pick<Lesson, "id" | "number" | "subtitle" | "slug">;
  totalStudents: number;
  studentsCompleted: number;
  taskCompletionRates: TaskCompletionRate[];
}

export interface TaskCompletionRate {
  taskId: string;
  taskTitle: string;
  category: HomeworkCategory;
  completedCount: number;
  totalStudents: number;
}
