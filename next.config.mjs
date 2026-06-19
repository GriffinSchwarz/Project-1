/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The runtime engine keeps live state in a module-level singleton, so the API
  // routes run in the Node.js runtime (set per-route) within one server instance.
  // Keep type-checking on (it catches real bugs), but don't fail the build on
  // lint style warnings for this generated project.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
