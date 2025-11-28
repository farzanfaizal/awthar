import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertServiceSchema, Category } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/image-upload";
import { Loader2 } from "lucide-react";

// Extend the schema for form validation if needed, but using shared schema is best
const formSchema = insertServiceSchema.extend({
  priceMin: z.string().transform(v => parseFloat(v).toString()), // Handle string/number conversion
  priceMax: z.string().optional().transform(v => v ? parseFloat(v).toString() : undefined),
});

type ServiceFormValues = z.infer<typeof formSchema>;

import { DashboardLayout } from "@/components/dashboard-layout";

export default function CreateListingPage() {
  // ... existing logic ...

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ... existing content ... */}
      </div>
    </DashboardLayout>
  );
}
