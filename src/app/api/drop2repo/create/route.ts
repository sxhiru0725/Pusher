import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAccessToken } from "@/lib/auth";
import { createGitHubRepo, createOrUpdateFile } from "@/lib/github";

interface CreateRepoRequest {
  repoName: string;
  description: string;
  visibility: "public" | "private";
  gitignoreTemplate?: string;
  licenseTemplate?: string;
  branch: string;
  commitMessage: string;
  files: Array<{
    path: string;
    contentBase64: string;
  }>;
  autoGenerateReadme?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "No access token" }, { status: 401 });
    }

    const body: CreateRepoRequest = await request.json();

    // Validate required fields
    if (!body.repoName || !body.branch || !body.commitMessage) {
      return NextResponse.json(
        { error: "Missing required fields: repoName, branch, commitMessage" },
        { status: 400 }
      );
    }

    // Create GitHub repository
    const repo = await createGitHubRepo(
      accessToken,
      body.repoName,
      body.description || "",
      body.visibility === "private"
    );

    const owner = user.login;
    const repoName = repo.name;

    // Create files
    const fileResults: Array<{ path: string; success: boolean; error?: string }> = [];

    for (const file of body.files) {
      try {
        // Decode base64 content
        const content = Buffer.from(file.contentBase64, "base64").toString("utf-8");

        await createOrUpdateFile(
          accessToken,
          owner,
          repoName,
          file.path,
          content,
          file.path === "README.md" ? "docs: add README" : body.commitMessage,
          body.branch
        );

        fileResults.push({ path: file.path, success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error creating file ${file.path}:`, errorMessage);
        fileResults.push({ path: file.path, success: false, error: errorMessage });
      }
    }

    // Create .gitignore if template provided
    if (body.gitignoreTemplate) {
      try {
        // In a real implementation, you would fetch the template from a source
        // For now, we'll create a basic .gitignore
        const gitignoreContent = getGitignoreTemplate(body.gitignoreTemplate);
        await createOrUpdateFile(
          accessToken,
          owner,
          repoName,
          ".gitignore",
          gitignoreContent,
          "chore: add .gitignore",
          body.branch
        );
        fileResults.push({ path: ".gitignore", success: true });
      } catch (error) {
        console.error("Error creating .gitignore:", error);
        fileResults.push({
          path: ".gitignore",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Create LICENSE if template provided
    if (body.licenseTemplate && body.licenseTemplate !== "none") {
      try {
        const licenseContent = getLicenseTemplate(body.licenseTemplate);
        await createOrUpdateFile(
          accessToken,
          owner,
          repoName,
          "LICENSE",
          licenseContent,
          "docs: add LICENSE",
          body.branch
        );
        fileResults.push({ path: "LICENSE", success: true });
      } catch (error) {
        console.error("Error creating LICENSE:", error);
        fileResults.push({
          path: "LICENSE",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Create README if auto-generate is enabled
    if (body.autoGenerateReadme) {
      try {
        const readmeContent = `# ${body.repoName}\n\n${body.description || "A new project"}\n`;
        await createOrUpdateFile(
          accessToken,
          owner,
          repoName,
          "README.md",
          readmeContent,
          "docs: add README",
          body.branch
        );
        fileResults.push({ path: "README.md", success: true });
      } catch (error) {
        console.error("Error creating README:", error);
        fileResults.push({
          path: "README.md",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = fileResults.filter((r) => r.success).length;
    const totalSize = body.files.reduce((sum, file) => {
      try {
        return sum + Buffer.from(file.contentBase64, "base64").length;
      } catch {
        return sum;
      }
    }, 0);

    // In a real implementation, you would save this to a database
    // For now, we'll just return the summary
    const importSummary = {
      id: `import-${Date.now()}`,
      userId: user.id,
      repoName: repo.full_name,
      createdAt: new Date().toISOString(),
      fileCount: successCount,
      totalSizeBytes: totalSize,
      status: successCount > 0 ? "success" : "failed",
      fileResults,
    };

    return NextResponse.json({
      success: true,
      repo: {
        name: repo.name,
        fullName: repo.full_name,
        url: `https://github.com/${owner}/${repoName}`,
      },
      importSummary,
    });
  } catch (error) {
    console.error("Error creating repository:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: "Failed to create repository",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function getGitignoreTemplate(template: string): string {
  const templates: Record<string, string> = {
    node: `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`,
    python: `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Virtual environments
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp

# Distribution / packaging
dist/
build/
*.egg-info/
`,
    java: `# Compiled class files
*.class

# Log files
*.log

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# IDE
.idea/
*.iml
*.iws
*.ipr
.vscode/
`,
    go: `# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary
*.test

# Output
*.out

# Go workspace file
go.work
`,
    rust: `# Debug
target/
Cargo.lock

# IDE
.vscode/
.idea/
*.swp
`,
  };

  return templates[template] || "";
}

function getLicenseTemplate(template: string): string {
  const templates: Record<string, string> = {
    MIT: `MIT License

Copyright (c) ${new Date().getFullYear()}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
    "Apache-2.0": `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright ${new Date().getFullYear()}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
`,
    "GPL-3.0": `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${new Date().getFullYear()}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
`,
  };

  return templates[template] || "";
}

