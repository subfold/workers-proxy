import { createProxy } from "../src/";

export default {
  fetch: createProxy({
    origin: "https://subfold-demo-main.webflow.io",
    redirects: [
      {
        source: "/redirect",
        destination: "https://news.ycombinator.com/",
        permanent: false,
      },
    ],
    rewrites: [
      {
        source: "/blog/:path*",
        destination: "https://subfold-demo-blog.webflow.io/:path*",
      },
    ],
  }),
};
