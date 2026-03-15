import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SipQuest",
    short_name: "SipQuest",
    description: "飲んだお酒の味と写真を記録して楽しむ個人向けノート",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f3e8",
    theme_color: "#123524",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
