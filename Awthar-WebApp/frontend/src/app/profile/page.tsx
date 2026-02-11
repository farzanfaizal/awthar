"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/image-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPatch } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setProfileImageUrl(user.profileImageUrl || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; profileImageUrl?: string }) =>
      apiPatch("/api/auth/user", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Profile Updated", description: "Your profile changes have been saved successfully." });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message || "Failed to update profile.", variant: "destructive" });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ firstName, lastName, profileImageUrl: profileImageUrl || undefined });
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setProfileImageUrl(user?.profileImageUrl || "");
    setIsEditing(false);
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setProfileImageUrl(urls[0]);
      toast({ title: "Photo uploaded", description: "Don't forget to save your changes!" });
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login");
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center gap-4 pb-6 border-b">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileImageUrl || user.profileImageUrl || undefined} />
                <AvatarFallback className="text-2xl">{firstName?.[0] || user.firstName?.[0]}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <ImageUpload value={profileImageUrl ? [profileImageUrl] : []} onChange={handleImageUpload} maxFiles={1} />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user.email || ""} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              {isEditing ? (
                <>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={updateProfileMutation.isPending}>Cancel</Button>
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
