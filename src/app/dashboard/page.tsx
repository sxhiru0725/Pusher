"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RepoList } from "@/components/dashboard/repo-list";
import { LearningTip } from "@/components/learning/learning-tip";
import {
  Plus,
  Upload,
  FileText,
  ExternalLink,
  Clock,
  Github,
  Users,
  FolderGit2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface GitHubUser {
  login: string;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  updated_at: string;
  name: string | null;
}

interface GitHubRepo {
  id: string;
  name: string;
  description: string | null;
  visibility: "public" | "private";
  language: string;
  lastUpdated: string;
  defaultBranch: string;
  hasIssues: boolean;
  fullName: string;
}

async function fetchUser(): Promise<GitHubUser> {
  const response = await fetch("/api/github/me");
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

async function fetchRepos(): Promise<GitHubRepo[]> {
  const response = await fetch("/api/github/repos");
  if (!response.ok) {
    throw new Error("Failed to fetch repos");
  }
  return response.json();
}

function formatLastActive(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false,
  });

  const { data: repos = [], isLoading: reposLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
    retry: false,
  });

  useEffect(() => {
    if (userError) {
      toast({
        title: "Authentication required",
        description: "Please login to access the dashboard",
        variant: "destructive",
      });
      router.push("/auth/login");
    }
  }, [userError, router, toast]);

  // Transform repos to match RepoList component format
  const transformedRepos = repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description || "",
    visibility: repo.visibility,
    language: repo.language,
    lastUpdated: repo.lastUpdated,
    hasReadme: false,
    hasGitignore: false,
    hasLicense: false,
    activity: "active" as const,
    stars: 0,
    forks: 0,
    fullName: repo.fullName,
  }));

  if (userLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back, {user.login}. Manage your repositories and projects from
          one place.
        </p>
      </div>

      {/* Profile Summary & Quick Actions Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Summary Card */}
        <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Profile Summary</CardTitle>
            <CardDescription>Your GitHub profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-border/50">
                <AvatarImage src={user.avatar_url} alt={user.login} />
                <AvatarFallback className="text-2xl">
                  {user.login.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-xl">{user.login}</h3>
                {user.name && (
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                )}
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
                  <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                  {user.public_repos}
                </div>
                <div className="text-xs text-muted-foreground">Repos</div>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  {user.followers}
                </div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  {user.following}
                </div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Clock className="h-4 w-4" />
              <span>Last active: {formatLastActive(user.updated_at)}</span>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <a
                href={`https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start h-auto py-3" size="lg" asChild>
              <Link href="/dashboard/new-repo">
                <Plus className="h-5 w-5 mr-3" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Create New Repo</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Start a new repository
                  </span>
                </div>
              </Link>
            </Button>
            <Button
              className="w-full justify-start h-auto py-3"
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="/dashboard/drop2repo">
                <Upload className="h-5 w-5 mr-3" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Drop2Repo Uploader</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Upload project files
                  </span>
                </div>
              </Link>
            </Button>
            <Button
              className="w-full justify-start h-auto py-3"
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="/dashboard/readme-helper">
                <FileText className="h-5 w-5 mr-3" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Generate README</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Create documentation
                  </span>
                </div>
              </Link>
            </Button>
            <Button
              className="w-full justify-start h-auto py-3"
              size="lg"
              variant="outline"
              asChild
            >
              <a
                href={`https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-5 w-5 mr-3" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Open GitHub Profile</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    View on GitHub
                  </span>
                </div>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Learning Tips Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Learning Tips</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Best practices to improve your repository management
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <LearningTip
            title="Write small, focused commits"
            description="Break your changes into logical, atomic commits. Each commit should represent one complete thought or change."
            type="commits"
          />
          <LearningTip
            title="Always add a README"
            description="A good README helps others understand your project. Include setup instructions, usage examples, and project goals."
            type="readme"
          />
        </div>
      </div>

      {/* Repositories Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Repositories</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and monitor your GitHub repositories
          </p>
        </div>
        {reposLoading ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <RepoList repos={transformedRepos} />
        )}
      </div>
    </div>
  );
}
