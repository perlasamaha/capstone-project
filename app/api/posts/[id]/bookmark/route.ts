import { handleApiError } from "@/lib/api";
import { addBookmark, isBookmarked, removeBookmark } from "@/lib/services/bookmarks";
import { requireApiUser } from "@/lib/session";

type Context = RouteContext<"/api/posts/[id]/bookmark">;

// GET /api/posts/:id/bookmark — has the current user bookmarked this post?
export async function GET(_request: Request, { params }: Context) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    return Response.json({ bookmarked: await isBookmarked(user.id, id) });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/posts/:id/bookmark — 201 when created, 200 if it already existed
export async function POST(_request: Request, { params }: Context) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const { created } = await addBookmark(user.id, id);
    return Response.json({ bookmarked: true }, { status: created ? 201 : 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/posts/:id/bookmark
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    await removeBookmark(user.id, id);
    return Response.json({ bookmarked: false });
  } catch (error) {
    return handleApiError(error);
  }
}
