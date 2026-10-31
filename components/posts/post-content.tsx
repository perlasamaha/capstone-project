import Markdown, { type Components } from "react-markdown";

// Rendered on the server: the markdown parser never ships to the browser.
// react-markdown doesn't render raw HTML and strips javascript: links, so
// user-written content can't inject scripts.
const components: Components = {
  // The page already has an <h1> (the post title).
  h1: "h2",
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="nofollow ugc noopener noreferrer">
      {children}
    </a>
  ),
};

export function PostContent({ content }: { content: string }) {
  return (
    <div className="post-content">
      <Markdown components={components}>{content}</Markdown>
    </div>
  );
}
