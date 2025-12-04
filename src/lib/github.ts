
const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  updated_at: string;
  name: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  language: string | null;
  updated_at: string;
  default_branch: string;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  fork: boolean;
}

export interface RepoHealth {
  hasReadme: boolean;
  hasGitignore: boolean;
  hasLicense: boolean;
  lastCommitDate: string | null;
  activity: "active" | "stale";
}

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function fetchUserRepos(
  accessToken: string,
  page = 1,
  perPage = 30
): Promise<GitHubRepo[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/user/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function checkRepoHealth(
  accessToken: string,
  owner: string,
  repo: string
): Promise<RepoHealth> {
  const [readmeCheck, gitignoreCheck, licenseCheck, commits] = await Promise.allSettled([
    fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/README.md`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }),
    fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/.gitignore`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }),
    fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/LICENSE`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }),
    fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }),
  ]);

  const hasReadme = readmeCheck.status === "fulfilled" && readmeCheck.value.ok;
  const hasGitignore = gitignoreCheck.status === "fulfilled" && gitignoreCheck.value.ok;
  const hasLicense = licenseCheck.status === "fulfilled" && licenseCheck.value.ok;

  let lastCommitDate: string | null = null;
  if (commits.status === "fulfilled" && commits.value.ok) {
    const commitsData = await commits.value.json();
    if (commitsData.length > 0) {
      lastCommitDate = commitsData[0].commit.author.date;
    }
  }

  // Determine activity: active if last commit was within 30 days
  const activity: "active" | "stale" =
    lastCommitDate && new Date(lastCommitDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ? "active"
      : "stale";

  return {
    hasReadme,
    hasGitignore,
    hasLicense,
    lastCommitDate,
    activity,
  };
}

export async function createGitHubRepo(
  accessToken: string,
  name: string,
  description: string,
  privateRepo: boolean
): Promise<GitHubRepo> {
  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      private: privateRepo,
      auto_init: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function createOrUpdateFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string
): Promise<void> {
  // Encode content to base64
  const contentBase64 = Buffer.from(content).toString("base64");

  // Check if file exists to get SHA for update
  let sha: string | undefined;
  try {
    const getResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
      }
    } catch {
      // File doesn't exist, will create new
    }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch,
        ...(sha && { sha }), // Include SHA if updating existing file
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }
}

