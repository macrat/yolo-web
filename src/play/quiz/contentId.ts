/**
 * Canonical content-id construction for quiz/diagnosis content.
 *
 * The GA4 analytics layer (`src/lib/analytics.ts`) is intentionally decoupled
 * from the quiz domain: it never imports quiz modules and only forwards the
 * `content_id` value the caller passes in. This helper is that single source
 * of truth for the value, so the `"quiz-" + slug` prefix is defined once
 * instead of being duplicated as a string literal at every call site
 * (QuizContainer / ResultCard / ResultPageShell / FudaActions).
 *
 * The prefix distinguishes quiz/diagnosis content from games (bare slug) and
 * fortune (`fortune-*`) in the shared `content_id` dimension.
 */
export function contentIdForQuiz(slug: string): string {
  return `quiz-${slug}`;
}
