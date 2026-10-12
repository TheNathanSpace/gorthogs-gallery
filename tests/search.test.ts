import { describe, expect, it } from "vitest"

import {
  likeNeedle,
  parseLibraryView,
  parseSearchField,
} from "@/lib/search"

describe("search parsing", () => {
  it("defaults unknown fields and views", () => {
    expect(parseSearchField("painter")).toBe("painter")
    expect(parseSearchField("nope")).toBe("all")
    expect(parseLibraryView("table")).toBe("table")
    expect(parseLibraryView(undefined)).toBe("photos")
  })

  it("strips LIKE wildcards from the needle", () => {
    expect(likeNeedle("Aldric%_")).toBe("%Aldric%")
  })
})
