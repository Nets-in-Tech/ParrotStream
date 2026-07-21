"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TMDbMovie, TMDbMovieDetails } from "@/lib/tmdb";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

interface GenreRecommendationsProps {
  movieId: number;
}

export default function GenreRecommendations({ movieId }: GenreRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TMDbMovie[]>([]);
  const [genreLabel, setGenreLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!apiKey) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch movie details to get genres
        const detailsRes = await fetch(
          `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}`
        );
        if (!detailsRes.ok) throw new Error("Failed to fetch movie details");
        const details: TMDbMovieDetails = await detailsRes.json();

        if (!details.genres || details.genres.length === 0) {
          if (!cancelled) setLoading(false);
          return;
        }

        const firstGenre = details.genres[0];
        const genreName = firstGenre.name;
        setGenreLabel(genreName);

        // 2. Map genre name to genre ID from our static map
        const genreId = Object.entries(GENRE_MAP).find(
          ([, name]) => name.toLowerCase() === genreName.toLowerCase()
        )?.[0];

        if (!genreId) {
          if (!cancelled) setLoading(false);
          return;
        }

        // 3. Fetch discover movies by that genre
        const discoverRes = await fetch(
          `${TMDB_BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&api_key=${apiKey}`
        );
        if (!discoverRes.ok) throw new Error("Failed to fetch recommendations");
        const data = await discoverRes.json();
        const movies: TMDbMovie[] = data.results ?? [];

        // Exclude the current movie from recommendations
        const filtered = movies.filter((m) => m.id !== movieId).slice(0, 20);

        if (!cancelled) {
          setRecommendations(filtered);
          setLoading(false);
        }
      } catch (err) {
        console.error("GenreRecommendations error:", err);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 md:px-10 mt-8">
        <div className="h-5 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] w-[160px] flex-none animate-pulse rounded-md bg-zinc-800"
            />
          ))}
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 md:px-10 mt-8 pb-10">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-100 sm:text-base">
          More {genreLabel} Movies
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/0 via-zinc-800 to-zinc-800/0" />
      </div>

      <div className="mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 py-2">
          {recommendations.map((movie) => (
            <Link
              key={movie.id}
              href={`/watch/${movie.id}`}
              className="group relative aspect-[2/3] w-[160px] sm:w-[180px] md:w-[200px] flex-none"
            >
              <div className="relative h-full w-full overflow-hidden rounded-md bg-zinc-900">
                {movie.poster_path ? (
                  <img
                    src={`${IMG_BASE}${movie.poster_path}`}
                    alt={movie.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-900" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

