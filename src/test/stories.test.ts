import { describe, it, expect } from "vitest";
import { groupActiveStories, isStoryActive } from "@/lib/stories";

const now = new Date("2026-11-04T12:00:00Z");
const row = (id: string, created: string) => ({
  id, user_id: "u1", media_url: "x.jpg", media_type: "photo", effect: null, music_name: null, music_artist: null,
  created_at: created, expires_at: "",
});

describe("stories 24h lifetime", () => {
  it("story posted 23h ago is still visible", () => {
    expect(isStoryActive(row("a", "2026-11-03T13:00:00Z"), now)).toBe(true);
  });
  it("story posted 25h ago is hidden", () => {
    expect(isStoryActive(row("b", "2026-11-03T11:00:00Z"), now)).toBe(false);
    expect(groupActiveStories([row("b", "2026-11-03T11:00:00Z")], [], undefined, now)).toHaveLength(0);
  });
});
