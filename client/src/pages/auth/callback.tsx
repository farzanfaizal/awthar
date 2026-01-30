import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type CallbackStatus = "loading" | "success" | "error";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase puts tokens there after OAuth)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setStatus("error");
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          setStatus("success");
          // Redirect after a short delay to show success message
          setTimeout(() => {
            setLocation("/");
          }, 1500);
        } else {
          // Check if this is an email verification callback
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            // Set the session manually
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              setStatus("error");
              setErrorMessage(sessionError.message);
              return;
            }

            setStatus("success");
            setTimeout(() => {
              setLocation("/");
            }, 1500);
          } else {
            // No session found
            setStatus("error");
            setErrorMessage("Authentication failed. Please try again.");
          }
        }
      } catch (err: any) {
        console.error("Callback error:", err);
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred");
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <CardTitle>Completing sign in...</CardTitle>
              <CardDescription>Please wait while we verify your account.</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Welcome to Awthar!</CardTitle>
              <CardDescription>
                You have successfully signed in. Redirecting you now...
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Authentication Failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>

        {status === "error" && (
          <CardContent className="space-y-4">
            <Button onClick={() => setLocation("/login")} className="w-full">
              Back to Login
            </Button>
            <Button variant="outline" onClick={() => setLocation("/signup")} className="w-full">
              Create Account
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
