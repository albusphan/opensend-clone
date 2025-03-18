import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EmptyStateProps {
  isAdmin: boolean;
  onAddWidget: () => void;
}

export function EmptyState({ isAdmin, onAddWidget }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-muted-foreground"
        >
          <rect width="8" height="8" x="2" y="2" rx="1" />
          <path d="M6 6h.01" />
          <rect width="8" height="8" x="14" y="2" rx="1" />
          <path d="M18 6h.01" />
          <rect width="8" height="8" x="2" y="14" rx="1" />
          <path d="M6 18h.01" />
          <rect width="8" height="8" x="14" y="14" rx="1" />
          <path d="M18 18h.01" />
        </svg>
      </div>
      <h2 className="text-xl font-bold tracking-tight">No widgets available</h2>
      <p className="mt-1 text-muted-foreground">
        {isAdmin
          ? "Your dashboard is currently empty. Add widgets to start monitoring your metrics."
          : "There are no widgets configured for your dashboard yet."}
      </p>
      {isAdmin && (
        <Button className="mt-4" onClick={onAddWidget}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Widget
        </Button>
      )}
    </div>
  );
}
