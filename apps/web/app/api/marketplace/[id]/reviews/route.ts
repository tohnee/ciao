import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const reviews = await prisma.marketplaceReview.findMany({
    where: { listingId: params.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          agent: {
            select: {
              workspace: {
                select: {
                  authorProfile: { select: { displayName: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return ok({
    reviews: reviews.map((r) => ({
      id: r.id,
      listingId: r.listingId,
      reviewerName: r.listing.agent.workspace.authorProfile?.displayName ?? null,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json()) as { rating: number; text?: string };

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return ok({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: params.id },
  });
  if (!listing) {
    return ok({ error: "Listing not found" }, { status: 404 });
  }

  const existing = await prisma.marketplaceReview.findUnique({
    where: { listingId_reviewerWorkspaceId: { listingId: params.id, reviewerWorkspaceId: workspaceId } },
  });
  if (existing) {
    return ok({ error: "You have already reviewed this listing" }, { status: 409 });
  }

  const review = await prisma.marketplaceReview.create({
    data: {
      listingId: params.id,
      reviewerWorkspaceId: workspaceId,
      rating: body.rating,
      text: body.text,
    },
  });

  const agg = await prisma.marketplaceReview.aggregate({
    where: { listingId: params.id },
    _avg: { rating: true },
    _count: true,
  });

  const agent = await prisma.agent.findUnique({
    where: { id: listing.agentId },
  });

  if (agent) {
    const authorProfile = await prisma.authorProfile.findUnique({
      where: { workspaceId: agent.workspaceId },
    });
    if (authorProfile) {
      await prisma.authorProfile.update({
        where: { id: authorProfile.id },
        data: {
          rating: agg._avg.rating ?? authorProfile.rating,
          ratingCount: agg._count,
        },
      });
    }
  }

  return ok({ review }, { status: 201 });
}
