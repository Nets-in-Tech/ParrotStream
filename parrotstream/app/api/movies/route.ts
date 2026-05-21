import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");

    if (!movieId) {
      return NextResponse.json(
        {
          success: false,
          message: "movieId is missing",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        embedUrl: `https://vidsrc.to/embed/movie/${movieId}`,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to resolve embed URL",
      },
      { status: 200 }
    );
  }
}

