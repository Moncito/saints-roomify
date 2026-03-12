import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/feed",           "routes/feed.tsx"),
  route("/explore",        "routes/explore.tsx"),
  route("/tags",           "routes/tags.tsx"),
  route("/visualizer/:id", "routes/visualizer.$id.tsx"),
] satisfies RouteConfig;