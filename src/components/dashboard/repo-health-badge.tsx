import { Check, X, FileText, Shield, Scale, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RepoHealthBadgeProps {
  hasReadme: boolean;
  hasGitignore: boolean;
  hasLicense: boolean;
  activity: "active" | "stale";
  className?: string;
}

export function RepoHealthBadge({
  hasReadme,
  hasGitignore,
  hasLicense,
  activity,
  className,
}: RepoHealthBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <div className="flex items-center gap-1">
        {hasReadme ? (
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <X className="h-3 w-3 text-red-600 dark:text-red-400" />
        )}
        <FileText className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">README</span>
      </div>
      <div className="flex items-center gap-1">
        {hasGitignore ? (
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <X className="h-3 w-3 text-red-600 dark:text-red-400" />
        )}
        <Shield className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">.gitignore</span>
      </div>
      <div className="flex items-center gap-1">
        {hasLicense ? (
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <X className="h-3 w-3 text-red-600 dark:text-red-400" />
        )}
        <Scale className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">License</span>
      </div>
      <Badge
        variant={activity === "active" ? "default" : "secondary"}
        className="text-xs"
      >
        <Activity className="h-3 w-3 mr-1" />
        {activity === "active" ? "Active" : "Stale"}
      </Badge>
    </div>
  );
}

