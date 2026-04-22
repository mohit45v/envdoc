export const changelogData = [
  {
    version: '1.1.0',
    date: '2026-04-22',
    title: 'The Shared Brain Release 🧠',
    changes: [
      'Implemented MongoDB Atlas persistence for community-wide variable sharing.',
      'Added "Shared Brain Explorer" to browse and search learned variables.',
      'Implemented automatic retry logic for Gemini API rate limits (429 handling).',
      'Refactored documentation generation to group variables by categories.',
      'Optimized backend with bulk-write operations for high-concurrency documentation.',
      'Added live community stats counter to the homepage.'
    ]
  },
  {
    version: '1.0.4',
    date: '2026-04-21',
    title: 'Reliability & Fallbacks',
    changes: [
      'Integrated a local fallback dictionary for common environment variables.',
      'Improved model stability by migrating to Gemini 1.5 Flash.',
      'Enhanced Markdown rendering with better table formatting.',
      'Added Vercel Analytics for performance monitoring.'
    ]
  },
  {
    version: '1.0.3',
    date: '2026-04-21',
    title: 'The Hand-Drawn Migration',
    changes: [
      'Complete UI overhaul: Migrated from Neon Nebula to Hand-Drawn aesthetic.',
      'Implemented wobbly borders, paper textures, and hard-shadow tokens.',
      'Added interactive animations using Framer Motion.',
      'Redesigned the Interactive Playground with sticky note effects.'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-04-20',
    title: 'Initial Release',
    changes: [
      'Core CLI tool released to NPM.',
      'AI-powered .env variable description generation.',
      'Initial web playground launched for instant documentation previews.'
    ]
  }
];
