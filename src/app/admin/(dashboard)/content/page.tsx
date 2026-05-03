import { requireAdminSession } from "@/lib/session";
import { getAllProjects, getAllBlogPosts, getAllExperience } from "@/lib/mdx";
import Link from "next/link";

export default async function AdminContentPage() {
  await requireAdminSession();

  const [projects, posts, experience] = await Promise.all([
    getAllProjects(),
    getAllBlogPosts(),
    getAllExperience(),
  ]);

  type ContentRow = {
    type: string;
    title: string;
    slug: string;
    date: string;
    href: string;
  };

  const rows: ContentRow[] = [
    ...projects.map((p) => ({
      type: "project",
      title: p.frontmatter.title ?? p.slug,
      slug: p.slug,
      date: p.frontmatter.startDate ?? "",
      href: `/projects/${p.slug}`,
    })),
    ...posts.map((p) => ({
      type: "blog",
      title: p.frontmatter.title ?? p.slug,
      slug: p.slug,
      date: p.frontmatter.publishedAt ?? "",
      href: `/blog/${p.slug}`,
    })),
    ...experience.map((e) => ({
      type: "experience",
      title: e.frontmatter.title ?? e.slug,
      slug: e.slug,
      date: e.frontmatter.startDate ?? "",
      href: `/experience/${e.slug}`,
    })),
  ].sort((a, b) => (b.date > a.date ? 1 : -1));

  const typeColors: Record<string, string> = {
    project: "bg-blue-500/15 text-blue-400",
    blog: "bg-purple-500/15 text-purple-400",
    experience: "bg-green-500/15 text-green-400",
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm mb-2 block"
              style={{ color: "var(--muted)" }}
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
          </div>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            {rows.length} items
          </span>
        </div>

        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-left"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--card)",
                }}
              >
                <th
                  className="px-4 py-3 font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  Type
                </th>
                <th
                  className="px-4 py-3 font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  Title
                </th>
                <th
                  className="px-4 py-3 font-medium hidden sm:table-cell"
                  style={{ color: "var(--muted)" }}
                >
                  Slug
                </th>
                <th
                  className="px-4 py-3 font-medium hidden md:table-cell"
                  style={{ color: "var(--muted)" }}
                >
                  Date
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={`${row.type}-${row.slug}`}
                  className="border-b last:border-0 transition-colors hover:bg-[var(--card)]"
                  style={{
                    borderColor: "var(--border)",
                    background:
                      i % 2 === 0
                        ? "transparent"
                        : "var(--muted-bg, transparent)",
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[row.type] ?? ""}`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td
                    className="px-4 py-3 hidden sm:table-cell font-mono text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {row.slug}
                  </td>
                  <td
                    className="px-4 py-3 hidden md:table-cell"
                    style={{ color: "var(--muted)" }}
                  >
                    {row.date}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={row.href}
                      className="text-xs hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
