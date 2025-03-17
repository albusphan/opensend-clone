import { createFileRoute, useSearch } from "@tanstack/react-router";

// Define the search params type
interface OnboardingSearchParams {
  storeId?: string;
}

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>): OnboardingSearchParams => {
    return {
      storeId: search.storeId as string | undefined,
    };
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const search = useSearch({ from: "/onboarding" });
  const storeId = search.storeId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Complete Your Onboarding</h1>
        <p className="text-muted-foreground">
          Please complete the onboarding process to access your dashboard.
        </p>
      </div>
      <div className="rounded-lg border p-6">
        <p>Store ID: {storeId}</p>
        <p className="my-4">
          Your store needs to complete the onboarding process before you can
          access the dashboard.
        </p>
        {/* Onboarding form would go here */}
      </div>
    </div>
  );
}
