import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRepoPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Create New Repository</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Create a new GitHub repository from scratch
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">New Repository</CardTitle>
          <CardDescription className="text-base">
            This feature is coming soon. Use the Drop2Repo Uploader to create repositories with
            files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            In the future, you&apos;ll be able to create empty repositories directly from here.
            For now, use Drop2Repo to upload your project files and create a repository.
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/drop2repo">
              <Plus className="h-4 w-4 mr-2" />
              Go to Drop2Repo Uploader
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
