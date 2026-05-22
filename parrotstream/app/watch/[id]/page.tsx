"use client";

import React, { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";

type TMDBVideoType = {
  id: string | number;
  site?: string;
  type?: string;
  key?: string;
};

type TMDBVideosResponse = {
  results: TMDBVideoType[];
};

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WatchPage({ params }: WatchPageProps) {
  const resolvedParams = use(params);
  const tmdbId = resolvedParams?.id;

  const [youtubeKey, setYoutubeKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trailerMessage, setTrailerMessage] = useState<string | null>(null);

  const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const youtubeEmbedSrc = useMemo(() => {
    if (!youtubeKey) return "";
    return `https://www.youtube.com/embed/${encodeURIComponent(youtubeKey)}?autoplay=1&mute=0&rel=0&modestbranding=1`;
  }, [youtubeKey]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setYoutubeKey(null);
      setTrailerMessage(null);

      if (!tmdbId) {
        if (!cancelled) {
          setIsLoading(false);
          setTrailerMessage("No trailer preview available for this title");
        }
        return;
      }

      if (!tmdbApiKey) {
        if (!cancelled) {
          setIsLoading(false);
          setTrailerMessage("No trailer preview available for this title");
        }
        return;
      }

      try {
        const url = `https://api.themoviedb.org/3/movie/${encodeURIComponent(
          String(tmdbId)
        )}/videos?api_key=${encodeURIComponent(String(tmdbApiKey))}`;

        console.log("Fetching TMDB ID:", tmdbId);

        const res = await fetch(url, { method: "GET" });
        if (!res.ok) {
          throw new Error(`TMDB videos request failed: ${res.status}`);
        }

        const data = (await res.json()) as TMDBVideosResponse;
        console.log("TMDB API Response:", data);

        const results = Array.isArray(data?.results) ? data.results : [];

        // Requirement 2: Loosened video type filtering with fallbacks
        // First choice: site === "YouTube" && type === "Trailer"
        // Second choice: site === "YouTube" && type === "Teaser"
        // Third choice: Just grab the very first item in results array (results[0].key)
        let selectedKey: string | undefined;

        if (results.length === 0) {
          selectedKey = undefined;
        } else {
          // Try YouTube Trailer first
          const trailer = results.find(
            (v) => v?.site === "YouTube" && v?.type === "Trailer"
          );
          if (trailer?.key) {
            selectedKey = trailer.key;
          } else {
            // Try YouTube Teaser as fallback
            const teaser = results.find(
              (v) => v?.site === "YouTube" && v?.type === "Teaser"
            );
            if (teaser?.key) {
              selectedKey = teaser.key;
            } else {
              // Absolute fallback: grab first item with a key, regardless of type
              const firstWithKey = results.find((v) => v?.key);
              selectedKey = firstWithKey?.key;
            }
          }
        }

        if (!cancelled) {
          if (selectedKey) {
            setYoutubeKey(selectedKey);
          } else {
            setYoutubeKey(null);
            setTrailerMessage("No trailer preview available for this title");
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch TMDB videos:", err);
        if (!cancelled) {
          setYoutubeKey(null);
          setTrailerMessage("No trailer preview available for this title");
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tmdbId, tmdbApiKey]);

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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-wider">
            Exit Preview
          </span>
        </Link>
      </header>

      <div className="w-full h-full bg-black flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-pulse h-3 w-3 rounded-full bg-red-500" />
            <div className="text-white text-lg font-medium animate-pulse">
              Sourcing Official Trailer...
            </div>
          </div>
        ) : trailerMessage ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-white/60 text-lg">{trailerMessage}</div>
          </div>
        ) : (
          <iframe
            title="Watch"
            src={youtubeEmbedSrc}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
    </div>
  );
}