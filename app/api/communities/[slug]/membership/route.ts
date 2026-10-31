import { revalidatePath } from "next/cache";
import { handleApiError } from "@/lib/api";
import { isMember, joinCommunity, leaveCommunity } from "@/lib/services/communities";
import { requireApiUser } from "@/lib/session";

type Context = RouteContext<"/api/communities/[slug]/membership">;

function revalidateMembershipPages(slug: string, username: string) {
  // Member count + member list, and the "communities" section of the profile.
  revalidatePath(`/communities/${slug}`);
  revalidatePath(`/profile/${username}`);
}

// GET /api/communities/:slug/membership — is the current user a member?
export async function GET(_request: Request, { params }: Context) {
  try {
    const user = await requireApiUser();
    const { slug } = await params;
    return Response.json({ joined: await isMember(user.id, slug) });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/communities/:slug/membership — join
export async function POST(_request: Request, { params }: Context) {
  try {
    const user = await requireApiUser();
    const { slug } = await params;

    const { created } = await joinCommunity(user.id, slug);
    if (created) revalidateMembershipPages(slug, user.username);

    return Response.json({ joined: true }, { status: created ? 201 : 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/communities/:slug/membership — leave
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const user = await requireApiUser();
    const { slug } = await params;

    await leaveCommunity(user.id, slug);
    revalidateMembershipPages(slug, user.username);

    return Response.json({ joined: false });
  } catch (error) {
    return handleApiError(error);
  }
}
