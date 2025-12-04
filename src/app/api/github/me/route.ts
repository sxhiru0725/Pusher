import { NextResponse } from "next/server";
import { requireAuth, getAccessToken } from "@/lib/auth";
import { fetchGitHubUser } from "@/lib/github";

export async function GET() {
  try {
    await requireAuth();
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 });
    }

    const githubUser = await fetchGitHubUser(accessToken);

    return NextResponse.json({
      login: githubUser.login,
      avatar_url: githubUser.avatar_url,
      bio: githubUser.bio,
      public_repos: githubUser.public_repos,
      followers: githubUser.followers,
      following: githubUser.following,
      updated_at: githubUser.updated_at,
      name: githubUser.name,
    });
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

