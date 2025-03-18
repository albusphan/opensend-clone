import { useAppSelector } from "@/lib/redux/hooks";
import { WidgetGrid } from "@/components/dashboard/widget-grid";

export function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="container">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <b>{user?.first_name || "User"}</b>! Here's an overview
          of your metrics.
        </p>
      </div>
      <div className="mb-6"></div>
      <WidgetGrid />
    </div>
  );
}
