import { DashboardLayout } from "@/components/dashboard-layout";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Messages() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">View and manage your conversations</p>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Messages Coming Soon</h3>
              <p className="text-muted-foreground">
                The messaging feature is under development. You'll be able to chat with customers directly from here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
