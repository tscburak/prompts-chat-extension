import { Loader2 } from "lucide-react";

export function LoadingPrompts() {
  return (
    <div className="text-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      <div className="text-lg font-semibold text-foreground">
        Loading prompts...
      </div>
      <p className="text-sm text-muted-foreground">
        Please wait while we fetch the prompts
      </p>
    </div>
  );
}
