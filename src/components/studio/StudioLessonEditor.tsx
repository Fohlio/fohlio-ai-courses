"use client";

import { upload } from "@vercel/blob/client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { CourseDetail, HomeworkTask, Lesson, LessonAsset } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RichHtmlEditor } from "./RichHtmlEditor";

interface StudioLessonEditorProps {
  course: CourseDetail;
  initialLesson: Lesson;
}

interface EditableTask extends HomeworkTask {
  localId: string;
}

function toGoalText(goals: string[]): string {
  return goals.join("\n");
}

function buildEditableTasks(lesson: Lesson): EditableTask[] {
  return lesson.homework.flatMap((section) =>
    section.tasks.map((task) => ({
      ...task,
      localId: task.id,
    })),
  );
}

function buildTasksPayload(tasks: EditableTask[]) {
  return tasks.map((task, index) => ({
    id: task.id.startsWith("draft-") ? undefined : task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    submissionType: task.submissionType,
    order: index + 1,
    quizQuestions: task.quizQuestions,
    checklistItems: task.checklistItems,
  }));
}

function appendToLessonBody(source: string, snippet: string): string {
  const match = source.match(/([\s\S]*?<body[^>]*>)([\s\S]*?)(<\/body>[\s\S]*)/i);

  if (!match) {
    return source.trim() ? `${source}\n${snippet}` : snippet;
  }

  return `${match[1]}${match[2]}\n${snippet}${match[3]}`;
}

