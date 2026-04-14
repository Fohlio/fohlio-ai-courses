# Fohlio Tech Course Platform - PRD

## Overview

Internal course management platform for the Fohlio Tech Course, a 10-lesson program teaching tech skills to Fohlio team members. Supports lesson viewing (including video), homework submission tracking, and an admin panel for the course instructor.

## Users & Roles

| Role | Description |
|------|-------------|
| **Student** | Team member enrolled in the course. Identified by GitHub nickname. Views lessons, submits homework, tracks own progress. |
| **Admin** | Course instructor (ivanbunin). Views all students' submissions, monitors progress. Single admin. |

## Authentication

- Register with: GitHub nickname (unique) + display name (optional) + password
- Login with: GitHub nickname + password
- Simple password auth with bcrypt hashing
- Admin identified by known GitHub nickname (`ivanbunin`)
- Session stored in cookie/context

## Features

### Lesson Viewing

Each of the 10 lessons includes:
- Lesson number badge (e.g., "Lesson 2 of 10")
- Title and subtitle
- Learning goals list
- Content body (HTML or embedded content)
- Optional video file (embedded player)
- Link to source material (PDF/HTML from lessons/ folder)
- Navigation to previous/next lesson

**Lesson list** shows all 10 lessons as cards with progress indicators.

### Homework Tracking

Each lesson has a homework section with two categories:

- **Required** - mandatory tasks for all students
- **Advanced (optional)** - bonus tasks

Each task has one of 5 submission types:

| Type | Description | Example |
|------|-------------|---------|
| `pr_link` | GitHub Pull Request URL | "Add your totem to totems.txt" |
| `screenshot` | Image file upload | "Send screenshot of running app" |
| `text` | Free-text answer | General text responses |
| `quiz` | Multiple text answers to specific questions | "What language does the backend use?" |
| `checklist` | Sub-steps to mark individually | "Find login page, find GraphQL queries..." |

Students can:
- View all homework tasks per lesson
- Mark tasks as completed
- Attach submissions matching the task's type
- See progress per lesson and overall

### Admin Panel

- **Dashboard**: total students, average completion, recent submissions
- **Students list**: table with GitHub nickname, progress %, last activity
- **Student detail**: per-lesson accordion with each task's submission status and content
- **Lesson view**: completion grid showing which students completed which tasks

## Course Content Map

| # | Slug | Title |
|---|------|-------|
| 1 | git-intro | Introduction to Collaborative Development |
| 2 | architecture | Architecture, Servers & Git Flow |
| 3 | html-css-js | HTML, CSS & JavaScript Basics |
| 4 | react-basics | React Fundamentals |
| 5 | frontend-codebase | Exploring the Frontend Codebase |
| 6 | backend-basics | Backend & Database Basics |
| 7 | api-graphql | APIs & GraphQL |
| 8 | testing | Testing & Quality |
| 9 | deployment | Deployment & DevOps |
| 10 | capstone | Capstone Project |

Lessons 3-10 titles are projected; actual titles will be updated as content is created.

## Data Model

### User
- id, githubNickname (unique), displayName, passwordHash, role (student|admin), createdAt

### Lesson
- id, slug, number, title, subtitle, description, learningGoals[], contentType (html|pdf), contentUrl, videoUrl, isPublished, homework[]

### HomeworkTask
- id, lessonId, title, description, category (required|advanced), submissionType, order, quizQuestions[], checklistItems[]

### TaskSubmission
- id, userId, taskId, lessonId, status (not_started|in_progress|submitted|reviewed), submittedAt, content (varies by type)

## Design

- Primary blue: #3451B2
- Font: Inter (UI), JetBrains Mono (code)
- Color palette matches existing lesson HTML design
- Max-width 800px content area for lessons
- Full-width for admin tables
- Responsive for desktop and tablet

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Database: PostgreSQL + Prisma (Phase 2)
- File storage: S3 (Phase 2)

## Phasing

**Phase 1 (current)**: Next.js foundation - all pages, components, types, mock data, stub auth
**Phase 2**: Database integration - Prisma schema, real auth, API routes, server actions
**Phase 3**: File uploads, video hosting, email notifications
