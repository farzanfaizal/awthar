import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                A
              </div>
              <span className="font-bold text-xl">Awthar</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect with trusted service providers across the GCC region.
            </p>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="font-semibold mb-4">For Customers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse"><a className="hover:text-foreground">Browse Services</a></Link></li>
              <li><Link href="/categories"><a className="hover:text-foreground">Categories</a></Link></li>
              <li><Link href="/how-it-works"><a className="hover:text-foreground">How It Works</a></Link></li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="font-semibold mb-4">For Providers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/api/login"><a className="hover:text-foreground">List Your Services</a></Link></li>
              <li><Link href="/dashboard"><a className="hover:text-foreground">Provider Dashboard</a></Link></li>
              <li><Link href="/pricing"><a className="hover:text-foreground">Pricing</a></Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about"><a className="hover:text-foreground">About Us</a></Link></li>
              <li><Link href="/contact"><a className="hover:text-foreground">Contact</a></Link></li>
              <li><Link href="/terms"><a className="hover:text-foreground">Terms of Service</a></Link></li>
              <li><Link href="/privacy"><a className="hover:text-foreground">Privacy Policy</a></Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Awthar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
