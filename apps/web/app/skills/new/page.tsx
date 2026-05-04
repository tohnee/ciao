import { SkillForm } from "@/components/skill/SkillForm";

export default function NewSkillPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">New Skill</h1>
        <p className="mt-1 text-sm text-muted">
          Define a reusable capability that agents can use.
        </p>
      </div>
      <SkillForm />
    </div>
  );
}
