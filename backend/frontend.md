# Frontend Build Prompt (React + Tailwind)

Use the following prompt with your coding assistant to generate a complete frontend for this project.

---

Build a production-ready frontend for my project using React and Tailwind CSS.

Context:
- This product is a subscription-based golf + charity + draw gamification platform.
- It should feel premium, emotional, modern, and gamified.
- It must NOT look like a traditional golf site.
- Keep visuals clean and bold, with minimal shadows and strong typography.
- Prioritize mobile-first UX and smooth desktop behavior.

Tech requirements:
1. Framework and tooling:
- React with Vite
- Tailwind CSS
- React Router DOM
- Axios
- TanStack Query
- Zustand (or Context if truly needed)
- React Hook Form + Zod
- Framer Motion
- React Hot Toast (notifications)
- Lucide React icons
- clsx + tailwind-merge
- date-fns
- Recharts (dashboard charts)
- Lenis for smooth scrolling

2. Fonts and visual system:
- Use modern, non-default typography with Google Fonts.
- Primary font suggestion: Sora
- Secondary/accent suggestion: Space Grotesk
- Include fallback stack and optimize loading.
- Create a design token system with CSS variables for colors, spacing, radius, and shadows.

3. Design direction:
- Build a premium, modern gradient background theme inspired by golf + impact + gamification.
- Avoid cliché imagery as the core UI style.
- Use a calm but energetic palette (example: emerald greens, deep navy/charcoal, warm sand, subtle gold accent).
- Keep shadows minimal and soft.
- Use layered gradients and subtle noise/pattern sections.
- Include smooth scrolling and purposeful animations only where meaningful.

3.1 Best layout directions (choose one and apply consistently):
- Layout A: Story-first Editorial
  - Large narrative hero with charity impact stats above the fold.
  - Alternating content bands: impact, gameplay, rewards, social proof, CTA.
  - Asymmetric grid with strong type scale and generous white space.
  - Best for emotional brand storytelling and conversions.
- Layout B: Gamified Control Center
  - Dashboard-first interface with a persistent top nav and contextual side panel.
  - Card-based widgets for scores, draws, streaks, and contribution progress.
  - Quick actions row for add score, join draw, upload proof.
  - Best for retention and frequent user engagement.
- Layout C: Split Experience Hub
  - Left side: key narrative and impact content.
  - Right side: interactive modules (score form, live draw panel, winner feed).
  - Sticky panels on desktop and stacked interactive sections on mobile.
  - Best for balancing emotional storytelling with high utility.

3.2 Layout implementation rules:
- Use a 12-column desktop grid and 4-column mobile grid.
- Keep max content width around 1200 to 1320px with clear spacing rhythm.
- Use section-based vertical rhythm with visible hierarchy between hero, data, and actions.
- Keep one primary CTA per major section.
- Use minimal shadow, subtle borders, gradient overlays, and contrast-driven depth.
- Ensure all layouts gracefully collapse on mobile without losing CTA clarity.

4. UI quality requirements:
- Smooth page transitions
- Section reveal animations on scroll
- Interactive cards with subtle hover motion
- Accessible forms with clear validation and error states
- Loading, empty, and error states everywhere needed
- Toast notifications for success/failure actions
- Skeleton loaders for data-heavy views

5. App pages and core screens:
- Public:
  - Landing/Home
  - Charities list + charity detail
  - Pricing/Subscription plans (monthly/yearly)
  - Login and Signup
- Subscriber:
  - User dashboard
  - Score management (last 5 scores, add/edit/delete, no duplicate date)
  - Charity selection and contribution %
  - Draw participation and results
  - Winnings + proof upload status
- Admin:
  - Admin dashboard (stats)
  - Users management
  - Subscription management
  - Draw simulation + publish
  - Charity CRUD
  - Winners review and payout status
  - Broadcast notification UI

6. Backend integration:
- Use these API route groups:
  - /api/auth
  - /api/subscriptions
  - /api/scores
  - /api/charities
  - /api/draws
  - /api/winners
  - /api/dashboard
  - /api/donations
  - /api/admin
- Create a centralized API client with interceptors.
- Add auth token handling and protected routes.
- Add role-based route guards for admin.

7. State and architecture:
- Feature-based folder structure:
  - src/app
  - src/features/auth
  - src/features/dashboard
  - src/features/scores
  - src/features/draws
  - src/features/charities
  - src/features/winners
  - src/features/admin
  - src/components/ui
  - src/lib
- Use TanStack Query for server state.
- Keep local UI state minimal and predictable.

8. UX logic requirements:
- Score input must enforce integer 1 to 45.
- One score per date only.
- Show most recent scores first.
- Show subscription status clearly in dashboard.
- Draw cards should visualize tiers and payout states clearly.
- Winner proof upload flow should be obvious and frictionless.

9. Accessibility and performance:
- WCAG-friendly contrast and keyboard support.
- Respect reduced motion preference.
- Optimize images and avoid heavy runtime cost.
- Lazy-load route-level pages.

10. Deliverables:
- Fully functional frontend with clean code.
- Reusable component library for cards, forms, tables, modals, badges, stats blocks.
- Responsive design for mobile/tablet/desktop.
- Setup instructions in README.
- Environment setup for API base URL.

11. Add polishing:
- Create a premium hero section with strong CTA and charity impact messaging.
- Add a gamified progress ring/score confidence widget.
- Add refined micro-interactions to buttons, tabs, and cards.
- Keep interactions crisp, elegant, and not over-animated.

Implementation output expected:
- Full source code
- npm install commands
- run instructions
- clear component structure
- production-quality styling and interaction details

---

Optional enhancement prompt:
"After generating the base frontend, refactor all repeated styles into reusable primitives, enforce a strict design token system, and improve consistency of spacing, typography hierarchy, and animation timing across all pages."
