import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomePortal — Семейный портал",
    short_name: "HomePortal",
    description: "Уютное семейное пространство — фото, воспоминания и кинотеатр",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FDF8F3",
    theme_color: "#D4A96A",
    orientation: "portrait",
    lang: "ru",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
