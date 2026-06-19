import type { MetadataRoute } from "next";

// PWA manifest so the dashboard can be added to a phone home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FleetView — Agent Operations",
    short_name: "FleetView",
    description: "Activate, run, and supervise your work agents from anywhere.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e1a",
    theme_color: "#0a0e1a",
    icons: [
      {
        // Inline SVG icon — no binary asset needed.
        src:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='40' fill='#0a0e1a'/><circle cx='96' cy='96' r='30' fill='#6366f1'/><g stroke='#6366f1' stroke-width='6' fill='none'><circle cx='96' cy='30' r='14'/><circle cx='96' cy='162' r='14'/><circle cx='30' cy='96' r='14'/><circle cx='162' cy='96' r='14'/></g><g stroke='#2a3550' stroke-width='4'><line x1='96' y1='66' x2='96' y2='44'/><line x1='96' y1='126' x2='96' y2='148'/><line x1='66' y1='96' x2='44' y2='96'/><line x1='126' y1='96' x2='148' y2='96'/></g></svg>`,
          ),
        sizes: "192x192",
        type: "image/svg+xml",
      },
    ],
  };
}
