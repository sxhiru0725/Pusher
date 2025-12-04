"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Briefcase, Save, Loader2, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface UserSettings {
  userId: number;
  defaultVisibility: "public" | "private";
  defaultGitignore: string;
  defaultBranch: string;
  commitStyle: "conventional" | "simple" | "custom";
  showTips: boolean;
  professionalMode: boolean;
}

async function fetchSettings(): Promise<UserSettings> {
  const response = await fetch("/api/settings");
  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }
  return response.json();
}

async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const response = await fetch("/api/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error("Failed to save settings");
  }
  return response.json();
}

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to save",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const [profileMode, setProfileMode] = useState<"student" | "professional">("student");
  const [defaultVisibility, setDefaultVisibility] = useState<"public" | "private">("public");
  const [defaultGitignore, setDefaultGitignore] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [commitMessageStyle, setCommitMessageStyle] = useState<
    "conventional" | "simple" | "custom"
  >("conventional");
  const [showLearningTips, setShowLearningTips] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    if (settings) {
      setProfileMode(settings.professionalMode ? "professional" : "student");
      setDefaultVisibility(settings.defaultVisibility);
      setDefaultGitignore(settings.defaultGitignore);
      setDefaultBranch(settings.defaultBranch);
      setCommitMessageStyle(settings.commitStyle);
      setShowLearningTips(settings.showTips);
      setShowAdvancedOptions(settings.professionalMode);
    }
  }, [settings]);

  const handleSave = () => {
    mutation.mutate({
      defaultVisibility,
      defaultGitignore,
      defaultBranch,
      commitStyle: commitMessageStyle,
      showTips: showLearningTips,
      professionalMode: profileMode === "professional",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Configure your preferences and default options
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Mode */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Profile Mode</CardTitle>
              <CardDescription>
                Choose your profile mode to customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                value={profileMode}
                onValueChange={(v) => setProfileMode(v as typeof profileMode)}
              >
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="student" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Professional
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="student" className="mt-4">
                  <div className="space-y-3 p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Student mode provides helpful learning tips, simplified workflows, and
                      educational guidance to help you learn best practices for Git and GitHub.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Learning tips and best practices</li>
                      <li>Simplified interface</li>
                      <li>Educational tooltips</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="professional" className="mt-4">
                  <div className="space-y-3 p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Professional mode provides advanced options, power-user features, and
                      streamlined workflows for experienced developers.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Advanced options by default</li>
                      <li>Power-user shortcuts</li>
                      <li>Streamlined workflows</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Defaults */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Default Settings</CardTitle>
              <CardDescription>
                Set default values for new repositories and commits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Default Visibility</Label>
                <Tabs
                  value={defaultVisibility}
                  onValueChange={(v) => setDefaultVisibility(v as typeof defaultVisibility)}
                >
                  <TabsList className="grid w-full grid-cols-2 rounded-xl">
                    <TabsTrigger value="public">Public</TabsTrigger>
                    <TabsTrigger value="private">Private</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-gitignore" className="text-sm font-semibold">
                  Default .gitignore Template
                </Label>
                <Select value={defaultGitignore} onValueChange={setDefaultGitignore}>
                  <SelectTrigger id="default-gitignore" className="rounded-xl">
                    <SelectValue placeholder="Select a default template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="node">Node</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-branch" className="text-sm font-semibold">
                  Default Branch Name
                </Label>
                <Input
                  id="default-branch"
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  placeholder="main"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commit-style" className="text-sm font-semibold">
                  Default Commit Message Style
                </Label>
                <Select
                  value={commitMessageStyle}
                  onValueChange={(v) => setCommitMessageStyle(v as typeof commitMessageStyle)}
                >
                  <SelectTrigger id="commit-style" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conventional">Conventional Commits</SelectItem>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* UI Preferences */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">UI Preferences</CardTitle>
              <CardDescription>Customize your interface experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                <div className="space-y-0.5">
                  <Label htmlFor="learning-tips" className="text-sm font-semibold cursor-pointer">
                    Show learning tips (student helpers)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display helpful tips and best practices throughout the interface
                  </p>
                </div>
                <Switch
                  id="learning-tips"
                  checked={showLearningTips}
                  onCheckedChange={setShowLearningTips}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                <div className="space-y-0.5">
                  <Label htmlFor="advanced-options" className="text-sm font-semibold cursor-pointer">
                    Show advanced options first (for professionals)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Prioritize advanced features and power-user options
                  </p>
                </div>
                <Switch
                  id="advanced-options"
                  checked={showAdvancedOptions}
                  onCheckedChange={setShowAdvancedOptions}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 pt-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            onClick={handleSave}
            className="w-full md:w-auto h-11 rounded-xl"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
