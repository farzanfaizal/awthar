import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  Pie,
  PieChart
} from "recharts";
import { Users, Eye, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#fbbf24', '#94a3b8'];

type AnalyticsData = {
  stats: {
    totalRevenue: number;
    totalBookings: number;
    totalViews: number;
    conversionRate: number;
  };
  charts: {
    revenue: { name: string; total: number }[];
    services: { name: string; value: number }[];
  };
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/provider"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/provider");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[500px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Default empty state if no data
  const revenueData = data?.charts.revenue || [];
  const serviceData = data?.charts.services || [];
  const stats = data?.stats || { totalRevenue: 0, totalBookings: 0, totalViews: 0, conversionRate: 0 };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
            <p className="text-muted-foreground">Detailed insights into your business growth and customer engagement.</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
             <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-background shadow-sm">Last 6 Months</button>
             <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">Last Year</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Revenue</CardTitle>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">AED {stats.totalRevenue.toLocaleString()}</div>
              {/* Note: Growth percentages require comparison with previous period data which we haven't implemented yet */}
              <div className="flex items-center gap-1 mt-2 text-muted-foreground font-medium text-sm">
                <span className="text-xs text-nowrap">Lifetime Revenue</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bookings</CardTitle>
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground font-medium text-sm">
                <span className="text-xs text-nowrap">Total Bookings</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Profile Views</CardTitle>
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                <Eye className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalViews}</div>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground font-medium text-sm">
                <span className="text-xs text-nowrap">Service Views</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Conversion</CardTitle>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground font-medium text-sm">
                <span className="text-xs text-nowrap">Bookings / Views</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          {/* Main Chart */}
          <Card className="lg:col-span-4 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue trends for the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `AED ${value}`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Side Chart / Insights */}
          <Card className="lg:col-span-3 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
              <CardDescription>Bookings shared across your service categories.</CardDescription>
            </CardHeader>
            <CardContent>
              {serviceData.length > 0 ? (
                <>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-3">
                    {serviceData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-muted-foreground">{item.value} bookings</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No bookings yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
