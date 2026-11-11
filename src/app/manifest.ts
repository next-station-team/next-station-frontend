import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "다음역",
    short_name: "다음역",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a5cff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
