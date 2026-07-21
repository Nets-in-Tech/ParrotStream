export interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date: string | null;
  genre_ids?: number[];
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbMovieDetails {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date: string | null;
  genres: TMDbGenre[];
}

export interface TMDbMoviesResponse {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";

function ensureConfig() {
  if (!TMDB_API_KEY) {
    throw new Error("Missing TMDB_API_KEY in environment variables");
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  ensureConfig();

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${TMDB_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`TMDb request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }

  return (await res.json()) as T;
}

export interface TrendingMoviesOptions {
  page?: number;
}

export async function getTrendingMovies(options: TrendingMoviesOptions = {}): Promise<TMDbMoviesResponse> {
  const page = options.page ?? 1;

  // `/trending/movie/day`
  const url = `${TMDB_BASE_URL}/trending/movie/day?page=${encodeURIComponent(String(page))}`;
  return fetchJson<TMDbMoviesResponse>(url);
}

export async function getMoviesByCategory(
  category: string,
  options?: { page?: number }
): Promise<TMDbMoviesResponse> {
  // Category is a genre name like "Action"/"Comedy"/"Sci-Fi".
  // To keep this free + simple, we map it to a genre_id using the `/genre/movie/list` endpoint.

  const normalized = category.trim().toLowerCase();
  const page = options?.page ?? 1;

  const genreListUrl = `${TMDB_BASE_URL}/genre/movie/list`;
  const genreList = await fetchJson<{ genres: Array<{ id: number; name: string }> }>(genreListUrl);

  const match = genreList.genres.find((g) => g.name.trim().toLowerCase() === normalized);

  if (!match) {
    // Return empty results if genre not found.
    return {
      page,
      results: [],
      total_pages: 1,
      total_results: 0,
    };
  }

  // `/discover/movie?with_genres=<id>`
  const url = `${TMDB_BASE_URL}/discover/movie?with_genres=${encodeURIComponent(String(match.id))}&page=${encodeURIComponent(String(page))}`;
  return fetchJson<TMDbMoviesResponse>(url);
}

export async function getMovieDetails(movieId: number): Promise<TMDbMovieDetails | null> {
  try {
    const url = `${TMDB_BASE_URL}/movie/${encodeURIComponent(String(movieId))}`;
    return await fetchJson<TMDbMovieDetails>(url);
  } catch {
    return null;
  }
}

