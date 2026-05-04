import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { getMarketplaceListingById, purchaseListing } from "@/lib/runtime-repository";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const listing = await getMarketplaceListingById(params.id);
  if (!listing) {
    return ok({ error: "Listing not found" }, { status: 404 });
  }

  const profile = listing.agent.workspace.authorProfile;

  return ok({
    listing: {
      id: listing.id,
      agentId: listing.agentId,
      agentName: listing.agent.name,
      price: listing.price,
      weeklyPrice: listing.weeklyPrice,
      monthlyPrice: listing.monthlyPrice,
      description: listing.description,
      rating: listing.rating,
      downloads: listing.downloads,
      featured: listing.featured,
      status: listing.status,
      totalSubscribers: listing.totalSubscribers,
      totalEarned: listing.totalEarned,
      tags: listing.tags,
      createdAt: listing.createdAt.toISOString(),
    },
    authorProfile: {
      tier: profile?.tier ?? "BRONZE",
      totalEarned: listing.totalEarned,
      totalSubscribers: profile?.totalSubscribers ?? 0,
      rating: profile?.rating ?? 0,
      ratingCount: 0,
      commissionRate: 0,
      displayName: profile?.displayName ?? null,
      bio: null,
    },
  });
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const result = await purchaseListing(params.id, workspaceId);
  if (!result) return ok({ error: "Listing not found" }, { status: 404 });
  return ok({ transaction: result });
}
