import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api";
import { listCommunities } from "@/lib/services/communities";
import { communityQuerySchema } from "@/schemas/query";

// GET /api/communities?search=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const query = communityQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return Response.json(await listCommunities(query));
  } catch (error) {
    return handleApiError(error);
  }
}
