export interface Repo {
  id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  language: string;
  lastUpdated: string;
  hasReadme: boolean;
  hasGitignore: boolean;
  hasLicense: boolean;
  activity: "active" | "stale";
  stars: number;
  forks: number;
  fullName?: string;
}

export const mockRepos: Repo[] = [
  {
    id: "1",
    name: "awesome-project",
    description: "An awesome project showcasing modern web development",
    visibility: "public",
    language: "TypeScript",
    lastUpdated: "2024-01-15",
    hasReadme: true,
    hasGitignore: true,
    hasLicense: true,
    activity: "active",
    stars: 42,
    forks: 8,
  },
  {
    id: "2",
    name: "learning-react",
    description: "My journey learning React and Next.js",
    visibility: "public",
    language: "JavaScript",
    lastUpdated: "2024-01-10",
    hasReadme: true,
    hasGitignore: false,
    hasLicense: false,
    activity: "active",
    stars: 12,
    forks: 3,
  },
  {
    id: "3",
    name: "private-notes",
    description: "Personal notes and documentation",
    visibility: "private",
    language: "Markdown",
    lastUpdated: "2023-12-20",
    hasReadme: false,
    hasGitignore: true,
    hasLicense: false,
    activity: "stale",
    stars: 0,
    forks: 0,
  },
  {
    id: "4",
    name: "api-server",
    description: "RESTful API server built with Express",
    visibility: "public",
    language: "Node.js",
    lastUpdated: "2024-01-12",
    hasReadme: true,
    hasGitignore: true,
    hasLicense: true,
    activity: "active",
    stars: 28,
    forks: 5,
  },
  {
    id: "5",
    name: "data-analysis",
    description: "Python scripts for data analysis",
    visibility: "public",
    language: "Python",
    lastUpdated: "2024-01-08",
    hasReadme: true,
    hasGitignore: true,
    hasLicense: false,
    activity: "active",
    stars: 15,
    forks: 2,
  },
];

export const mockUserProfile = {
  username: "GitHub User",
  avatar: "",
  publicRepos: 12,
  followers: 45,
  following: 23,
  lastActive: "2 hours ago",
};

