"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { TMDbMovie, TMDbMoviesResponse } from "@/lib/tmdb";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "TV Movie",
  "Thriller",
  "War",
  "Western",
];

export default function GenreBrowser() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [movies, setMovies] = useState<TMDbMovie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchGenreMovies = useCallback(
    async (genre: string, page: number): Promise<TMDbMoviesResponse | null> => {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!apiKey) return null;

      try {
        // First get the genre list to map genre name -> id
        const genreListRes = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`
        );
        if (!genreListRes.ok) return null;
        const genreList: { genres: { id: number; name: string }[] } =
          await genreListRes.json();

        const match = genreList.genres.find(
          (g) => g.name.toLowerCase() === genre.toLowerCase()
        );
        if (!match) return null;

        const discoverRes = await fetch(
          `https://api.themoviedb.org/3/discover/movie?with_genres=${match.id}&page=${page}&sort_by=popularity.desc&api_key=${apiKey}`
        );
        if (!discoverRes.ok) return null;
        return await discoverRes.json();
      } catch {
        return null;
      }
    },
    []
  );

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    setIsOpen(false);
    setLoading(true);
    setMovies([]);
    setCurrentPage(1);
    setTotalPages(1);

    const data = await fetchGenreMovies(genre, 1);
    if (data) {
      setMovies(data.results);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    }
    setLoading(false);
  };

  const handleShowMore = async () => {
    if (!selectedGenre || loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);

    const nextPage = currentPage + 1;
    const data = await fetchGenreMovies(selectedGenre, nextPage);
    if (data) {
      setMovies((prev) => [...prev, ...data.results]);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    }
    setLoadingMore(false);
  };

  const hasMore = currentPage < totalPages;

  return (
    <section className="px-4 sm:px-6 md:px-10 mt-10">
      {/* Genre Dropdown Trigger */}
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:border-zinc-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3.75c-4.556 0-8.25 3.694-8.25 8.25s3.694 8.25 8.25 8.25 8.25-3.694 8.25-8.25S16.556 3.75 12 3.75zM12 8.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
            />
          </svg>
          {selectedGenre ?? "Browse by Genre"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 top-full mt-2 z-20 w-56 rounded-md border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className={`w-full px-4 py-2 text-left text-sm transition hover:bg-zinc-800 ${
                    selectedGenre === genre
                      ? "text-white font-medium"
                      : "text-zinc-300"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Movie Grid */}
      {loading && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-md bg-zinc-800"
            />
          ))}
        </div>
      )}

      {!loading && movies.length > 0 && (
        <div className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <Link
                key={`${movie.id}-${currentPage}`}
                href={`/watch/${movie.id}`}
                className="group aspect-[2/3] relative overflow-hidden rounded-md bg-zinc-900"
              >
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
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-2 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <p className="text-xs font-medium text-white truncate">
                    {movie.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Show More */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleShowMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m0 0l-6-6m6 6l6-6"
                      />
                    </svg>
                    Show More
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && selectedGenre && movies.length === 0 && (
        <div className="mt-8 text-center text-sm text-zinc-500">
          No movies found for &ldquo;{selectedGenre}&rdquo;.
        </div>
      )}
    </section>
  );
}

