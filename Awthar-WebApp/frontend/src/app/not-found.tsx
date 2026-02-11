import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/"><Home className="mr-2 h-4 w-4" />Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/browse"><Search className="mr-2 h-4 w-4" />Browse Services</Link>
        </Button>
      </div>
    </div>
  );
}
