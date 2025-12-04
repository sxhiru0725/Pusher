import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAccessToken } from "@/lib/auth";
import { fetchUserRepos } from "@/lib/github";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "30", 10);

    const repos = await fetchUserRepos(accessToken, page, perPage);

    return NextResponse.json(
      repos.map((repo) => ({
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description,
        visibility: repo.private ? "private" : "public",
        language: repo.language || "Unknown",
        lastUpdated: new Date(repo.updated_at).toISOString().split("T")[0],
        defaultBranch: repo.default_branch,
        hasIssues: repo.has_issues,
        fullName: repo.full_name,
      }))
    );
  } catch (error) {
    console.error("Error fetching repos:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}

