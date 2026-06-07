interface GitHubRepoContent {
  readme?: string;
  packageJson?: string;
  fileTree?: string;
}

export async function fetchGitHubRepoContent(
  owner: string,
  repo: string,
  githubToken?: string
): Promise<GitHubRepoContent> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`;
  }

  const result: GitHubRepoContent = {};

  try {
    // Check if repository exists and is accessible
    const repoRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (repoRes.status === 404) {
      throw new Error('Repository not found or private');
    }

    if (repoRes.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your environment variables.');
    }

    if (!repoRes.ok) {
      throw new Error(`GitHub API error: ${repoRes.statusText}`);
    }

    // Fetch README
    const readmeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers }
    );

    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      // README content is base64 encoded
      const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
      result.readme = readmeContent;
    }

    // Fetch package.json if it exists (for Node.js projects)
    const packageJsonRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      { headers }
    );

    if (packageJsonRes.ok) {
      const packageJsonData = await packageJsonRes.json();
      const packageJsonContent = Buffer.from(packageJsonData.content, 'base64').toString('utf-8');
      result.packageJson = packageJsonContent;
    }

    // Fetch file tree structure
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      { headers }
    );

    if (!treeRes.ok) {
      // Try master branch if main doesn't exist
      const masterTreeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        { headers }
      );

      if (masterTreeRes.ok) {
        const treeData = await masterTreeRes.json();
        result.fileTree = formatFileTree(treeData.tree);
      }
    } else {
      const treeData = await treeRes.json();
      result.fileTree = formatFileTree(treeData.tree);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Error fetching GitHub repo content:', error);
    throw new Error('Failed to fetch repository content from GitHub');
  }
}

function formatFileTree(tree: any[]): string {
  const files = tree.slice(0, 100); // Limit to first 100 files to avoid huge responses
  const structure = files
    .filter(item => item.type === 'blob')
    .map(item => item.path)
    .join('\n');

  return structure;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}
