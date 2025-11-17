import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle,
  Building2,
  FileText,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Briefcase,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from "@tanstack/react-query";

const STEPS = [
  { id: 1, title: "Account Type", icon: User },
  { id: 2, title: "Business Info", icon: Building2 },
  { id: 3, title: "Service Areas", icon: MapPin },
  { id: 4, title: "Verification", icon: FileText },
  { id: 5, title: "Review", icon: CheckCircle },
];

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const LANGUAGES = [
  "English",
  "Arabic",
  "Hindi",
  "Urdu",
  "Tagalog",
  "Malayalam",
  "Tamil",
  "Bengali",
  "French",
  "Spanish",
];

export default function BecomeProvider() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    providerType: "",
    companyName: "",
    bio: "",
    phone: "",
    languages: [] as string[],
    serviceRadius: 25,
    serviceAreas: {
      emirates: [] as string[],
      cities: [] as string[],
    },
    verificationDocuments: [] as string[],
    agreeToTerms: false,
  });

  // Check if user already has provider profile
  const { data: existingProfile } = useQuery({
    queryKey: ["/api/providers/me/profile"],
    enabled: isAuthenticated,
    retry: false,
  });

  const createProviderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create provider profile");
      }
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent as keyof typeof prev], [field]: value },
    }));
    setError("");
  };

  const toggleArrayItem = (field: string, value: string) => {
    setFormData((prev) => {
      const array = prev[field as keyof typeof prev] as string[];
      const exists = array.includes(value);
      return {
        ...prev,
        [field]: exists
          ? array.filter((item) => item !== value)
          : [...array, value],
      };
    });
  };

  const toggleNestedArrayItem = (parent: string, field: string, value: string) => {
    setFormData((prev) => {
      const parentObj = prev[parent as keyof typeof prev] as any;
      const array = parentObj[field] as string[];
      const exists = array.includes(value);
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [field]: exists
            ? array.filter((item: string) => item !== value)
            : [...array, value],
        },
      };
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.providerType) {
          setError("Please select an account type");
          return false;
        }
        break;
      case 2:
        if (!formData.bio || formData.bio.length < 50) {
          setError("Bio must be at least 50 characters");
          return false;
        }
        if (!formData.phone || formData.phone.length < 10) {
          setError("Please enter a valid phone number");
          return false;
        }
        if (formData.languages.length === 0) {
          setError("Please select at least one language");
          return false;
        }
        break;
      case 3:
        if (formData.serviceAreas.emirates.length === 0) {
          setError("Please select at least one emirate");
          return false;
        }
        break;
      case 4:
        if (formData.providerType === "licensed_professional" && formData.verificationDocuments.length === 0) {
          setError("Please upload verification documents for licensed professionals");
          return false;
        }
        break;
      case 5:
        if (!formData.agreeToTerms) {
          setError("Please agree to the terms and conditions");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const submitData = {
      providerType: formData.providerType,
      companyName: formData.companyName || null,
      bio: formData.bio,
      phone: formData.phone,
      verificationStatus: formData.providerType === "licensed_professional" ? "pending" : "unverified",
      verificationDocuments: formData.verificationDocuments,
      languages: formData.languages,
      serviceRadius: formData.serviceRadius,
      serviceAreas: formData.serviceAreas,
    };

    createProviderMutation.mutate(submitData);
  };

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Redirect if already a provider
  if (existingProfile) {
    setLocation("/dashboard");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              {formData.providerType === "licensed_professional"
                ? "Your provider application is under review. We'll notify you once it's approved."
                : "Your provider profile has been created successfully!"}
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep > step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <p className="text-xs mt-2 text-center hidden sm:block">{step.title}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Choose your provider account type"}
              {currentStep === 2 && "Tell us about your business"}
              {currentStep === 3 && "Where do you provide services?"}
              {currentStep === 4 && "Upload verification documents (if applicable)"}
              {currentStep === 5 && "Review and submit your application"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Account Type */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      formData.providerType === "casual_tasker"
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => updateField("providerType", "casual_tasker")}
                  >
                    <CardContent className="pt-6">
                      <User className="h-12 w-12 mb-4 text-primary" />
                      <h3 className="font-semibold text-lg mb-2">Casual Tasker</h3>
                      <p className="text-sm text-muted-foreground">
                        For individuals offering services on a flexible basis. No business
                        license required.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <li>✓ Quick approval</li>
                        <li>✓ Flexible schedule</li>
                        <li>✓ No license needed</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      formData.providerType === "licensed_professional"
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => updateField("providerType", "licensed_professional")}
                  >
                    <CardContent className="pt-6">
                      <Briefcase className="h-12 w-12 mb-4 text-primary" />
                      <h3 className="font-semibold text-lg mb-2">Licensed Professional</h3>
                      <p className="text-sm text-muted-foreground">
                        For licensed businesses and certified professionals. Requires
                        verification.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <li>✓ Higher trust badge</li>
                        <li>✓ Priority listings</li>
                        <li>✓ Business verification</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: Business Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {formData.providerType === "licensed_professional" && (
                  <div>
                    <Label htmlFor="companyName">
                      Company Name <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => updateField("companyName", e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="bio">
                    Bio / About Your Services <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Describe your services, experience, and what makes you stand out..."
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.bio.length}/500 characters (minimum 50)
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <div>
                  <Label>
                    Languages Spoken <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {LANGUAGES.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={formData.languages.includes(lang)}
                          onCheckedChange={() => toggleArrayItem("languages", lang)}
                        />
                        <Label
                          htmlFor={`lang-${lang}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {lang}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Service Areas */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>
                    Emirates <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select all emirates where you provide services
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {EMIRATES.map((emirate) => (
                      <div key={emirate} className="flex items-center space-x-2">
                        <Checkbox
                          id={`emirate-${emirate}`}
                          checked={formData.serviceAreas.emirates.includes(emirate)}
                          onCheckedChange={() =>
                            toggleNestedArrayItem("serviceAreas", "emirates", emirate)
                          }
                        />
                        <Label
                          htmlFor={`emirate-${emirate}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {emirate}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                  <Select
                    value={formData.serviceRadius.toString()}
                    onValueChange={(value) => updateField("serviceRadius", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                      <SelectItem value="100">100 km</SelectItem>
                      <SelectItem value="999">Entire UAE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Verification */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {formData.providerType === "licensed_professional" ? (
                  <div>
                    <Label>
                      Verification Documents <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your trade license, professional certifications, and ID
                    </p>
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Document upload feature coming soon
                      </p>
                      <p className="text-xs text-muted-foreground">
                        For now, you can submit your application and upload documents later
                      </p>
                      <Input
                        type="text"
                        placeholder="Paste document URLs (comma-separated)"
                        className="mt-4"
                        value={formData.verificationDocuments.join(", ")}
                        onChange={(e) =>
                          updateField(
                            "verificationDocuments",
                            e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                          )
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Verification Required
                    </h3>
                    <p className="text-muted-foreground">
                      As a casual tasker, you can start immediately after submitting your
                      profile. Build trust through great service and customer reviews!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Account Type</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.providerType === "casual_tasker"
                        ? "Casual Tasker"
                        : "Licensed Professional"}
                    </p>
                  </div>

                  {formData.companyName && (
                    <div>
                      <h4 className="font-semibold mb-1">Company Name</h4>
                      <p className="text-sm text-muted-foreground">{formData.companyName}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-1">Bio</h4>
                    <p className="text-sm text-muted-foreground">{formData.bio}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-sm text-muted-foreground">{formData.phone}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Languages</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.languages.join(", ")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Service Areas</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.serviceAreas.emirates.join(", ")} (within{" "}
                      {formData.serviceRadius}km)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-4 bg-muted rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      updateField("agreeToTerms", checked === true)
                    }
                  />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    . I understand that my information will be verified and my account may
                    be suspended if false information is provided.
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createProviderMutation.isPending}
                >
                  {createProviderMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
