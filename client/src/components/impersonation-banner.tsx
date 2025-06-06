import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserX, AlertTriangle } from "lucide-react";

export default function ImpersonationBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const exitImpersonationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/exit-impersonation");
    },
    onSuccess: () => {
      // Invalidate auth cache first
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Use React navigation for seamless transition
      setLocation("/admin");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Only show if user is being impersonated
  if (!user?.isImpersonating) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exitImpersonationMutation.mutate()}
          disabled={exitImpersonationMutation.isPending}
          className="border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          <UserX className="w-4 h-4 mr-2" />
          {exitImpersonationMutation.isPending ? "Exiting..." : "Exit Impersonation"}
        </Button>
      </div>
    </div>
  );
}