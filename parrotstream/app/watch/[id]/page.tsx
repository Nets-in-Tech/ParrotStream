import React from "react";
import Link from "next/link";

interface WatchPageProps {
  params: { id: string };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const tmdbId = params?.id;

  const iframeSrc = tmdbId
    ? `https://vidsrc.xyz/embed/movie/${encodeURIComponent(String(tmdbId))}`
    : "";

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {/* Cinematic Navigation Overlay */}
      <header className="absolute top-0 left-0 w-full z-50 p-6 bg-gradient-to-b from-black/80 to-transparent">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-white/70 hover:text-white font-medium tracking-wide transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-wider">
            Exit Preview
          </span>
        </Link>
      </header>

      {/* vidsrc.xyz Embed */}
<div className="w-full h-full bg-black flex items-center justify-center">
  {iframeSrc ? (
    <iframe
      key={tmdbId}
      title="Watch"
      src={iframeSrc}
      className="w-full h-full border-0"
      allowFullScreen
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  ) : (
    // Optional: Show a nice clean loading state while the ID resolves
    <div className="text-white text-lg font-medium animate-pulse">
      Loading video stream...
    </div>
  )}
</div>
    </div>
  );
}


