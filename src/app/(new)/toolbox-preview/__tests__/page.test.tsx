import { describe, it, expect } from "vitest";
import { metadata } from "../page";

describe("/toolbox-preview page metadata", () => {
  it("robots に index: false が設定されている", () => {
    expect(metadata.robots).toBeDefined();
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(false);
  });

  it("robots に follow: false が設定されている", () => {
    expect(metadata.robots).toBeDefined();
    const robots = metadata.robots as { index: boolean; follow: boolean };
    expect(robots.follow).toBe(false);
  });

  it("title が設定されている", () => {
    expect(metadata.title).toBeTruthy();
  });
});
