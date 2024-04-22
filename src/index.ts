import { pathToRegexp, compile, Key } from "path-to-regexp";

type RouteParams = Record<string, string>;

export type Rewrite = {
  source: string;
  destination: string;
};

export type ProxyOptions = {
  rewrites: Rewrite[];
};

/**
 * Creates a matcher function for a specific URL pattern.
 *
 * @param pattern - The URL pattern to match, e.g., "/user/:id".
 * @returns A function that takes a URL and returns the extracted parameters or null if no match.
 */
export function createMatcher(
  pattern: string,
): (url: string) => RouteParams | null {
  const keys: Key[] = [];
  const regexp = pathToRegexp(pattern, keys);
  return (url: string) => {
    const match = regexp.exec(url);
    if (!match) return null;

    const params: RouteParams = {};
    keys.forEach((key, index) => {
      if (typeof key.name === "string") {
        // Ensuring the key name is a string.
        params[key.name] = match[index + 1];
      }
    });
    return params;
  };
}

/**
 * Creates a URL formatter function from a destination pattern.
 *
 * @param destinationPattern - The pattern to use for formatting, e.g., "/profile/:id".
 * @returns A function that takes parameters and returns the formatted URL.
 */
export function createFormatter(
  destinationPattern: string,
): (params: RouteParams) => string {
  const compilePath = compile(destinationPattern);
  return (params: RouteParams) => compilePath(params);
}

/**
 * Creates a proxy handler function
 * @param options
 */
export function createProxy(options: ProxyOptions) {
  const handler = (request: Request) => {
    for (const rewrite of options.rewrites) {
      const matchUrl = createMatcher(rewrite.source);
      const matchedParams = matchUrl(request.url);

      if (matchedParams) {
        const formatUrl = createFormatter(rewrite.destination);
        return fetch(formatUrl(matchedParams));
      }
    }
    return new Response("Not Found", { status: 404 });
  };
  return handler;
}
