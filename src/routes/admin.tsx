import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, stores, and revenue
        </p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold">Stores</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold">Revenue</h2>
          <p className="text-3xl font-bold">$0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold">Active Sessions</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
