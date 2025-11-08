import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

export default function SubscriptionPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return null; // Handle in App.tsx with auth redirect
  }

  return <SubscriptionPlans />;
}
