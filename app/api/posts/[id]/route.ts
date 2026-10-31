import { handleApiError, jsonError, readJson } from "@/lib/api";
import { revalidatePostPages } from "@/lib/revalidate";
import { deletePost, getPostForViewer, updatePost } from "@/lib/services/posts";
import { getCurrentUser, requireApiUser } from "@/lib/session";
import { postUpdateSchema } from "@/schemas/post";

// GET /api/posts/:id
export async function GET(_request: Request, { params }: RouteContext<"/api/posts/[id]">) {
  try {
    const { id } = await params;
    const viewer = await getCurrentUser();
    const post = await getPostForViewer(id, viewer?.id);
    if (!post) return jsonError(404, "Post not found");
    return Response.json({ post });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/posts/:id — owner only
export async function PATCH(request: Request, { params }: RouteContext<"/api/posts/[id]">) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const input = postUpdateSchema.parse(await readJson(request));

    const post = await updatePost(user.id, id, input);
    revalidatePostPages(post);

    return Response.json({ post: { id: post.id, slug: post.slug, status: post.status } });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/posts/:id — owner only
export async function DELETE(_request: Request, { params }: RouteContext<"/api/posts/[id]">) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const post = await deletePost(user.id, id);
    revalidatePostPages(post);

    return Response.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
