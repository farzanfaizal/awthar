import { Link } from "wouter";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg space-y-8">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
            <h1 className="relative text-[12rem] font-black text-primary/20 leading-none select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-24 h-24 text-primary opacity-80" />
            </div>
        </div>
        
        <div className="space-y-3">
            <h2 className="text-4xl font-extrabold tracking-tight">Lost in the Marketplace?</h2>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved to a new location.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
            </Button>
            <Link href="/">
                <Button size="lg" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
                    <Home className="mr-2 h-5 w-5" />
                    Back to Home
                </Button>
            </Link>
        </div>

        <div className="pt-8 text-sm text-muted-foreground border-t">
            Need help? <Link href="/contact" className="text-primary font-semibold hover:underline">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
