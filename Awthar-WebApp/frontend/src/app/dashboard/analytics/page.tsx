"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getQueryFn } from "@/lib/query-client";
import { DollarSign, ShoppingCart, Eye, TrendingUp } from "lucide-react";

interface ProviderAnalytics {
  stats: {
    totalRevenue: number;
    totalBookings: number;
    totalViews: number;
    conversionRate: number;
  };
  charts: {
    revenue: Array<{ name: string; total: number }>;
    services: Array<{ name: string; value: number }>;
  };
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<ProviderAnalytics>({
    queryKey: ["/api/analytics/provider"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground mt-1">Track your performance and earnings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: analytics?.stats.totalRevenue ? `AED ${analytics.stats.totalRevenue.toLocaleString()}` : "AED 0", icon: DollarSign, color: "text-green-500" },
            { label: "Total Bookings", value: String(analytics?.stats.totalBookings || 0), icon: ShoppingCart, color: "text-blue-500" },
            { label: "Profile Views", value: String(analytics?.stats.totalViews || 0), icon: Eye, color: "text-purple-500" },
            { label: "Conversion Rate", value: analytics?.stats.conversionRate ? `${analytics.stats.conversionRate.toFixed(1)}%` : "0%", icon: TrendingUp, color: "text-orange-500" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            ) : analytics?.charts.revenue && analytics.charts.revenue.length > 0 ? (
              <div className="space-y-4">
                {analytics.charts.revenue.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-muted-foreground">{item.name}</span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full flex items-center justify-end px-2"
                        style={{ width: `${Math.min((item.total / (analytics.stats.totalRevenue || 1)) * 100 * 2, 100)}%` }}
                      >
                        <span className="text-xs text-primary-foreground font-medium">AED {item.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>No revenue data yet. Complete bookings to see your earnings.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings by Service */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Service</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 bg-muted animate-pulse rounded-lg" />
            ) : analytics?.charts.services && analytics.charts.services.length > 0 ? (
              <div className="space-y-3">
                {analytics.charts.services.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.value} bookings</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p>No booking data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
