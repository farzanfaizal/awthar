import { Link } from "wouter";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error?: Error, reset?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg space-y-8">
        <div className="flex justify-center">
            <div className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle className="w-12 h-12" />
            </div>
        </div>
        
        <div className="space-y-3">
            <h2 className="text-4xl font-extrabold tracking-tight">Something went wrong</h2>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
                An unexpected error occurred. Our team has been notified and we're working to fix it.
            </p>
            {error && (
                <div className="mt-4 p-4 bg-muted rounded-xl text-left overflow-auto max-h-32 text-xs font-mono">
                    {error.message}
                </div>
            )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20" onClick={() => reset ? reset() : window.location.reload()}>
                <RefreshCcw className="mr-2 h-5 w-5" />
                Try Again
            </Button>
            <Link href="/">
                <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 font-bold">
                    Go to Homepage
                </Button>
            </Link>
        </div>

        <div className="pt-8 text-sm text-muted-foreground border-t">
            Persistent issue? <Link href="/contact" className="text-primary font-semibold hover:underline">Support Details</Link>
        </div>
      </div>
    </div>
  );
}
