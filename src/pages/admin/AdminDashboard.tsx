import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Stethoscope,
  Building2,
  Pill,
  FlaskConical,
  CalendarDays,
  Smile,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  totalHospitals: number;
  totalPharmacies: number;
  totalLaboratories: number;
  totalDental: number;
  totalCosmetic: number;
  totalAppointments: number;
  pendingAppointments: number;
  verifiedProviders: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalHospitals: 0,
    totalPharmacies: 0,
    totalLaboratories: 0,
    totalDental: 0,
    totalCosmetic: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    verifiedProviders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch providers count by type
      const { data: providers } = await supabase
        .from("providers")
        .select("provider_type, is_verified");

      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { data: appointments } = await supabase
        .from("appointments")
        .select("status");

      if (providers) {
        const doctorsCount = providers.filter(
          (p) => p.provider_type === "doctor"
        ).length;
        const hospitalsCount = providers.filter(
          (p) => p.provider_type === "hospital"
        ).length;
        const pharmaciesCount = providers.filter(
          (p) => p.provider_type === "pharmacist"
        ).length;
        const laboratoriesCount = providers.filter(
          (p) => p.provider_type === "laboratory"
        ).length;
        const dentalCount = providers.filter(
          (p) => p.provider_type === "dental"
        ).length;
        const cosmeticCount = providers.filter(
          (p) => p.provider_type === "cosmetic"
        ).length;
        const verifiedCount = providers.filter((p) => p.is_verified).length;

        setStats({
          totalUsers: usersCount || 0,
          totalDoctors: doctorsCount,
          totalHospitals: hospitalsCount,
          totalPharmacies: pharmaciesCount,
          totalLaboratories: laboratoriesCount,
          totalDental: dentalCount,
          totalCosmetic: cosmeticCount,
          totalAppointments: appointments?.length || 0,
          pendingAppointments:
            appointments?.filter((a) => a.status === "pending").length || 0,
          verifiedProviders: verifiedCount,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const providerChartData = [
    { name: "أطباء", value: stats.totalDoctors },
    { name: "مشافي", value: stats.totalHospitals },
    { name: "صيدليات", value: stats.totalPharmacies },
    { name: "مختبرات", value: stats.totalLaboratories },
    { name: "أسنان", value: stats.totalDental },
    { name: "تجميل", value: stats.totalCosmetic },
  ];

  const appointmentChartData = [
    { name: "معلقة", value: stats.pendingAppointments },
    {
      name: "مكتملة",
      value: stats.totalAppointments - stats.pendingAppointments,
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            مرحباً بك في لوحة التحكم
          </h2>
          <p className="text-muted-foreground">
            نظرة عامة على إحصائيات المنصة
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="إجمالي المستخدمين"
            value={stats.totalUsers}
            icon={Users}
            color="primary"
          />
          <StatsCard
            title="الأطباء"
            value={stats.totalDoctors}
            icon={Stethoscope}
            color="success"
          />
          <StatsCard
            title="المواعيد"
            value={stats.totalAppointments}
            icon={CalendarDays}
            color="warning"
          />
          <StatsCard
            title="مزودين موثقين"
            value={stats.verifiedProviders}
            icon={UserCheck}
            color="primary"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard
            title="المشافي"
            value={stats.totalHospitals}
            icon={Building2}
          />
          <StatsCard
            title="الصيدليات"
            value={stats.totalPharmacies}
            icon={Pill}
          />
          <StatsCard
            title="المختبرات"
            value={stats.totalLaboratories}
            icon={FlaskConical}
          />
          <StatsCard
            title="عيادات الأسنان"
            value={stats.totalDental}
            icon={Smile}
          />
          <StatsCard
            title="مراكز التجميل"
            value={stats.totalCosmetic}
            icon={Sparkles}
          />
          <StatsCard
            title="مواعيد معلقة"
            value={stats.pendingAppointments}
            icon={TrendingUp}
            color="warning"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>توزيع مزودي الخدمة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providerChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>حالة المواعيد</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
