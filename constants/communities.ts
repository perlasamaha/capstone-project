// Communities are curated by the platform (there's no "create community"
// feature), so they are defined here and written to the database by
// `npm run seed`. Topics are lowercase and dash-separated because they're used
// as-is in URLs like /blogs?topic=server-components.
export const seedCommunities = [
  {
    slug: "react",
    name: "React",
    description:
      "Components, hooks and patterns for building user interfaces with React.",
    topics: ["hooks", "components", "state-management", "performance", "testing"],
  },
  {
    slug: "nextjs",
    name: "Next.js",
    description:
      "The React framework for the web: routing, rendering, caching and deployment.",
    topics: ["app-router", "server-components", "rendering", "caching", "route-handlers"],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    description: "Types, generics and tooling for writing safer JavaScript.",
    topics: ["types", "generics", "tooling", "type-safety"],
  },
  {
    slug: "javascript",
    name: "JavaScript",
    description: "The language of the web, from the basics to the latest proposals.",
    topics: ["fundamentals", "async", "dom", "es-features"],
  },
  {
    slug: "nodejs",
    name: "Node.js",
    description: "Server-side JavaScript: APIs, streams, tooling and the npm ecosystem.",
    topics: ["apis", "express", "streams", "npm"],
  },
  {
    slug: "mongodb",
    name: "MongoDB",
    description: "Document modeling, queries, indexes and Mongoose.",
    topics: ["data-modeling", "indexes", "aggregation", "mongoose"],
  },
  {
    slug: "php",
    name: "PHP",
    description: "Modern PHP for the web, from language features to tooling.",
    topics: ["php8", "composer", "backend", "testing"],
  },
  {
    slug: "laravel",
    name: "Laravel",
    description: "The PHP framework with elegant syntax: Eloquent, queues, Blade and more.",
    topics: ["eloquent", "blade", "queues", "testing"],
  },
];
