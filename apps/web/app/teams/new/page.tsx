import { TeamForm } from "@/components/team/TeamForm";

export default function NewTeamPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">New Team</h1>
      <TeamForm />
    </div>
  );
}
