import React from "react";
import Link from "next/link";
import { getMovieStreamUrl } from "@/lib/services/media";
import NativeHlsPlayer from "@/components/NativeHlsPlayer";

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  // 1. Resolve the route parameters asynchronously
  const resolvedParams = await params;
  const movieId = resolvedParams?.id;

  // 2. Invoke our centralized service layer directly
  // NOTE: embedUrl now represents a direct .m3u8 stream URL (not an iframe embed).
  const streamData = await getMovieStreamUrl(movieId);

  // 3. Fallback screen boundary if data pipeline returns success: false
  if (!streamData.success || !streamData.embedUrl) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-neutral-950 text-white font-sans">
        <h1 className="text-2xl font-bold tracking-tight text-red-600 mb-4">Playback Stream Unavailable</h1>
        <p className="text-neutral-400 mb-6 text-sm">We ran into an issue initializing the media pipeline for this title.</p>
        <Link
          href="/"
          className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-medium text-sm transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // 4. Successful execution state: Render layout view
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
          <span className="text-sm font-semibold uppercase tracking-wider">Exit Preview</span>
        </Link>
      </header>

      {/* Native HLS Video Player */}
      <div className="w-full h-full">
        <NativeHlsPlayer streamUrl={streamData.embedUrl} />
      </div>
    </div>
  );
}

