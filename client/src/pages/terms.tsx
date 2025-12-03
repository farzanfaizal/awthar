import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: December 3, 2025</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Awthar ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Use of the Platform</h2>
              <p className="text-muted-foreground mb-4">
                Awthar provides a marketplace platform that connects service providers with customers. You agree to use the Platform only for lawful purposes and in accordance with these Terms.
              </p>
              <p className="text-muted-foreground">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Service Provider Terms</h2>
              <p className="text-muted-foreground mb-4">
                If you register as a service provider, you additionally agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide services as described in your listings</li>
                <li>Maintain appropriate licenses and insurance</li>
                <li>Respond to customer inquiries in a timely manner</li>
                <li>Complete booked services professionally</li>
                <li>Not misrepresent your qualifications or services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Payments and Fees</h2>
              <p className="text-muted-foreground">
                Awthar facilitates connections between customers and providers. Payment terms are agreed directly between customers and providers. Platform subscription fees, if applicable, are outlined on our pricing page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Platform and its original content, features, and functionality are owned by Awthar and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Awthar acts as a platform connecting service providers with customers. We do not provide services directly and are not responsible for the quality, timing, or legality of services provided by third parties. Use of the Platform is at your own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend your account and access to the Platform immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of any material changes. Continued use of the Platform after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at: legal@awthar.ae
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
