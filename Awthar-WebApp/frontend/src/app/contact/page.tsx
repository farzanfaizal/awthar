import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">Contact Us</h1>
      <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        Have a question or need help? We&apos;re here for you.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Mail className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">support@awthar.com</p>
            <p className="text-sm text-muted-foreground mt-1">We respond within 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Phone className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">+971 4 XXX XXXX</p>
            <p className="text-sm text-muted-foreground mt-1">Sun-Thu, 9 AM - 6 PM GST</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MapPin className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Office</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Dubai, United Arab Emirates</p>
            <p className="text-sm text-muted-foreground mt-1">By appointment only</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
