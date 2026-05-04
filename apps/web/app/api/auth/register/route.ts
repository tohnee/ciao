import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    email: string;
    password: string;
    name?: string;
  };

  if (!body.email || !body.password) {
    return ok({ error: "Email and password required" }, { status: 400 });
  }

  if (body.password.length < 6) {
    return ok({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return ok({ error: "Email already registered" }, { status: 409 });
  }

  const slug = body.email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const hashedPassword = await hash(body.password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: `${body.name || body.email.split("@")[0]}'s Workspace`,
        slug: `${slug}-${Date.now().toString(36)}`,
        settings: "{}",
      },
    });

    const user = await tx.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name || null,
        workspaceId: workspace.id,
      },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.id },
    };
  });

  return ok({ user: result.user, workspace: result.workspace }, { status: 201 });
}
