import { revalidatePath } from "next/cache";
import { handleApiError } from "@/lib/api";
import { deleteComment } from "@/lib/services/comments";
import { requireApiUser } from "@/lib/session";

// DELETE /api/comments/:id — comment author only
export async function DELETE(_request: Request, { params }: RouteContext<"/api/comments/[id]">) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const { postSlug } = await deleteComment(user.id, id);
    if (postSlug) revalidatePath(`/blogs/${postSlug}`);

    return Response.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
