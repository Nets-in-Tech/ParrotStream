import React from "react";
import Link from "next/link";

type PageProps = {
  params: {
    id: string;
  };
};

type MoviesApiResponse = {
  success: boolean;
  embedUrl?: string;
  message?: string;
};

export default async function WatchPage({ params }: PageProps) {
  const id = params.id;

  const res = await fetch(
    `http://localhost:3000/api/movie?movieId=${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );


  const data = (await res.json()) as MoviesApiResponse;
  const embedUrl = data?.success ? data.embedUrl : undefined;

  return (
    <div className="relative min-h-screen w-full bg-black">
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
        aria-label="Back"
      >
        ← Back
      </Link>

      <iframe
        width="100%"
        height="100%"
        frameBorder={0}
        title="Movie player"
        className="h-screen w-screen"
        src={embedUrl ?? "about:blank"}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />

    </div>
  );
}


