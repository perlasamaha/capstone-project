import { revalidatePath } from "next/cache";
import { handleApiError, readJson } from "@/lib/api";
import { createComment } from "@/lib/services/comments";
import { requireApiUser } from "@/lib/session";
import { commentInputSchema } from "@/schemas/comment";

// POST /api/posts/:id/comments
export async function POST(request: Request, { params }: RouteContext<"/api/posts/[id]/comments">) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const input = commentInputSchema.parse(await readJson(request));

    const { comment, postSlug } = await createComment(user.id, id, input);
    revalidatePath(`/blogs/${postSlug}`);

    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
