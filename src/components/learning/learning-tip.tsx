import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningTipProps {
  title: string;
  description: string;
  type: "git" | "readme" | "commits" | "general";
  className?: string;
}

const typeColors = {
  git: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  readme: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  commits: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  general: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export function LearningTip({ title, description, type, className }: LearningTipProps) {
  return (
    <Card className={cn("rounded-2xl shadow-sm border-l-4 border-l-primary", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{title}</h4>
              <Badge variant="outline" className={typeColors[type]}>
                {type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

