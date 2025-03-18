import {
  Link,
  Outlet,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAppSelector } from "@/lib/redux/hooks";
import { Button } from "@/components/ui/button";
import { LogoFull } from "@/components/logo-full";
import { getRedirectRoute } from "@/lib/utils/auth-redirect";

export const Route = createRootRoute({
  component: RootComponent,

  beforeLoad: async ({ location }) => {
    const redirectPath = await getRedirectRoute(location.pathname);

    if (redirectPath) {
      throw redirect({
        to: redirectPath,
      });
    }
  },
});

function RootComponent() {
  const { isAuthenticated, view } = useAppSelector((state) => state.auth);

  const isAdmin = view?.type === "ADMIN";

  return (
    <div className="bg-background min-h-screen">
      <div className="flex p-4 justify-between items-center border-b">
        <div className="flex gap-4 items-center">
          <div className="text-xl font-bold">
            <LogoFull height="24" />
          </div>
          {isAdmin && (
            <>
              <Button asChild variant="ghost">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/admin">Admin</Link>
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && <LogoutButton />}
          <ThemeToggle />
        </div>
      </div>
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
