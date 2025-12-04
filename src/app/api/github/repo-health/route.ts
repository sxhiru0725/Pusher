import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAccessToken } from "@/lib/auth";
import { checkRepoHealth } from "@/lib/github";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing owner or repo parameter" },
        { status: 400 }
      );
    }

    const health = await checkRepoHealth(accessToken, owner, repo);

    return NextResponse.json(health);
  } catch (error) {
    console.error("Error checking repo health:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to check repository health" },
      { status: 500 }
    );
  }
}

