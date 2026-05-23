import type { ComponentType } from "react";
import { homeworkWidgetRegistry } from "@/components/homework/widgets/registry";
import { adaptHomeworkWidget } from "./homeworkAdapter";
import { ConceptToggle } from "./concept-toggle/ConceptToggle";
import { InlineReflect } from "./inline-reflect/InlineReflect";
import { LiveQuiz } from "./live-quiz/LiveQuiz";
import { StepPlayer } from "./step-player/StepPlayer";

export type WidgetProps = { config: Record<string, unknown> };

// ---------------------------------------------------------------------------
// Lesson-body widgets.
//
// Two families are registered here:
//   1. Lesson-only widgets — built specifically for in-flow learning
//      (no submission, no grading, instant feedback). Keep alphabetical.
//   2. Adapted homework widgets — the 12 homework widgets wrapped via
//      `adaptHomeworkWidget` so authors can drop them into a lesson body
//      with `<div data-widget="mcq-justify" data-config="..."></div>` and
//      they render without the TaskCard submission machinery.
//
// Author API: write `data-widget="<id>"` + `data-config='{...}'` anywhere in
// a lesson HTML. The runtime (`LessonWidgets.tsx`) discovers them and mounts
// the matching component from this registry via React portals.
// ---------------------------------------------------------------------------

const lessonOnlyWidgets = {
  "concept-toggle": ConceptToggle,
  "inline-reflect": InlineReflect,
  "live-quiz": LiveQuiz,
  "step-player": StepPlayer,
} satisfies Record<string, ComponentType<WidgetProps>>;

const adaptedHomeworkWidgets = Object.fromEntries(
  Object.entries(homeworkWidgetRegistry).map(([id, Widget]) => [
    id,
    adaptHomeworkWidget(id, Widget),
  ]),
) as Record<keyof typeof homeworkWidgetRegistry, ComponentType<WidgetProps>>;

export const widgetRegistry = {
  ...adaptedHomeworkWidgets,
  ...lessonOnlyWidgets,
} satisfies Record<string, ComponentType<WidgetProps>>;

export type WidgetId = keyof typeof widgetRegistry;
