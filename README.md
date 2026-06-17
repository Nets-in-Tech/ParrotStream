# ParrotStream
An app to watch movies, and shows.

# 🎬 Next.js Netflix Clone

A high-performance, responsive Netflix streaming client clone built with Next.js (Turbopack), TypeScript, and Tailwind CSS. The application integrates directly with The Movie Database (TMDB) API to dynamically source movie catalogs, poster grids, and stream official media trailers directly via a sandboxed YouTube iframe player architecture.

---

## 🚀 Key Features

*   **Dynamic Routing:** Implements Next.js dynamic routes (`/watch/[id]`) to unwrap route parameters asynchronously using modern React patterns (`use(params)`).
*   **Live Trailer Sourcing:** Automatically queries the TMDB `/videos` API endpoint on load to extract official trailers or teasers, dropping them into a responsive layout.
*   **Resilient Video Pipeline:** Features robust array filtering with automatic fallback fall-throughs (Trailer ➔ Teaser ➔ First Available Video Element) to guarantee the screen never freezes.

---

## 🛠️ Tech Stack

*   **Frontend Framework:** Next.js (App Router)
*   **Language:** TypeScript (Strict Type Mapping)
*   **Styling:** Tailwind CSS
*   **Data Provider:** The Movie Database (TMDB) API
*   **Containerization:** Docker

---

### Environment Setup

Create a `.env.local` file in the root of your project and add your TMDB access credentials:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_actual_tmdb_api_key_here
