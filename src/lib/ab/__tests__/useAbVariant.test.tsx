import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useAbVariant } from "@/lib/ab/useAbVariant";
import { AB_STORAGE_KEY } from "@/lib/ab/assign";

const EXPERIMENT_ID = "quiz_result_visual_v1";

function Probe() {
  const arm = useAbVariant(EXPERIMENT_ID);
  // Render the raw arm value so the test can observe the null -> arm transition.
  return <div data-testid="arm">{arm === null ? "null" : arm}</div>;
}

describe("useAbVariant", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("resolves to the stored arm after mount", () => {
    window.localStorage.setItem(
      AB_STORAGE_KEY,
      JSON.stringify({ [EXPERIMENT_ID]: "B" }),
    );

    render(<Probe />);

    // After render + effects flush, the hook has resolved the arm.
    expect(screen.getByTestId("arm").textContent).toBe("B");
  });

  it("assigns and exposes a fresh arm when none is stored", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1); // -> "A"

    render(<Probe />);

    expect(screen.getByTestId("arm").textContent).toBe("A");
    // The assignment was persisted by getAbArm via the effect.
    const stored = JSON.parse(
      window.localStorage.getItem(AB_STORAGE_KEY) ?? "{}",
    );
    expect(stored).toEqual({ [EXPERIMENT_ID]: "A" });
  });

  it("renders arm-independent (null) markup on the server / first render", () => {
    // Even with an arm stored, the server render must not depend on it, so the
    // hydrating client's first render matches and no mismatch occurs. Effects
    // (and thus arm resolution) do not run during renderToString.
    window.localStorage.setItem(
      AB_STORAGE_KEY,
      JSON.stringify({ [EXPERIMENT_ID]: "A" }),
    );

    const html = renderToString(<Probe />);

    // The probe prints "null" while the arm is undetermined; the server output
    // must be exactly that, never "A"/"B".
    expect(html).toContain("null");
    expect(html).not.toContain(">A<");
    expect(html).not.toContain(">B<");
  });
});
