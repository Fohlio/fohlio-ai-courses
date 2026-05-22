/**
 * Contract for homework widgets.
 *
 * Each widget is a self-contained interactive task. It owns its own state
 * shape (free-form JSON) and tells the host when the student has produced
 * an answer worth submitting via the `onChange` callback.
 *
 * Widgets MUST:
 *   - require active user input (ICAP) — no passive click-to-reveal
 *   - render correctly at viewport widths down to 320px
 *   - be deterministic — same `config` + same `state` => same UI
 *   - never call network APIs themselves; submission is owned by TaskCard
 */
export interface HomeworkWidgetProps<TState = Record<string, unknown>> {
  /** Stable id of the parent task — useful for keying analytics/localStorage. */
  taskId: string;
  /** Widget-specific configuration baked into the task at seed time. */
  config: Record<string, unknown>;
  /** Last persisted state, or null on first render. */
  initialState: TState | null;
  /** Whether the parent task is locked (already submitted, not editing). */
  disabled: boolean;
  /**
   * Called whenever the student changes the widget's state.
   * Pass `completed: true` only when the answer is good enough to submit.
   */
  onChange: (next: { state: TState; completed: boolean }) => void;
}

export type HomeworkWidget<TState = Record<string, unknown>> = (
  props: HomeworkWidgetProps<TState>,
) => React.ReactElement | null;

/**
 * Registry-friendly type — erases the per-widget state generic so the
 * registry can store widgets with differently-shaped state alongside each
 * other. Each widget still gets its precise TState at definition time.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyHomeworkWidget = HomeworkWidget<any>;
