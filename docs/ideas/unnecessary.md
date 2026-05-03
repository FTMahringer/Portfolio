# Probably Unnecessary

Features that are cool but likely overkill for a portfolio. Keeping for reference but marked as "don't implement unless there's a very good reason."

## 🚫 Too Complex for Portfolio

### Over-Engineering
- **Playwright E2E tests** ❌ REMOVED — Too much for a portfolio, manual testing is fine
- **RSS feed** ❌ REMOVED — Nobody uses RSS for personal portfolios anymore
- **Storybook** — Component library docs are overkill for a personal site
- **Lighthouse CI** — Automated perf checks on every PR is corporate-level tooling
- **API client generator** — Why would a portfolio need a TypeScript SDK?
- **Dependency update bot** — Manual updates are fine for personal projects
- **Visual regression testing** — Way too enterprise

### Privacy/Analytics Overkill
- **Heatmaps** — Session replay feels creepy for a personal portfolio
- **Reading analytics dashboard** — Full admin analytics is too much
- **Self-hosted session replay** — PostHog/Highlight for a portfolio? No.

### Content Complexity
- **Content scheduling** — Just publish when ready, this isn't a newsroom
- **Estimated reading difficulty** — Flesch-Kincaid scores are academic
- **Content lint rules** — Custom ESLint for MDX is excessive
- **Multi-language i18n** — Unless you actually need German/English, don't bother

### Infrastructure Overkill
- **Service worker** — Offline blog reading? Really?
- **Lazy hydration** — Premature optimization
- **Edge functions** — Personal portfolio doesn't need global edge deployment
- **Database backup to S3** — It's SQLite, just commit it or use local backups
- **Image CDN (Cloudflare R2)** — Next.js Image optimization is enough

### Experimental/Gimmicky
- **AI chat assistant** — GPT-powered chat about blog posts? Gimmick.
- **Voice navigation** — Nobody will use this
- **AR business card** — WebXR for a portfolio? Come on.
- **Blockchain verification** — Crypto wallet signatures for blog posts? No.
- **Decentralized hosting** — IPFS mirror is unnecessary complexity
- **WebGPU experiments** — Cool tech demo, not a portfolio feature
- **Web3 guestbook** — Wallet signatures? Hard pass.

### Over-Engagement
- **Live chat** — WebSocket chat for visitors? Why?
- **Push notifications** — Annoying for readers
- **Quiz/poll system** — Not a learning platform
- **Code challenges** — Not LeetCode

### Professional Overkill
- **Component playground** — This isn't a component library
- **3D elements** — Three.js background? Distracting
- **Confetti animations** — Celebrating 100th visitor? Tacky.

### SEO Spam
- **Auto-submit to Hacker News** — Manual curation or it's spam
- **Twitter/Bluesky auto-post** — Auto-posting feels robotic
- **HowTo schema for every guide** — SEO gaming

### Mobile Gimmicks
- **Haptic feedback** — Vibrating on button clicks? Annoying.
- **App shortcuts** — PWA shortcuts for a portfolio? Overkill.

## ⚠️ Keep But Don't Prioritize

These might have niche use cases but are very low priority:

- **GitHub repo auto-import** — Could be useful but adds complexity
- **Deploy webhook notifications** — Discord notifications for deploys? Maybe for fun.
- **Webhook integrations** — Unless you have specific automation needs
- **Data export** — GDPR compliance if you collect user data, otherwise unnecessary
- **Project showcase carousel** — Auto-play carousels are UX anti-patterns
