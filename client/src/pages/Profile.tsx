import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditFounderProfile } from "@/components/EditFounderProfile";
import { ViewFounderProfile } from "@/components/ViewFounderProfile";
import { RoleAccessVisualization } from "@/components/RoleAccessVisualization";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

interface FounderProfile {
  name: string;
  companyName: string;
  bio?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  experience?: string;
  companyWebsite?: string;
  industry?: string;
  foundingDate?: string;
  teamSize?: number;
  fundingStage?: string;
  investmentRaised?: number;
  futureGoals?: Array<{
    title: string;
    description: string;
    timeline: string;
  }>;
}

export function Profile() {
  const { userId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const { data: profile, isLoading } = useQuery<FounderProfile>({
    queryKey: [`/api/profile/${userId}`],
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<FounderProfile>) => {
      const response = await fetch(`/api/profile/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Founder Profile</CardTitle>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <EditFounderProfile
                profile={profile}
                onSave={async (data) => {
                  await mutation.mutateAsync(data);
                }}
                onCancel={() => setIsEditing(false)}
                isLoading={mutation.isPending}
              />
            ) : (
              <ViewFounderProfile profile={profile} />
            )}
          </CardContent>
        </Card>

        {/* Add Role Access Visualization */}
        {user && (
          <RoleAccessVisualization 
            role={user.role} 
            tier={user.subscriptionTier} 
          />
        )}
      </div>
    </div>
  );
}