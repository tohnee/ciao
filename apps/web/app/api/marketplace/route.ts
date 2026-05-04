import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { getMarketplaceListings, getMyMarketplaceListings, createListing } from "@/lib/runtime-repository";
import { getOrCreateProfile } from "@ciao/payments";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("mine") === "true") {
    const workspaceId = await getRequiredWorkspaceId();
    const listings = await getMyMarketplaceListings(workspaceId);
    return ok({ listings });
  }
  const sort = searchParams.get("sort") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const listings = await getMarketplaceListings({ sort, tag });
  return ok({ listings });
}

export async function POST(request: Request) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json()) as {
    agentId: string;
    price: number;
    description: string;
    weeklyPrice?: number;
    monthlyPrice?: number;
    tags?: string;
  };

  await getOrCreateProfile(prisma, workspaceId);

  const listing = await createListing(body);
  return ok({ listing }, { status: 201 });
}
