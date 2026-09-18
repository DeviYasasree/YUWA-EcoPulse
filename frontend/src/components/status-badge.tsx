import { Submission } from "@/lib/api";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: Submission["status"] }) {
  const styles = {
    PENDING_REVIEW: "bg-[#fff8eb] text-[#8a5a00] border-[#f0dfb8]",
    APPROVED: "bg-[#ecf8f1] text-[#17663a] border-[#cde8d6]",
    REJECTED: "bg-[#fdeeee] text-[#9b1c14] border-[#f3cfcb]",
  };
  const labels = {
    PENDING_REVIEW: "Pending review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return (
    <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs font-medium", styles[status])}>
      {labels[status]}
    </span>
  );
}
