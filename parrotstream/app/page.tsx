import Link from "next/link";
import type { TMDbMovie } from "@/lib/tmdb";
import { getMoviesByCategory, getTrendingMovies } from "@/lib/tmdb";
import GenreBrowser from "@/components/GenreBrowser";

function buildBackdropUrl(movie?: TMDbMovie | null) {

  // TMDb poster/backdrop paths are relative; fall back to a local gradient if missing.
  const path = movie?.backdrop_path;
  if (!path) return null;
  return `https://image.tmdb.org/t/p/original${path}`;
}

function MovieCard({ movie }: { movie: TMDbMovie }) {
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  // movie.id is already the TMDB numeric ID, so route directly.
  return (
    <Link
      href={`/watch/${movie.id}`}
      className="group relative aspect-[2/3] w-[160px] sm:w-[180px] md:w-[200px] flex-none"
    >
      <div className="relative h-full w-full overflow-hidden rounded-md bg-zinc-900">

        {poster ? (
          // Using plain img to avoid next/image remote config requirements.
          <img
            src={poster}
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
  );
}


function CatalogRow({title, movies}: 
  {title: string; movies: TMDbMovie[];}) {
  return (
    <section className="px-4 sm:px-6 md:px-10">
      <div className="mt-6 flex items-center gap-3">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-100 sm:text-base">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/0 via-zinc-800 to-zinc-800/0" />
      </div>

      <div className="mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 py-2">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  // Pull three collections from TMDb.
  // Trending is always available. Genre rows use genre matching.
  const trending = await getTrendingMovies({ page: 1 });

  // Free + simple mapping; TMDb genre resolution happens inside getMoviesByCategory.
  const action = await getMoviesByCategory("Action");
  const scifi = await getMoviesByCategory("Science Fiction");

  const heroMovie = trending.results[0];
  const backdrop = buildBackdropUrl(heroMovie);

  const heroTitle = heroMovie?.title ?? "Trending Now";
  const heroDescription = heroMovie?.overview
    ? heroMovie.overview.length > 170
      ? `${heroMovie.overview.slice(0, 170)}...`
      : heroMovie.overview
    : "Discover what everyone is watching today.";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <header className="relative">
        {backdrop ? (
          <div className="absolute inset-0">
            <img
              src={backdrop}
              alt="Hero backdrop"
              className="h-full w-full object-cover opacity-60"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/10 via-zinc-950/70 to-zinc-950" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-zinc-950" />
        )}

        <div className="relative px-4 sm:px-6 md:px-10 pt-24 pb-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-100">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>ParrotStream • Netflix-style UI</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {heroTitle}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              {heroDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/watch/${heroMovie?.id ?? ""}`}
                className="inline-flex items-center justify-center rounded bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                <span className="mr-2">▶</span>
                Play
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="rounded bg-white/5 px-3 py-1">HD</span>
              <span className="rounded bg-white/5 px-3 py-1">New Episodes</span>
              <span className="rounded bg-white/5 px-3 py-1">Trending</span>
            </div>
          </div>
        </div>
      </header>

      {/* Genre Browser */}
      <GenreBrowser />

      {/* Rows */}
      <CatalogRow title="Trending" movies={trending.results.slice(0, 20)} />
      <CatalogRow title="Action" movies={action.results.slice(0, 20)} />
      <CatalogRow title="Sci-Fi" movies={scifi.results.slice(0, 20)} />

      {/* Footer */}
      <div className="mt-10 px-4 pb-10 text-center text-xs text-zinc-500 sm:px-6 md:px-10">
        Data from TMDb • UI scaffold for your Netflix clone.
      </div>
    </div>
  );
}

