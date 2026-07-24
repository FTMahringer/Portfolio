# Portfolio

A modern personal portfolio and blog built with Next.js 16, MDX content, and a custom admin/content workflow.

The site is designed for recruiters, companies, and other developers to browse public work while also giving me a fast way to create and edit content from the browser.

## What’s in this project

### Public site
- Home page with featured projects, recent posts, and stats
- Projects section with detailed project pages
- Blog with MDX posts and related-post suggestions
- Experience timeline and detail pages
- About, contact, resume, uses, now, tags, testimonials, and other supporting pages
- Search, comments, SEO metadata, OpenGraph images, and JSON-LD

### Admin and content workflow
- `/admin` for authentication and admin tools
- `/content` for creating and editing content in one place
- `/content/media` for the reusable media library
- `/settings` for site settings and admin utilities
- Markdown + HTML preview with script content blocked
- Media uploads converted to WebP
- Project slugs are UUID-based and managed automatically
- Blog and experience slugs remain editable

### Content model
- Projects: `content/projects/*.mdx`
- Blog posts: `content/blog/*.mdx`
- Experience entries: `content/experience/*.mdx`
- General pages: `content/pages/*.mdx`
- Media uploads: `public/uploads/`
- Project images: `public/images/projects/`

## Tech stack

- **Framework:** Next.js 16 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Content:** MDX, `gray-matter`, `next-mdx-remote`
- **Database:** SQLite with Drizzle ORM

- **Authentication:** Argon2 + session cookies, with optional OIDC/SSO
- **Search:** Fuse.js
- **Media processing:** Sharp
- **Comments:** Giscus
- **Forms / email:** Resend

## Getting started

### Requirements
- Node.js 24 or newer
- npm

### Install

```bash
git clone https://github.com/FTMahringer/Portfolio.git
cd Portfolio
npm install
```

### Configure environment

Create a local `.env` file from your example file and fill in the values you need:

```bash
cp .env.example .env
```

At minimum, set the admin credentials and API secret.

### Initialize the database

```bash
npm run db:push
npm run db:seed
```

### Start the dev server

```bash
npm run dev
```

Open:
- Public site: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`
- Content manager: `http://localhost:3000/content`

## Editing content

### Creating and editing
- Use `/content/new/[type]` to create new content
- Use `/content/edit/[type]/[slug]` to edit existing entries
- Use the preview/write toggle to switch between source and rendered view

### Projects
- Project slugs are UUIDs and hidden in the editor UI
- Change the project title as needed; the slug stays managed automatically
- Inline images used in the MDX content are tracked for the project page gallery
- Cover images are handled separately from inline content images

### Blog and experience
- Blog and experience entries keep editable slugs
- Heading anchors are generated automatically for MDX content
- Related content and tags are handled through frontmatter

### Media library
- Upload images through the media picker or `/content/media`
- Uploaded images are stored in `public/uploads/`
- Images are converted to WebP on upload

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run validate:content
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
npm run db:seed
```

### Script notes
- `npm run validate:content` checks content files and frontmatter
- `npm run db:seed` seeds the default admin user from environment variables
- `npm run db:push` is the easiest way to initialize a fresh local database

## Environment variables

### Required

| Variable | Description |
| --- | --- |
| `ADMIN_EMAIL` | Default admin email address |
| `ADMIN_PASSWORD` | Default admin password |
| `API_SECRET` | Secret used by admin/content API routes |

### Common optional variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | SQLite database path |
| `NEXT_PUBLIC_BASE_URL` | Public site URL for canonical links and social metadata |
| `RESEND_API_KEY` | Enables email submissions |
| `CONTACT_EMAIL` | Destination inbox for contact form submissions |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami analytics website ID |
| `NEXT_PUBLIC_UMAMI_URL` | Umami analytics server URL |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain |
| `OIDC_ISSUER` | OIDC issuer URL for SSO fallback |
| `OIDC_CLIENT
_ID` | OIDC client ID fallback |
| `OIDC_CLIENT_SECRET` | OIDC client secret fallback |

## Troubleshooting

### Admin login does not work
- Make sure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set before seeding
- Run `npm run db:seed` again after changing those values

### Content changes do not show up
- Check that the content file is in the correct folder
- Re-run `npm run validate:content`
- Restart the dev server if needed

### Database errors
- Use `npm run db:studio` to inspect the SQLite database
- For a clean local reset, delete the database file and run `npm run db:push` + `npm run db:seed` again

## Contributing

This repository is actively evolving as the portfolio and admin workflow grow.

If you add new content features, remember to update the relevant docs and content validation rules so the editor and public site stay in sync.

## License

MIT — see [LICENSE](LICENSE).
