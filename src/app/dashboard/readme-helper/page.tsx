"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReadmeHelperPage() {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [techStack, setTechStack] = useState("");
  const [usage, setUsage] = useState("");
  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    const featuresList = features
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => `- ${line.trim()}`)
      .join("\n");

    const techList = techStack
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech)
      .map((tech) => `- ${tech}`)
      .join("\n");

    return `# ${projectName || "Project Name"}

${description || "A brief description of your project."}

## Features

${featuresList || "- Feature 1\n- Feature 2\n- Feature 3"}

## Tech Stack

${techList || "- Technology 1\n- Technology 2"}

## Usage

${usage || "How to use your project..."}

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/${projectName.toLowerCase().replace(/\s+/g, "-") || "project-name"}.git

# Install dependencies
npm install

# Run the project
npm start
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
`;
  };

  const handleCopy = async () => {
    const markdown = generateMarkdown();
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "README markdown copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "README.md file downloaded successfully",
    });
  };

  const markdown = generateMarkdown();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">README Helper</h1>
        <p className="text-muted-foreground text-lg">
          Generate a professional README.md for your project with live preview
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Information
              </CardTitle>
              <CardDescription>Fill in the details about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-sm font-semibold">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Short Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of what your project does"
                  rows={3}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features" className="text-sm font-semibold">
                  Features
                </Label>
                <Textarea
                  id="features"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Enter each feature on a new line"
                  rows={5}
                  className="rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter each feature on a separate line
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tech-stack" className="text-sm font-semibold">
                  Tech Stack
                </Label>
                <Input
                  id="tech-stack"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="React, TypeScript, Tailwind CSS"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of technologies
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage" className="text-sm font-semibold">
                  Usage Notes
                </Label>
                <Textarea
                  id="usage"
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                  placeholder="How to use your project..."
                  rows={4}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-4">
            <Button onClick={handleCopy} className="flex-1 h-11 rounded-xl" size="lg">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Markdown
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="h-11 rounded-xl"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Live Preview</CardTitle>
              <CardDescription>Preview your README.md markdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl p-6 bg-muted/30 min-h-[600px] max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
                  {markdown || (
                    <span className="text-muted-foreground italic">
                      Fill in the form to see a live preview
                    </span>
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
