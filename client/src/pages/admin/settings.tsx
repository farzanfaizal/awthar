import { AdminLayout } from "@/components/admin-layout";
import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Configure platform settings</p>
        </div>

        <Card className="rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <SettingsIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
              <p className="text-muted-foreground">
                Platform configuration settings are under development. You'll be able to manage platform settings, payment configurations, notification templates, and more.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
