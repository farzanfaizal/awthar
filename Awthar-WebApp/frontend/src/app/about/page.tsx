export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">About Awthar</h1>
      <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        The UAE&apos;s trusted marketplace connecting customers with verified service providers.
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-muted-foreground">
            Awthar aims to revolutionize how people find and book services in the UAE. We believe everyone deserves access to trusted, verified professionals — whether you need home maintenance, professional consulting, or creative services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">For Customers</h2>
          <p className="text-muted-foreground">
            Browse hundreds of services across the UAE. Read verified reviews, compare prices, and book with confidence. Our platform ensures you always get the quality you deserve.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">For Providers</h2>
          <p className="text-muted-foreground">
            Grow your business with Awthar. Create a professional profile, list your services, and reach thousands of potential customers. Our tools help you manage bookings, track analytics, and build your reputation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Why Choose Us?</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>Verified service providers with real reviews</li>
            <li>Secure booking and scheduling system</li>
            <li>Direct messaging between customers and providers</li>
            <li>Coverage across all UAE emirates</li>
            <li>Free for customers, affordable plans for providers</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
