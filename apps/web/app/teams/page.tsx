import Link from "next/link";
import { TeamList } from "@/components/team/TeamList";
import { Button } from "@/components/shared/Button";

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Teams</h1>
        <Link href="/teams/new">
          <Button variant="primary">New Team</Button>
        </Link>
      </div>
      <TeamList />
    </div>
  );
}
