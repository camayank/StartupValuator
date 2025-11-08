import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessProfileSchema } from "@/lib/validations/business-profile";
import { BusinessProfileForm } from "./BusinessProfileForm";

export function BusinessProfileWrapper() {
  const form = useForm({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessInfo: {
        name: "",
        sector: "",
        segment: "",
        subSegment: "",
        businessModel: "",
        productStage: ""
      }
    }
  });

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BusinessProfileForm />
      </form>
    </Form>
  );
}
