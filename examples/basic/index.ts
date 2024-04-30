import { createProxy } from "../../src/";

export default {
  fetch: createProxy({
    origin: "https://workers-proxy-demo-1.tiiny.site",
    redirects: [
      {
        source: "/redirect",
        destination: "https://workers-proxy-demo-2.tiiny.site",
        permanent: false,
      },
    ],
    rewrites: [
      {
        source: "/subdirectory/:path*",
        destination: "https://workers-proxy-demo-2.tiiny.site",
      },
    ],
  }),
};
