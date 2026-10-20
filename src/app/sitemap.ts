import type { MetadataRoute } from "next";
import { EXPERIMENTS } from "@/lib/experiments";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...EXPERIMENTS.map((e) => e.href),
    "/log",
    ...EXPERIMENTS.map((e) => `/log/${e.slug}`),
  ];
  return paths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    priority: path === "/" ? 1 : path === "/log" ? 0.6 : 0.8,
  }));
}
