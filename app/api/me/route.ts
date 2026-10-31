import { revalidatePath } from "next/cache";
import { handleApiError, readJson } from "@/lib/api";
import { updateProfile } from "@/lib/services/users";
import { requireApiUser } from "@/lib/session";
import { profileInputSchema } from "@/schemas/profile";

// PATCH /api/me — update the signed-in user's own profile.
// There is no /api/users/:id to edit: the user is always the one in the session.
export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const input = profileInputSchema.parse(await readJson(request));

    const profile = await updateProfile(user.id, input);

    // Name, avatar and username appear on posts, comments and member lists
    // all over the site. Profile edits are rare, so refreshing every cached
    // page is simpler (and safer) than tracking each place the user shows up.
    revalidatePath("/", "layout");

    return Response.json({ user: profile });
  } catch (error) {
    return handleApiError(error);
  }
}
