import { readFile, writeFile } from "node:fs/promises";

const USERNAME = "wildanniam";
const README_PATH = new URL("../README.md", import.meta.url);
const START = "<!-- AUTO:ACTIVITY:START -->";
const END = "<!-- AUTO:ACTIVITY:END -->";

const dryRun = process.argv.includes("--dry-run");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const headers = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "wildanniam-profile-readme"
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function eventToLine(event) {
  const repo = event.repo?.name;
  if (!repo) return null;

  const date = formatDate(event.created_at);
  const repoLink = `https://github.com/${repo}`;

  switch (event.type) {
    case "PushEvent": {
      const commits = event.payload?.commits?.length || 1;
      const label = commits === 1 ? "commit" : "commits";
      return `- ${date}: pushed ${commits} ${label} to [${repo}](${repoLink}).`;
    }
    case "CreateEvent": {
      const refType = event.payload?.ref_type || "resource";
      return `- ${date}: created a ${refType} in [${repo}](${repoLink}).`;
    }
    case "PullRequestEvent": {
      const action = event.payload?.action || "updated";
      const number = event.payload?.pull_request?.number;
      const prUrl = event.payload?.pull_request?.html_url || (number ? `${repoLink}/pull/${number}` : repoLink);
      const suffix = number ? ` [#${number}](${prUrl})` : "";
      return `- ${date}: ${action} pull request${suffix} in [${repo}](${repoLink}).`;
    }
    case "IssuesEvent": {
      const action = event.payload?.action || "updated";
      const number = event.payload?.issue?.number;
      const issueUrl = event.payload?.issue?.html_url || repoLink;
      const suffix = number ? ` [#${number}](${issueUrl})` : "";
      return `- ${date}: ${action} issue${suffix} in [${repo}](${repoLink}).`;
    }
    default:
      return null;
  }
}

async function fetchRecentActivity() {
  const response = await fetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=40`, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status} ${response.statusText}`);
  }

  const events = await response.json();
  const lines = events
    .map(eventToLine)
    .filter(Boolean)
    .filter((line, index, all) => all.indexOf(line) === index)
    .slice(0, 6);

  if (!lines.length) {
    return "_No recent public activity was found._";
  }

  return lines.join("\n");
}

function replaceGeneratedBlock(readme, nextContent) {
  const startIndex = readme.indexOf(START);
  const endIndex = readme.indexOf(END);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error("README activity markers are missing or malformed.");
  }

  return [
    readme.slice(0, startIndex + START.length),
    "\n",
    nextContent,
    "\n",
    readme.slice(endIndex)
  ].join("");
}

const readme = await readFile(README_PATH, "utf8");
const activity = await fetchRecentActivity();
const nextReadme = replaceGeneratedBlock(readme, activity);

if (dryRun) {
  console.log(activity);
  console.log("\nDry run complete. README.md was not modified.");
} else {
  await writeFile(README_PATH, nextReadme);
  console.log("README.md activity block updated.");
}
