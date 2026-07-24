# Implementation Plan - Curated Future Work

Implementation plan for the portfolio ideas that are worth pursuing after the current editor/content work.

## ✅ Completed

### Quick Wins
- [x] **Code block copy button** - Hover-to-show copy functionality
- [x] **Terminal-style code blocks** - macOS window chrome for project code
- [x] **Skill proficiency bars** - Visual 1-5 scale with animated gradients

## 🚧 In Progress

### Testimonials System
- [ ] MDX-based testimonials in `content/testimonials/`
- [ ] Testimonial card component with avatar, role, company
- [ ] Featured testimonials on homepage
- [ ] Full testimonials page `/testimonials`
- [ ] LinkedIn link integration

**Status**: Folder structure created, example template ready

## 📋 High Priority

### Portfolio Stats
- [ ] Count total projects, blog posts, and years of experience
- [ ] Display prominently on the homepage hero
- [ ] Animated counter components
- [ ] Real-time calculation from content

### Timeline View
- [ ] Visual timeline component
- [ ] Combine experience + projects by date
- [ ] Interactive filtering for timeline entries
- [ ] Placement decision: homepage section or `/timeline` page

### Related Posts
- [ ] Tag-based similarity algorithm
- [ ] Display 2-3 related posts at the end of blog posts
- [ ] Fallback to recent posts when no strong matches exist

### Education Section
- [ ] Add `content/education/` folder
- [ ] Education MDX schema with school, degree, dates, and description
- [ ] Surface education data on the resume page
- [ ] Reuse education data for resume generation

### Automated PDF Resume Generation
- [ ] Generate a resume PDF from existing content sources
- [ ] Pull data from experience, education, skills, and bio/avatar metadata
- [ ] Add a download action on the resume page
- [ ] Keep the output maintainable with a reusable template
- [ ] Start with `@react-pdf/renderer` unless a better fit emerges

## 📌 Medium Priority

### Series Support for Blog
- [ ] Add `series` and `seriesOrder` to blog frontmatter
- [ ] Series navigation component for previous/next posts
- [ ] Series overview page
- [ ] Series archive/listing

### GitHub Activity Widget
- [ ] Fetch recent commits or PRs via GitHub API
- [ ] Display on the homepage or about page
- [ ] Cache the response for a good UX
- [ ] Show a fallback state when the API is unavailable

### Content Discovery Extras
- [ ] Archives page for posts grouped by year/month
- [ ] Bookmarks collection for curated links
- [ ] Changelog page for visible portfolio updates
- [ ] Revision history hints based on content changes

### Light Image/Content Polish
- [ ] Progressive image loading placeholders
- [ ] Better image loading transitions for content-heavy pages

## 🔧 Low Priority

### Automation and Tooling
- [ ] GitHub repo auto-importer for project MDX generation
- [ ] Webhooks endpoint for external content creation
- [ ] Local git hooks for validation helpers

### Small Visibility Extras
- [ ] Search analytics for content discovery insights
- [ ] Simple view counter if it ever adds value

## 🎯 Suggested Order

1. Testimonials
2. Portfolio stats
3. Timeline view
4. Related posts
5. Education section
6. Automated PDF resume generation
7. Series support
8. GitHub activity widget
9. Content discovery extras
10. Low-priority automation helpers

## Notes

- Keep the portfolio focused on content, work samples, and credibility.
- Avoid over-engineering or features that only add maintenance burden.
- Anything that does not directly help visitors understand the work should stay out of the core plan.
- All new frontmatter fields should be documented in the validation script when added.
