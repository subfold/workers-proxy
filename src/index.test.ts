import { describe, it, expect } from "vitest";
import { createPatternFormatter, joinPaths, matchRule } from "./";
import { createPatternMatcher } from "./";

describe("joinPaths", () => {
  it("joins two paths without a trailing slash", () => {
    const result = joinPaths("path1", "path2");
    expect(result).toBe("path1/path2");
  });

  it("joins two paths with a leading slash in the second path", () => {
    const result = joinPaths("path1", "/path2");
    expect(result).toBe("path1/path2");
  });

  it("joins two paths with a trailing slash in the first path", () => {
    const result = joinPaths("path1/", "path2");
    expect(result).toBe("path1/path2");
  });

  it("eliminates double slashes", () => {
    const result = joinPaths("path1//", "//path2");
    expect(result).toBe("path1/path2");
  });

  it("works with more than two paths", () => {
    const result = joinPaths("/path1", "path2/", "/path3");
    expect(result).toBe("/path1/path2/path3");
  });

  it("returns a single slash when joining two slashes", () => {
    const result = joinPaths("/", "/");
    expect(result).toBe("/");
  });

  it("handles empty segments", () => {
    const result = joinPaths("path1", "", "path2");
    expect(result).toBe("path1/path2");
  });

  it("maintains leading slash when present", () => {
    const result = joinPaths("/path1", "path2");
    expect(result).toBe("/path1/path2");
  });

  it("maintains trailing slash when present in last segment", () => {
    const result = joinPaths("path1", "path2/");
    expect(result).toBe("path1/path2/");
  });
});

describe("createPatternMatcher", () => {
  it("matches a simple static pattern", () => {
    const match = createPatternMatcher("/test/path");
    const result = match("/test/path");
    expect(result).not.toBeNull();
  });

  it("does not match an incorrect static pattern", () => {
    const match = createPatternMatcher("/test/path");
    const result = match("/test/other");
    expect(result).toBeNull();
  });

  it("extracts named parameters from the pattern", () => {
    const match = createPatternMatcher("/test/:param1/:param2");
    const result = match("/test/value1/value2");
    expect(result).toEqual({ param1: "value1", param2: "value2" });
  });

  it("returns null for partial matches", () => {
    const match = createPatternMatcher("/test/path");
    const result = match("/test/path/extra");
    expect(result).toBeNull();
  });

  it("matches with a trailing slash in the pattern", () => {
    const match = createPatternMatcher("/test/path/");
    const result = match("/test/path/");
    expect(result).not.toBeNull();
  });

  it("matches pattern with optional parameters", () => {
    const match = createPatternMatcher("/test/:param?");
    const resultWithParam = match("/test/value");
    const resultWithoutParam = match("/test/");
    const resultWithoutSlash = match("/test");
    expect(resultWithParam).toEqual({ param: "value" });
    expect(resultWithoutParam).toEqual({});
    expect(resultWithoutSlash).toEqual({});
  });

  it("matches pattern with named", () => {
    const match = createPatternMatcher("/test/:path*");
    const result = match("/test/anything/after");
    expect(result).toEqual({ path: "anything/after" });
  });
});

describe("createPatternFormatter", () => {
  it("should format a simple pattern correctly", () => {
    const formatter = createPatternFormatter("/users/:userId");
    const result = formatter({ userId: "123" });
    expect(result).toBe("/users/123");
  });

  it("should handle multiple parameters in a pattern", () => {
    const formatter = createPatternFormatter("/users/:userId/posts/:postId");
    const result = formatter({ userId: "123", postId: "456" });
    expect(result).toBe("/users/123/posts/456");
  });

  it("handles patterns without parameters", () => {
    const formatter = createPatternFormatter("/about");
    const result = formatter({});
    expect(result).toBe("/about");
  });

  it("handles optional parameters", () => {
    const formatter = createPatternFormatter("/users/:userId?");
    const resultWithParam = formatter({ userId: "123" });
    const resultWithoutParam = formatter({});
    expect(resultWithParam).toBe("/users/123");
    expect(resultWithoutParam).toBe("/users");
  });
});

describe("matchRule", () => {
  it("should correctly redirect a URL based on a simple path", () => {
    const rule = {
      source: "/old-path",
      destination: "https://example.com/new-path",
      permanent: false,
    };
    const matchedUrl = matchRule(rule, new URL("https://mysite.com/old-path"));
    expect(matchedUrl).toBe("https://example.com/new-path");
  });

  it("should correctly rewrite a URL with path parameters", () => {
    const rule = {
      source: "/old/:id",
      destination: "https://example.com/new/:id",
    };
    const matchedUrl = matchRule(rule, new URL("https://mysite.com/old/123"));
    expect(matchedUrl).toBe("https://example.com/new/123");
  });

  it("returns null if the source pattern does not match the URL", () => {
    const rule = {
      source: "/unmatched-path",
      destination: "https://example.com/destination",
      permanent: true,
    };
    const matchedUrl = matchRule(
      rule,
      new URL("https://mysite.com/different-path"),
    );
    expect(matchedUrl).toBeNull();
  });
});
