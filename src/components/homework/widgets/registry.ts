import type { AnyHomeworkWidget } from "./types";

// Homework widget components are appended here in alphabetical order by the
// course-widget-builder agent. Keep imports + entries sorted.
//
// Adding a widget:
//   1. Create src/components/homework/widgets/<widget-id>/<WidgetId>.tsx
//   2. Default-export a HomeworkWidget<TState>
//   3. Register the import + entry below
//   4. Document the config + state shape next to the export
//
// At runtime the host (WidgetTaskCard) looks the widget up by string id.
// Unknown ids render an inline error so missing seeds are obvious.

import { ArchDiagram } from "./arch-diagram/ArchDiagram";
import { CodeFill } from "./code-fill/CodeFill";
import { CodeOrder } from "./code-order/CodeOrder";
import { ConceptMatch } from "./concept-match/ConceptMatch";
import { DecisionTree } from "./decision-tree/DecisionTree";
import { ErrorTrace } from "./error-trace/ErrorTrace";
import { FlowOrder } from "./flow-order/FlowOrder";
import { McqJustify } from "./mcq-justify/McqJustify";
import { ModelBuilder } from "./model-builder/ModelBuilder";
import { QueryBuilder } from "./query-builder/QueryBuilder";
import { QuizExplain } from "./quiz-explain/QuizExplain";
import { TerminalTrace } from "./terminal-trace/TerminalTrace";

export const homeworkWidgetRegistry = {
  "arch-diagram": ArchDiagram,
  "code-fill": CodeFill,
  "code-order": CodeOrder,
  "concept-match": ConceptMatch,
  "decision-tree": DecisionTree,
  "error-trace": ErrorTrace,
  "flow-order": FlowOrder,
  "mcq-justify": McqJustify,
  "model-builder": ModelBuilder,
  "query-builder": QueryBuilder,
  "quiz-explain": QuizExplain,
  "terminal-trace": TerminalTrace,
} satisfies Record<string, AnyHomeworkWidget>;

export type HomeworkWidgetId = keyof typeof homeworkWidgetRegistry;
