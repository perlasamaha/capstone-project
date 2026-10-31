import "server-only";
import { revalidatePath } from "next/cache";
import type { PostChange } from "@/lib/services/posts";

/**
 * Explore, blog, community and profile pages are cached (ISR). After a write
 * we mark the pages that show this post as stale, so the next visitor gets a
 * fresh render instead of waiting for the time-based revalidate.
 */
export function revalidatePostPages(change: PostChange) {
  revalidatePath("/");
  revalidatePath(`/blogs/${change.slug}`);
  for (const slug of change.communitySlugs) {
    revalidatePath(`/communities/${slug}`);
  }
  if (change.authorUsername) {
    revalidatePath(`/profile/${change.authorUsername}`);
  }
}
