import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// In-memory store for settings (replace with database in production)
// TODO: Replace with actual database implementation
const settingsStore = new Map<number, UserSettings>();

interface UserSettings {
  userId: number;
  defaultVisibility: "public" | "private";
  defaultGitignore: string;
  defaultBranch: string;
  commitStyle: "conventional" | "simple" | "custom";
  showTips: boolean;
  professionalMode: boolean;
}

export async function GET() {
  try {
    const user = await requireAuth();

    // Get settings from store (or database)
    const settings = settingsStore.get(user.id) || {
      userId: user.id,
      defaultVisibility: "public" as const,
      defaultGitignore: "",
      defaultBranch: "main",
      commitStyle: "conventional" as const,
      showTips: true,
      professionalMode: false,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const settings: UserSettings = {
      userId: user.id,
      defaultVisibility: body.defaultVisibility || "public",
      defaultGitignore: body.defaultGitignore || "",
      defaultBranch: body.defaultBranch || "main",
      commitStyle: body.commitStyle || "conventional",
      showTips: body.showTips !== undefined ? body.showTips : true,
      professionalMode: body.professionalMode !== undefined ? body.professionalMode : false,
    };

    // Save to store (replace with database in production)
    settingsStore.set(user.id, settings);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error saving settings:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

