import { pathToRegexp, compile, Key } from "path-to-regexp";

type RouteParams = Record<string, string>;

export type Rewrite = {
  source: string;
  destination: string;
};

export type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

export type ProxyOptions = {
  origin?: string;
  rewrites?: Rewrite[];
  redirects?: Redirect[];
};

export function joinPaths(...segments: string[]): string {
  return segments.join("/").replace(/\/\/+/g, "/");
}

export function createPatternMatcher(
  pattern: string,
): (url: string) => RouteParams | null {
  const keys: Key[] = [];
  const regexp = pathToRegexp(pattern, keys);
  return (url: string) => {
    const match = regexp.exec(url);
    if (!match) {
      return null;
    }
    const params: RouteParams = {};
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (typeof key.name === "string") {
        params[key.name] = match[index + 1];
      }
    }
    return params;
  };
}

export function createPatternFormatter(
  destinationPattern: string,
): (params: RouteParams) => string {
  const compilePath = compile(destinationPattern, { validate: false });
  return (params: RouteParams) => {
    return compilePath(params);
  };
}

export function matchRule(
  rule: Rewrite | Redirect,
  requestUrl: URL,
): string | null {
  const matchSource = createPatternMatcher(rule.source);
  const matchedParams = matchSource(
    requestUrl.toString().replace(requestUrl.origin, ""),
  );
  if (!matchedParams) {
    return null;
  }
  const destionationUrl = new URL(rule.destination);
  const formatPath = createPatternFormatter(
    destionationUrl.toString().replace(destionationUrl.origin, ""),
  );
  destionationUrl.pathname = formatPath(matchedParams);
  return destionationUrl.toString();
}

export function proxy(url: string, request: Request): Promise<Response> {
  const proxiedRequest = new Request(url, request);
  proxiedRequest.headers.set(
    "x-forwarded-for",
    request.headers.get("cf-connecting-ip") || "",
  );
  proxiedRequest.headers.set(
    "x-forwarded-host",
    request.headers.get("host") || "",
  );
  proxiedRequest.headers.set("x-forwarded-proto", "https");
  return fetch(url, request);
}

export function createProxy(options: ProxyOptions) {
  const handler = async (initialRequest: Request) => {
    try {
      const requestUrl = new URL(initialRequest.url);
      if (options.redirects) {
        for (const redirect of options.redirects) {
          const redirectUrl = matchRule(redirect, requestUrl);
          if (redirectUrl) {
            return Response.redirect(
              redirectUrl,
              redirect.permanent ? 308 : 307,
            );
          }
        }
      }
      if (options.rewrites) {
        for (const rewrite of options.rewrites) {
          const proxiedUrl = matchRule(rewrite, requestUrl);
          if (proxiedUrl) {
            return proxy(proxiedUrl, initialRequest);
          }
        }
      }
      if (options.origin) {
        const originUrl = new URL(options.origin);
        originUrl.pathname = joinPaths(originUrl.pathname, requestUrl.pathname);
        return proxy(originUrl.toString(), initialRequest);
      }
      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.log(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  };
  return handler;
}
