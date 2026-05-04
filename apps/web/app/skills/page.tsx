import { SkillList } from "@/components/skill/SkillList";
import { Button } from "@/components/shared/Button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Skills</h1>
          <p className="mt-1 text-sm text-muted">
            Create and manage reusable capabilities for your agents.
          </p>
        </div>
        <Link href="/skills/new">
          <Button variant="primary">
            <Plus className="mr-1.5 h-4 w-4" />
            New Skill
          </Button>
        </Link>
      </div>
      <SkillList />
    </div>
  );
}
