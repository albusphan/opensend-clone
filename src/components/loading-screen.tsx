import { LogoFull } from "@/components/logo-full";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <LogoFull className="w-64" />
      <div className="animate-pulse flex gap-2">
        <div className="w-2 h-2 bg-foreground rounded-full"></div>
        <div className="w-2 h-2 bg-foreground rounded-full"></div>
        <div className="w-2 h-2 bg-foreground rounded-full"></div>
      </div>
    </div>
  );
}
