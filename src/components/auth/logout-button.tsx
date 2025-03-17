import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/authSlice";

export function LogoutButton() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate({ to: "/login" });
  };

  return (
    <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Logout</span>
    </Button>
  );
}
