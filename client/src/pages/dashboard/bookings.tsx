import { DashboardLayout } from "@/components/dashboard-layout";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Bookings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage your service bookings</p>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bookings Coming Soon</h3>
              <p className="text-muted-foreground">
                The booking management feature is under development. You'll be able to view and manage all your bookings here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
