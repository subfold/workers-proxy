# WIP: Cloudflare Workers Proxy

A simple library for creating reverse proxies with Cloudflare Workers.

## Installation

```bash
npm install workers-proxy
```

## Usage

```typescript
import { createProxy } from "workers-proxy";

export default {
  fetch: createProxy({
    origin: "https://example.com",
    rewrites: [
      {
        source: "/blog/:path*",
        destination: "http://blog.example.com",
      },
    ],
  }),
};
```

### Origin

The `origin` option is the URL of the target server you want to proxy requests to.

### Rewrites

The `rewrites` option is an array of rewrite rules that will be applied to the requested URL before it is proxied to the target server. Each rule is an object with the following properties:

- **source** - The pattern to match against the requested URL pathname. Patterns can contain named parameters prefixed with a colon (e.g. `:path`) and include a zero-or-more operator to match the rest of the path (e.g. `:path*`). Parameters are accessible in the `destination` URL using the same name. Learn more about formatting patterns in the [path-to-regexp](https://github.com/pillarjs/path-to-regexp) documentation.
- **destination** - The URL to proxy the request to. Parameters from the `source` pattern can be used in the `destination` URL.

### Redirects

The `redirects` option is an array of redirect rules that will be applied to the requested URL before it is proxied to the target server. Each rule is an object with the following properties:

- **source** - The pattern to match against the requested URL pathname. Patterns can contain named parameters prefixed with a colon (e.g. `:path*`) and include a zero-or-more operator to match the rest of the path (e.g. `:path*`). Parameters are accessible in the `destination` URL using the same name. Learn more about formatting patterns in the [path-to-regexp](https://github.com/pillarjs/path-to-regexp) documentation.
- **destination** - The URL to redirect the request to. Parameters from the `source` pattern can be used in the `destination` URL.
- **permanent** - A boolean value indicating whether the redirect should be permanent (308) or temporary (307).
