import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const filePath = path.join(process.cwd(), "content", "pages", "homelab.mdx");
let pageData = { title: "Homelab", description: "Homelab content coming soon." };

if (fs.existsSync(filePath)) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const frontmatter = matter(raw).data;
  pageData = {
    title: frontmatter.title || pageData.title,
    description: frontmatter.summary || pageData.description,
  };
}

export const metadata: Metadata = {
  title: pageData.title,
  description: pageData.description,
};

export default async function HomelabPage() {
  const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
  const { content } = matter(raw);
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold mb-3 text-[var(--foreground)]">{pageData.title}</h1>
      <hr className="border-[var(--border)] mb-6" />
      {content ? (
        <article className="prose-content">
          <MDXRemote source={content} components={mdxComponents} />
        </article>
      ) : (
        <p className="text-[var(--muted)]">Homelab content coming soon.</p>
      )}
    </main>
  );
}
