// lib/services/media.ts

interface StreamProviderResponse {
  success: boolean;
  embedUrl: string | null;
  error?: string;
}

/**
 * Centralized streaming URL resolver.
 *
 * DEV MOCK LAYER (as requested):
 * - Instead of resolving insecure embed URLs, we return a stable public HLS test manifest.
 * - This keeps the page->component dataflow intact and strongly typed.
 *
 * Replace this implementation later with your production-grade signed/authorized .m3u8 resolver.
 */
export async function getMovieStreamUrl(_movieId: string): Promise<StreamProviderResponse> {
  // Always succeed with the stable public HLS test stream.
  return {
    success: true,
    embedUrl: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
  };
}

