"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Folder,
  File,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Loader2,
  Github,
  ArrowLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  size?: number;
  children?: FileNode[];
  selected: boolean;
}

export default function Drop2RepoPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [gitignore, setGitignore] = useState("");
  const [license, setLicense] = useState("");
  const [commitMessage, setCommitMessage] = useState("chore: initial project import");
  const [branchName, setBranchName] = useState("main");
  const [autoGenerateReadme, setAutoGenerateReadme] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        processFiles(Array.from(droppedFiles));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(Array.from(selectedFiles));
    }
  };

  const processFiles = (fileList: File[]) => {
    const fileTree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    fileList.forEach((file) => {
      const pathParts = file.webkitRelativePath.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const folderPath = pathParts.slice(0, -1).join("/");

      if (folderPath) {
        let currentPath = "";
        pathParts.slice(0, -1).forEach((part) => {
          const prevPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          if (!pathMap.has(currentPath)) {
            const folderNode: FileNode = {
              name: part,
              path: currentPath,
              type: "folder",
              children: [],
              selected: true,
            };
            pathMap.set(currentPath, folderNode);
            if (prevPath) {
              const parent = pathMap.get(prevPath);
              if (parent && parent.children) {
                parent.children.push(folderNode);
              }
            } else {
              fileTree.push(folderNode);
            }
          }
        });

        const folder = pathMap.get(folderPath);
        if (folder && folder.children) {
          folder.children.push({
            name: fileName,
            path: file.webkitRelativePath,
            type: "file",
            size: file.size,
            selected: true,
          });
        }
      } else {
        fileTree.push({
          name: fileName,
          path: fileName,
          type: "file",
          size: file.size,
          selected: true,
        });
      }
    });

    setFiles(fileTree);
    if (!repoName && fileList.length > 0) {
      const firstFile = fileList[0];
      const suggestedName = firstFile.webkitRelativePath.split("/")[0] || "my-project";
      setRepoName(suggestedName);
    }

    toast({
      title: "Files loaded",
      description: `Loaded ${countSelectedFiles(fileTree)} files from your project`,
    });
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleSelect = (path: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === path) {
          const newSelected = !node.selected;
          const updateChildren = (children?: FileNode[]): FileNode[] | undefined => {
            if (!children) return undefined;
            return children.map((child) => ({ ...child, selected: newSelected }));
          };
          return { ...node, selected: newSelected, children: updateChildren(node.children) };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setFiles(updateNode(files));
  };

  const selectAll = () => {
    const updateAll = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => ({
        ...node,
        selected: true,
        children: node.children ? updateAll(node.children) : undefined,
      }));
    };
    setFiles(updateAll(files));
  };

  const deselectAll = () => {
    const updateAll = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => ({
        ...node,
        selected: false,
        children: node.children ? updateAll(node.children) : undefined,
      }));
    };
    setFiles(updateAll(files));
  };

  const countSelectedFiles = (nodes: FileNode[]): number => {
    let count = 0;
    nodes.forEach((node) => {
      if (node.type === "file" && node.selected) {
        count++;
      }
      if (node.children) {
        count += countSelectedFiles(node.children);
      }
    });
    return count;
  };

  const calculateTotalSize = (nodes: FileNode[]): number => {
    let size = 0;
    nodes.forEach((node) => {
      if (node.type === "file" && node.selected && node.size) {
        size += node.size;
      }
      if (node.children) {
        size += calculateTotalSize(node.children);
      }
    });
    return size;
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return (
      <div className="space-y-0.5">
        {nodes.map((node) => (
          <div key={node.path}>
            <div
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent/50 rounded-md cursor-pointer transition-colors"
              style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
            >
              <input
                type="checkbox"
                checked={node.selected}
                onChange={() => toggleSelect(node.path)}
                className="rounded border-border"
              />
              {node.type === "folder" ? (
                <>
                  <button
                    onClick={() => toggleFolder(node.path)}
                    className="p-0.5 hover:bg-accent rounded"
                  >
                    {expandedFolders.has(node.path) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <Folder className="h-4 w-4 text-blue-500" />
                </>
              ) : (
                <File className="h-4 w-4 text-muted-foreground ml-6" />
              )}
              <span className="text-sm flex-1 font-mono">{node.name}</span>
              {node.type === "file" && node.size && (
                <span className="text-xs text-muted-foreground">
                  {(node.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
            {node.type === "folder" &&
              expandedFolders.has(node.path) &&
              node.children &&
              renderFileTree(node.children, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  const handleUpload = async () => {
    if (!repoName.trim()) {
      toast({
        title: "Repository name required",
        description: "Please enter a repository name",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Creating repository...");

    try {
      // Create repository
      setUploadProgress(20);
      setUploadStatus("Creating repository...");

      // Simulate upload progress
      const totalFiles = countSelectedFiles(files);
      let uploaded = 0;

      const progressInterval = setInterval(() => {
        uploaded += Math.floor(Math.random() * 5) + 1;
        if (uploaded >= totalFiles) {
          uploaded = totalFiles;
          clearInterval(progressInterval);
          setUploadProgress(100);
          setUploadStatus("Finalizing commit...");
          setTimeout(() => {
            setIsUploading(false);
            setUploadComplete(true);
            setRepoUrl(`https://github.com/username/${repoName}`);
            toast({
              title: "Success!",
              description: "Repository created and files uploaded successfully",
            });
          }, 1000);
        } else {
          setUploadProgress(20 + (uploaded / totalFiles) * 70);
          setUploadStatus(`Uploading files... (${uploaded}/${totalFiles})`);
        }
      }, 200);
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const selectedCount = countSelectedFiles(files);
  const totalSize = calculateTotalSize(files);

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
            <h1 className="text-4xl font-bold tracking-tight">Drop2Repo</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Upload your project files and create a GitHub repository in one step
            </p>
          </div>
        </div>
      </div>

      {uploadComplete ? (
        <Card className="rounded-2xl border-green-500/50 shadow-lg">
          <CardContent className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Upload Complete!</h2>
              <p className="text-muted-foreground text-lg">
                Your repository has been created successfully.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted font-mono text-sm">
                <Github className="h-4 w-4" />
                {repoUrl}
              </div>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    View on GitHub
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Drag & Drop Area */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Project Files</CardTitle>
                <CardDescription>Select your project folder or files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/50 rounded-2xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all group"
                >
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <p className="font-semibold text-lg mb-2">
                    Drag & drop a project folder here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Or click to browse and select a folder
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    {...({ webkitdirectory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {files.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">File Tree</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAll}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-xl p-4 max-h-96 overflow-y-auto bg-muted/20">
                      {renderFileTree(files)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Repo Settings & Commit Panel */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Repository Settings</CardTitle>
                <CardDescription>Configure your new repository</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-name" className="text-sm font-semibold">
                    Repository Name
                  </Label>
                  <Input
                    id="repo-name"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-awesome-project"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short description of your project"
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Visibility</Label>
                  <Tabs
                    value={visibility}
                    onValueChange={(v) => setVisibility(v as typeof visibility)}
                  >
                    <TabsList className="grid w-full grid-cols-2 rounded-xl">
                      <TabsTrigger value="public">Public</TabsTrigger>
                      <TabsTrigger value="private">Private</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gitignore" className="text-sm font-semibold">
                    .gitignore Template
                  </Label>
                  <Select value={gitignore} onValueChange={setGitignore}>
                    <SelectTrigger id="gitignore" className="rounded-xl">
                      <SelectValue placeholder="Select a template" />
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
                  <Label htmlFor="license" className="text-sm font-semibold">
                    License
                  </Label>
                  <Select value={license} onValueChange={setLicense}>
                    <SelectTrigger id="license" className="rounded-xl">
                      <SelectValue placeholder="Select a license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="MIT">MIT</SelectItem>
                      <SelectItem value="Apache-2.0">Apache-2.0</SelectItem>
                      <SelectItem value="GPL-3.0">GPL-3.0</SelectItem>
                      <SelectItem value="BSD-3-Clause">BSD-3-Clause</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Commit Options</CardTitle>
                <CardDescription>Configure your initial commit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commit-message" className="text-sm font-semibold">
                    Commit Message
                  </Label>
                  <Input
                    id="commit-message"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-name" className="text-sm font-semibold">
                    Branch Name
                  </Label>
                  <Input
                    id="branch-name"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor="auto-readme" className="cursor-pointer text-sm font-semibold">
                    Auto-generate README from basic info
                  </Label>
                  <Switch
                    id="auto-readme"
                    checked={autoGenerateReadme}
                    onCheckedChange={setAutoGenerateReadme}
                  />
                </div>
                {selectedCount > 0 && (
                  <div className="pt-4 border-t space-y-1">
                    <p className="text-sm font-semibold">
                      {selectedCount} file{selectedCount !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total size: {(totalSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {isUploading && (
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{uploadStatus}</span>
                      <span className="text-muted-foreground">
                        {Math.round(uploadProgress || 0)}%
                      </span>
                    </div>
                    <Progress value={uploadProgress || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              size="lg"
              className="w-full h-12 text-base rounded-xl"
              onClick={handleUpload}
              disabled={files.length === 0 || !repoName || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Create GitHub Repo & Upload
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
