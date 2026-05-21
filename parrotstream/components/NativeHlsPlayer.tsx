"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

// hls.js ships its own types in modern versions; if your TS setup is missing them,
// this file will still compile once the dependency is installed.
// Error event payload typing varies between versions, so we keep handlers type-safe via unknown.


export type NativeHlsPlayerProps = {
  streamUrl: string;
};

/**
 * Production-ready native HLS player.
 *
 * Architecture:
 * - Uses a real <video> element (no iframes).
 * - Uses hls.js when native HLS is not available (non-Safari / desktop Safari can differ).
 * - Uses video.canPlayType('application/vnd.apple.mpegurl') as Safari fallback.
 * - Includes error recovery with hls.recoverMediaError().
 * - Strict cleanup with hls.destroy() on unmount.
 */
export default function NativeHlsPlayer({ streamUrl }: NativeHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // streamUrl is already a primitive; memo prevents needless effect churn.
  const resolvedStreamUrl = useMemo(() => streamUrl, [streamUrl]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Cleanup previous instance if any.
    if (hlsInstanceRef.current) {
      try {
        hlsInstanceRef.current.destroy();
      } catch {
        // ignore
      }
      hlsInstanceRef.current = null;
    }

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleVideoError = () => {
      const mediaErr = videoEl.error;
      setErrorMessage(
        mediaErr ? `Playback error (code ${mediaErr.code}).` : "Playback error."
      );
      setIsLoading(false);
    };

    // Guardrail: never stay in "Loading" forever (useful when dev HMR is broken).
    const loadingTimeoutMs = 15000;
    const loadingTimer = window.setTimeout(() => {
      if (!videoEl.readyState || videoEl.readyState < 2) {
        setIsLoading(false);
        setErrorMessage("Loading timed out. Please try reloading the page.");
      }
    }, loadingTimeoutMs);


    videoEl.addEventListener("canplay", handleCanPlay);
    videoEl.addEventListener("waiting", handleWaiting);
    videoEl.addEventListener("error", handleVideoError);

    // We'll return a cleanup function at the end of this effect.
    // (Need to keep `hls` scope correct.)

    const isSafariNativeHls =
      typeof videoEl.canPlayType === "function" &&
      Boolean(videoEl.canPlayType("application/vnd.apple.mpegurl"));

    // Safari fallback: native HLS support.
    if (isSafariNativeHls) {
      videoEl.src = resolvedStreamUrl;
      videoEl.load();

      return () => {
        videoEl.removeEventListener("canplay", handleCanPlay);
        videoEl.removeEventListener("waiting", handleWaiting);
        videoEl.removeEventListener("error", handleVideoError);
      };
    }

    // Non-Safari: hls.js for adaptive bitrate.
    if (!Hls.isSupported()) {
      // Avoid lint rule about synchronous setState in effects.
      queueMicrotask(() => {
        setErrorMessage("HLS is not supported in this browser.");
        setIsLoading(false);
      });

      return () => {
        videoEl.removeEventListener("canplay", handleCanPlay);
        videoEl.removeEventListener("waiting", handleWaiting);
        videoEl.removeEventListener("error", handleVideoError);
      };
    }

    // Buffer handling setup notes:
    // - backBufferLength: retains recent segments for smooth seek/rewind.
    // - maxBufferLength: caps buffer to reduce memory spikes.
    // - enableWorker: offloads parsing work to improve main-thread responsiveness.
    const hls = new Hls({
      autoStart: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      enableWorker: true,
    });

    hlsInstanceRef.current = hls;

    hls.on(Hls.Events.ERROR, (_event: unknown, data: unknown) => {
      // hls.js error payload shape varies; guard carefully.
      // Network errors often recover automatically.
      if (data?.type === "networkError") {
        setIsLoading(true);
        return;
      }

      // Media errors: attempt recovery as requested.
      if (data?.type === "mediaError") {
        setIsLoading(true);
        try {
          hls.recoverMediaError();
        } catch {
          setErrorMessage("Media error recovery failed.");
          setIsLoading(false);
        }
        return;
      }

      if (data?.fatal) {
        setErrorMessage("Fatal HLS playback error. Playback cannot continue.");
        setIsLoading(false);
      }
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      // Once manifest is parsed, we can consider the player ready.
      setIsLoading(false);
    });

    hls.attachMedia(videoEl);
    hls.loadSource(resolvedStreamUrl);

    return () => {
      videoEl.removeEventListener("canplay", handleCanPlay);
      videoEl.removeEventListener("waiting", handleWaiting);
      videoEl.removeEventListener("error", handleVideoError);

      // Strict cleanup to prevent memory leaks.
      try {
        hls.destroy();
      } finally {
        if (hlsInstanceRef.current === hls) hlsInstanceRef.current = null;
      }
    };
  }, [resolvedStreamUrl]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain md:object-cover"
        controls
        playsInline
        preload="metadata"
      />

      {/* Non-intrusive loading/error overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {isLoading ? (
          <div className="bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded">
            Loading stream…
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="bg-red-950/70 text-white text-sm px-4 py-2 rounded max-w-[90%]">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}

