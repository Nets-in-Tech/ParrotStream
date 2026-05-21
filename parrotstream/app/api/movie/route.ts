import { NextResponse } from "next/server";
import { getMovieStreamUrl } from "@/lib/services/media";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");

    if (!movieId) {
      return NextResponse.json(
        {
          success: false,
          error: "movieId is missing",
        },
        { status: 400 }
      );
    }

    const result = await getMovieStreamUrl(movieId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? "Unable to resolve movie stream URL",
          embedUrl: null,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        embedUrl: result.embedUrl,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Operational error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 422 }
    );
  }
}

