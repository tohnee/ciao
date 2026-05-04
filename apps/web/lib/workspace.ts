import { auth } from "./auth";

export async function getRequiredWorkspaceId(): Promise<string> {
  const session = await auth();
  const workspaceId = (session?.user as any)?.workspaceId;
  if (!workspaceId) {
    throw new Error("Unauthorized: no workspace found for session user");
  }
  return workspaceId;
}
