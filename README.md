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

### Rewrites

### Redirects
