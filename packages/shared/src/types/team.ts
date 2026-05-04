export type TeamMemberRole = "lead" | "member" | "observer";

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  agentId: string;
  role: TeamMemberRole;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
}

export interface TeamWithMembers extends Team {
  members: (TeamMember & { agentName: string; agentAvatarUrl: string | null })[];
}

export interface TeamCard {
  id: string;
  name: string;
  description: string | null;
  membersCount: number;
}
