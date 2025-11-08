import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  experience: z.string().optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  twitterHandle: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().url("Invalid website URL").optional().or(z.literal("")),
  teamSize: z.number().min(1, "Team size must be at least 1").optional(),
  keyRoles: z.array(z.string()).optional(),
  previousExits: z.array(z.object({
    companyName: z.string(),
    exitYear: z.number(),
    exitType: z.string(),
    amount: z.number().optional(),
  })).optional(),
  fundingHistory: z.array(z.object({
    round: z.string(),
    amount: z.number(),
    date: z.string(),
    investors: z.array(z.string()),
  })).optional(),
  journeyMilestones: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(["product", "team", "funding", "market", "other"]),
    impact: z.number().min(1).max(10),
  })).optional(),
  growthMetrics: z.array(z.object({
    date: z.string(),
    metric: z.string(),
    value: z.number(),
    target: z.number(),
    unit: z.string(),
  })).optional(),
  keyAchievements: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.string(),
  })).optional(),
  futureGoals: z.array(z.object({
    targetDate: z.string(),
    title: z.string(),
    description: z.string(),
    status: z.enum(["planned", "in_progress", "achieved", "delayed"]),
    priority: z.enum(["low", "medium", "high"]),
  })).optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface EditFounderProfileProps {
  profile: ProfileFormData | null;
  onSave: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditFounderProfile({
  profile,
  onSave,
  onCancel,
  isLoading,
}: EditFounderProfileProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profile || {
      name: "",
      bio: "",
      experience: "",
      linkedinUrl: "",
      twitterHandle: "",
      companyName: "",
      companyWebsite: "",
      teamSize: 1,
      keyRoles: [],
      previousExits: [],
      fundingHistory: [],
      journeyMilestones: [],
      growthMetrics: [],
      keyAchievements: [],
      futureGoals: [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitterHandle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter Handle</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="companyWebsite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Website</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}