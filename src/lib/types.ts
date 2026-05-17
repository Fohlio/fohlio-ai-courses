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

export interface CourseOwner {
  id: string;
  githubNickname: string;
  displayName: string | null;
}

// ============================================================
// COURSE STRUCTURE
// ============================================================

export type CourseStatus = "draft" | "published" | "archived";
export type LessonContentType = "html" | "pdf";
export type AssetKind = "image" | "video" | "html_source";

export interface LessonAsset {
  id: string;
  lessonId: string;
  kind: AssetKind;
  fileName: string;
  pathname: string;
  url: string;
  contentType: string;
  size: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  courseSlug: string;
  slug: string;
  number: number;
  order: number;
  title: string;
  subtitle: string | null;
  description: string;
  learningGoals: string[];
  contentType: LessonContentType;
  contentHtml: string;
  pdfUrl: string | null;
  videoUrl: string | null;
  isPublished: boolean;
  unresolvedMediaSources: string[];
  assets: LessonAsset[];
  homework: HomeworkSection[];
}

export interface CourseCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  coverImageUrl: string | null;
  status: CourseStatus;
  owner: CourseOwner;
  lessonCount: number;
  publishedLessonCount: number;
  totalTasks: number;
  updatedAt: Date;
  progress?: CourseProgress | null;
}

export interface CourseDetail extends CourseCard {
  createdAt: Date;
  lessons: Lesson[];
}

export type HomeworkCategory = "required" | "advanced";

export interface HomeworkSection {
  id: string;
  category: HomeworkCategory;
  tasks: HomeworkTask[];
}

export interface HomeworkTask {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  description: string;
  category: HomeworkCategory;
  submissionType: SubmissionType;
  order: number;
  quizQuestions?: string[];
  checklistItems?: string[];
  modelAnswer?: string | null;
  estimatedMinutes?: number | null;
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
  courseId: string;
  taskId: string;
  lessonId: string;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
  content: SubmissionContent;
}

export type SubmissionStatus = "submitted" | "reviewed";

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

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgress {
  courseId: string;
  lessonId: string;
  lessonSlug: string;
  lessonNumber: number;
  lessonTitle: string;
  totalTasks: number;
  completedTasks: number;
  requiredTotal: number;
  requiredCompleted: number;
  advancedTotal: number;
  advancedCompleted: number;
  status: LessonStatus;
}

export interface CourseProgress {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  lessonProgress: LessonProgress[];
  lastActivityAt: Date | null;
}

export interface OverallProgressSummary {
  totalCourses: number;
  completedCourses: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  courseProgress: CourseProgress[];
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
// OWNER / ADMIN VIEW TYPES
// ============================================================

export interface AdminStudentSummary {
  user: Pick<User, "id" | "githubNickname" | "displayName" | "role" | "createdAt">;
  progress: OverallProgressSummary;
  hasSubmissions: boolean;
}

export interface OwnerCourseStudentSummary {
  user: Pick<User, "id" | "githubNickname" | "displayName">;
  progress: CourseProgress;
}

export interface OwnerSubmissionSummary {
  submissionId: string;
  taskId: string;
  taskTitle: string;
  lessonId: string;
  lessonTitle: string;
  status: SubmissionStatus;
  submittedAt: Date;
  user: Pick<User, "id" | "githubNickname" | "displayName">;
  content: SubmissionContent;
}

export interface OwnerCourseDashboard {
  course: CourseCard;
  totalStudents: number;
  averageCompletion: number;
  students: OwnerCourseStudentSummary[];
  recentSubmissions: OwnerSubmissionSummary[];
}

export interface AdminCourseSummary {
  course: CourseCard;
  totalStudents: number;
  averageCompletion: number;
  studentsCompleted: number;
}
