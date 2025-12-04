"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { RepoHealthBadge } from "./repo-health-badge";
import { ExternalLink, Activity, Search, FolderX, Plus } from "lucide-react";
import type { Repo } from "@/data/mockRepos";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface RepoListProps {
  repos: Repo[];
}

interface RepoHealth {
  hasReadme: boolean;
  hasGitignore: boolean;
  hasLicense: boolean;
  lastCommitDate: string | null;
  activity: "active" | "stale";
}

async function fetchRepoHealth(owner: string, repo: string): Promise<RepoHealth> {
  const response = await fetch(`/api/github/repo-health?owner=${owner}&repo=${repo}`);
  if (!response.ok) {
    throw new Error("Failed to fetch repo health");
  }
  return response.json();
}

export function RepoList({ repos }: RepoListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; repo: string } | null>(null);

  const languages = Array.from(new Set(repos.map((repo) => repo.language).filter(Boolean)));

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = visibilityFilter === "all" || repo.visibility === visibilityFilter;
    const matchesLanguage = languageFilter === "all" || repo.language === languageFilter;
    return matchesSearch && matchesVisibility && matchesLanguage;
  });

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ["repo-health", selectedRepo?.owner, selectedRepo?.repo],
    queryFn: () =>
      selectedRepo ? fetchRepoHealth(selectedRepo.owner, selectedRepo.repo) : null,
    enabled: !!selectedRepo,
  });

  const handleAction = (action: string, repoName: string, fullName?: string) => {
    if (action === "health" && fullName) {
      const [owner, repo] = fullName.split("/");
      setSelectedRepo({ owner, repo });
    } else if (action === "open" && fullName) {
      window.open(`https://github.com/${fullName}`, "_blank");
    } else {
      console.log(`${action} clicked for ${repoName}`);
    }
  };

  const getFullName = (repo: Repo): string | undefined => {
    return (repo as unknown as { fullName?: string }).fullName;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredRepos.length === 0 ? (
          <Card className="rounded-2xl border-border/50">
            <CardContent className="p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FolderX className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No repositories found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery || visibilityFilter !== "all" || languageFilter !== "all"
                    ? "Try adjusting your filters to see more repositories"
                    : "You don't have any repositories yet. Create one to get started!"}
                </p>
              </div>
              {!searchQuery && visibilityFilter === "all" && languageFilter === "all" && (
                <Button asChild className="mt-4">
                  <Link href="/dashboard/new-repo">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Repository
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Visibility</TableHead>
                    <TableHead className="font-semibold">Language</TableHead>
                    <TableHead className="font-semibold">Health</TableHead>
                    <TableHead className="font-semibold">Last Updated</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRepos.map((repo) => {
                    const fullName = getFullName(repo);
                    return (
                      <TableRow
                        key={repo.id}
                        className="border-border/50 hover:bg-accent/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{repo.name}</div>
                            {repo.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {repo.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={repo.visibility === "public" ? "default" : "secondary"}
                            className="rounded-lg"
                          >
                            {repo.visibility}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {repo.language ? (
                            <Badge variant="outline" className="rounded-lg">
                              {repo.language}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <RepoHealthBadge
                            hasReadme={repo.hasReadme}
                            hasGitignore={repo.hasGitignore}
                            hasLicense={repo.hasLicense}
                            activity={repo.activity}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {repo.lastUpdated}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction("open", repo.name, fullName)}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction("health", repo.name, fullName)}
                              className="h-8 w-8 p-0"
                            >
                              <Activity className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Health Dialog */}
      <Dialog open={!!selectedRepo} onOpenChange={(open) => !open && setSelectedRepo(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Repository Health: {selectedRepo?.owner}/{selectedRepo?.repo}
            </DialogTitle>
            <DialogDescription>Detailed health metrics for this repository</DialogDescription>
          </DialogHeader>
          {healthLoading ? (
            <div className="py-8 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : healthData ? (
            <div className="space-y-4 py-4">
              <RepoHealthBadge
                hasReadme={healthData.hasReadme}
                hasGitignore={healthData.hasGitignore}
                hasLicense={healthData.hasLicense}
                activity={healthData.activity}
              />
              {healthData.lastCommitDate && (
                <div className="text-sm text-muted-foreground">
                  Last commit: {new Date(healthData.lastCommitDate).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load health data
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
