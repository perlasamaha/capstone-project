import type { NextRequest } from "next/server";
import { handleApiError, readJson } from "@/lib/api";
import { revalidatePostPages } from "@/lib/revalidate";
import { createPost, listPublishedPosts } from "@/lib/services/posts";
import { requireApiUser } from "@/lib/session";
import { postInputSchema } from "@/schemas/post";
import { postQuerySchema } from "@/schemas/query";

// GET /api/posts?search=&community=&topic=&author=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const query = postQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return Response.json(await listPublishedPosts(query));
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/posts
export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = postInputSchema.parse(await readJson(request));

    // The author comes from the session. The schema rejects an `author`
    // field in the body, so it can't be spoofed.
    const post = await createPost(user.id, input);
    if (post.status === "published") revalidatePostPages(post);

    return Response.json(
      { post: { id: post.id, slug: post.slug, status: post.status } },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