export function StudioLessonEditor({
  course,
  initialLesson,
}: StudioLessonEditorProps) {
  const [lesson, setLesson] = useState(initialLesson);
  const [goalText, setGoalText] = useState(toGoalText(initialLesson.learningGoals));
  const [tasks, setTasks] = useState<EditableTask[]>(buildEditableTasks(initialLesson));
  const [editorMode, setEditorMode] = useState<"visual" | "code" | "preview">("visual");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const previewDocument = useMemo(() => {
    return lesson.contentHtml.trim()
      ? lesson.contentHtml
      : "<p style='font-family: sans-serif; color: #6B7280;'>No lesson HTML yet.</p>";
  }, [lesson.contentHtml]);

  function updateLessonField<K extends keyof Lesson>(key: K, value: Lesson[K]) {
    setLesson((currentLesson) => ({ ...currentLesson, [key]: value }));
  }

  function handleAddTask() {
    const localId = `draft-${crypto.randomUUID()}`;

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: localId,
        localId,
        courseId: course.id,
        lessonId: lesson.id,
        title: "New task",
        description: "",
        category: "required",
        submissionType: "text",
        order: currentTasks.length + 1,
      },
    ]);
  }

  function handleDeleteTask(localId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.localId !== localId));
  }

  function handleTaskChange(localId: string, field: "title" | "description", value: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.localId === localId ? { ...task, [field]: value } : task,
      ),
    );
  }

  async function handleUploadAsset(file: File, kind: LessonAsset["kind"]) {
    setError(null);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/studio/uploads",
        clientPayload: JSON.stringify({
          courseId: course.id,
          lessonId: lesson.id,
          kind,
          fileName: file.name,
        }),
      });

      const assetResponse = await fetch(
        `/api/courses/${course.id}/lessons/${lesson.id}/assets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            fileName: file.name,
            pathname: blob.pathname,
            url: blob.url,
            contentType: blob.contentType || file.type || "application/octet-stream",
            size: file.size,
          }),
        },
      );
      const assetData = await assetResponse.json();

      if (!assetResponse.ok) {
        setError(assetData.error || "Failed to save uploaded asset.");
        return;
      }

      setLesson((currentLesson) => ({
        ...currentLesson,
        assets: [
          ...currentLesson.assets.filter((asset) => asset.pathname !== assetData.data.pathname),
          assetData.data,
        ],
      }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload asset.",
      );
    }
  }

  function handleImportHtml(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateLessonField("contentHtml", reader.result);
        setEditorMode("code");
      }
    };

    reader.readAsText(file);
  }

  function handleSave() {
    startTransition(async () => {
      setError(null);

      const lessonResponse = await fetch(
        `/api/courses/${course.id}/lessons/${lesson.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: lesson.title,
            subtitle: lesson.subtitle,
            description: lesson.description,
            slug: lesson.slug,
            order: lesson.order,
            learningGoals: goalText
              .split("\n")
              .map((goal) => goal.trim())
              .filter(Boolean),
            contentType: lesson.contentType,
            contentHtml: lesson.contentHtml,
            pdfUrl: lesson.pdfUrl,
            videoUrl: lesson.videoUrl,
            isPublished: lesson.isPublished,
          }),
        },
      );
      const lessonData = await lessonResponse.json();

      if (!lessonResponse.ok) {
        setError(lessonData.error || "Failed to save lesson.");
        return;
      }

      const homeworkResponse = await fetch(
        `/api/courses/${course.id}/lessons/${lesson.id}/homework`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildTasksPayload(tasks)),
        },
      );
      const homeworkData = await homeworkResponse.json();

      if (!homeworkResponse.ok) {
        setError(homeworkData.error || "Failed to save homework.");
        return;
      }

      const refreshedCourseResponse = await fetch(`/api/courses/${course.id}`);
      const refreshedCourseData = await refreshedCourseResponse.json();

      if (!refreshedCourseResponse.ok) {
        setError(refreshedCourseData.error || "Failed to refresh lesson.");
        return;
      }

      const refreshedLesson = refreshedCourseData.data.lessons.find(
        (item: Lesson) => item.id === lesson.id,
      );

      if (refreshedLesson) {
        setLesson(refreshedLesson);
        setGoalText(toGoalText(refreshedLesson.learningGoals));
        setTasks(buildEditableTasks(refreshedLesson));
      }
    });
  }

  function handleDeleteLesson() {
    const confirmed = window.confirm("Delete this lesson? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/courses/${course.id}/lessons/${lesson.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete lesson.");
        return;
      }

      window.location.href = `/studio/courses/${course.id}`;
    });
  }

  function insertAssetMarkup(asset: LessonAsset) {
    const snippet =
      asset.kind === "video"
        ? `<video controls preload="metadata">\n  <source src="${asset.fileName}" type="${asset.contentType}" />\n</video>`
        : `<img src="${asset.fileName}" alt="" />`;

    updateLessonField("contentHtml", appendToLessonBody(lesson.contentHtml, snippet));
    setEditorMode("code");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/studio/courses/${course.id}`}
            className="text-sm font-medium text-brand hover:underline"
          >
            &larr; Back to course
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Use uploaded file names inside your HTML `src` or `poster`. Matching assets are rewritten automatically when lessons render.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDeleteLesson} disabled={isPending}>
            Delete Lesson
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Lesson"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger-light/60 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Lesson title"
            value={lesson.title}
            onChange={(event) => updateLessonField("title", event.target.value)}
          />
          <Input
            label="Slug"
            value={lesson.slug}
            onChange={(event) => updateLessonField("slug", event.target.value)}
          />
          <Input
            label="Subtitle"
            value={lesson.subtitle ?? ""}
            onChange={(event) => updateLessonField("subtitle", event.target.value)}
          />
          <Input
            label="Order"
            type="number"
            value={lesson.order}
            onChange={(event) =>
              updateLessonField("order", Number(event.target.value) || 1)
            }
          />
          <Input
            label="Video URL"
            value={lesson.videoUrl ?? ""}
            onChange={(event) => updateLessonField("videoUrl", event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Content type</label>
            <select
              value={lesson.contentType}
              onChange={(event) =>
                updateLessonField("contentType", event.target.value as Lesson["contentType"])
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="html">HTML</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={lesson.isPublished}
              onChange={(event) => updateLessonField("isPublished", event.target.checked)}
            />
            Visible to learners
          </label>
        </div>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          rows={3}
          value={lesson.description}
          onChange={(event) => updateLessonField("description", event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Learning goals
        </label>
        <textarea
          rows={4}
          value={goalText}
          onChange={(event) => setGoalText(event.target.value)}
          placeholder="One goal per line"
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lesson HTML</h2>
              <p className="text-sm text-gray-500">
                Use the visual editor for rich content, switch to code when you need raw HTML, or import an existing `.html` file.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={editorMode === "visual" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setEditorMode("visual")}
                data-testid="lesson-editor-mode-visual"
              >
                Visual
              </Button>
              <Button
                variant={editorMode === "code" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setEditorMode("code")}
                data-testid="lesson-editor-mode-code"
              >
                Code
              </Button>
              <Button
                variant={editorMode === "preview" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setEditorMode("preview")}
                data-testid="lesson-editor-mode-preview"
              >
                Preview
              </Button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Import HTML file
              <input
                type="file"
                accept=".html,text/html"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    handleImportHtml(file);
                  }
                }}
              />
            </label>

            {lesson.contentType === "pdf" && (
              <Input
                label="PDF URL"
                value={lesson.pdfUrl ?? ""}
                onChange={(event) => updateLessonField("pdfUrl", event.target.value)}
              />
            )}
          </div>

          {editorMode === "visual" ? (
            <RichHtmlEditor
              value={lesson.contentHtml}
              onChange={(value) => updateLessonField("contentHtml", value)}
            />
          ) : editorMode === "code" ? (
            <textarea
              rows={24}
              value={lesson.contentHtml}
              onChange={(event) => updateLessonField("contentHtml", event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-950 px-4 py-3 font-mono text-sm text-gray-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          ) : (
            <iframe
              title="Lesson preview"
              srcDoc={previewDocument}
              sandbox=""
              className="h-[620px] w-full rounded-xl border border-gray-200"
            />
          )}

          {lesson.unresolvedMediaSources.length > 0 && (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning-light/70 px-4 py-3 text-sm text-warning">
              Unresolved media references: {lesson.unresolvedMediaSources.join(", ")}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload images or videos, then reference the exact filename in your HTML.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    await handleUploadAsset(file, "image");
                  }}
                />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Upload video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    await handleUploadAsset(file, "video");
                  }}
                />
              </label>
            </div>

            <div className="mt-4 space-y-3">
              {lesson.assets.length === 0 ? (
                <p className="text-sm text-gray-500">No uploaded assets yet.</p>
              ) : (
                lesson.assets.map((asset) => (
                  <div
                    key={asset.pathname}
                    className="rounded-lg border border-gray-200 px-3 py-3 text-sm"
                  >
                    <p className="font-medium text-gray-900">{asset.fileName}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Use <code>{asset.fileName}</code> in your HTML.
                    </p>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-medium text-brand hover:underline"
                    >
                      Open asset
                    </a>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => insertAssetMarkup(asset)}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Insert into lesson
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Homework</h2>
                <p className="text-sm text-gray-500">
                  New tasks default to text answers. Existing legacy task types are preserved.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleAddTask}>
                Add Task
              </Button>
            </div>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No homework tasks yet.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.localId} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wide text-gray-400">
                        {task.category} • {task.submissionType}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.localId)}
                        className="text-xs font-medium text-danger hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <Input
                      label="Task title"
                      value={task.title}
                      onChange={(event) =>
                        handleTaskChange(task.localId, "title", event.target.value)
                      }
                    />
                    <label className="mt-3 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={task.description}
                      onChange={(event) =>
                        handleTaskChange(task.localId, "description", event.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
