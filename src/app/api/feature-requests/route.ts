import { NextRequest, NextResponse } from "next/server";

const GITHUB_OWNER = "nss-ark";
const GITHUB_REPO = "intent-app";

export async function POST(request: NextRequest) {
  try {
    const { title, description, category } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Title is required" } },
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json(
        { success: false, error: { code: "CONFIG", message: "GitHub integration not configured" } },
        { status: 500 }
      );
    }

    const labels = ["feature-request"];
    if (category) labels.push(category);

    const body = [
      `## Feature Request`,
      ``,
      `**Category:** ${category || "General"}`,
      ``,
      `### Description`,
      description?.trim() || "_No description provided._",
      ``,
      `---`,
      `_Submitted via Intent app feedback_`,
    ].join("\n");

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: `[Feature Request] ${title.trim()}`, body, labels }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[feature-request] GitHub API error:", response.status, errorData);
      return NextResponse.json(
        { success: false, error: { code: "GITHUB_ERROR", message: "Failed to create issue on GitHub" } },
        { status: 502 }
      );
    }

    const issue = await response.json();

    return NextResponse.json({
      success: true,
      data: { issueNumber: issue.number, url: issue.html_url },
    });
  } catch (err) {
    console.error("[feature-request] Error:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
