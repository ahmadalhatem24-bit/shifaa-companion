import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  UserCheck,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProviderLayout } from "@/components/layout/ProviderLayout";
import { Link } from "react-router-dom";
import { useProviderDashboard } from "@/hooks/useProviderDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderDashboard() {
  const { stats, todayAppointments, providerInfo, isLoading } = useProviderDashboard();

  const statCards = [
    {
      title: "مواعيد اليوم",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "طلبات معلقة",
      value: stats.pendingRequests,
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "إجمالي المرضى",
      value: stats.totalPatients,
      icon: Users,
      color: "bg-success/10 text-success",
    },
    {
      title: "إيرادات الشهر",
      value:
        stats.monthlyRevenue >= 1000000
          ? `${(stats.monthlyRevenue / 1000000).toFixed(1)}M`
          : stats.monthlyRevenue >= 1000
            ? `${(stats.monthlyRevenue / 1000).toFixed(0)}K`
            : stats.monthlyRevenue.toString(),
      icon: DollarSign,
      color: "bg-accent/10 text-accent",
    },
  ];

  const nextPatient = todayAppointments[0];

  if (isLoading) {
    return (
      <ProviderLayout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">
            مرحباً، {providerInfo?.name || "دكتور"} 👋
          </h1>
          <p className="text-muted-foreground">إليك ملخص نشاطك اليوم</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="medical-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Next Patient Widget */}
          {nextPatient ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="medical-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">المريض التالي</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Clock className="h-4 w-4 ml-1" />
                  {nextPatient.appointment_time.slice(0, 5)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{nextPatient.patient_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {nextPatient.status === "confirmed" ? "موعد مؤكد" : "بانتظار التأكيد"}
                  </p>
                </div>
              </div>

              {nextPatient.notes && (
                <div className="p-4 bg-secondary/50 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">ملاحظات:</p>
                  <p className="text-sm font-medium">{nextPatient.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="hero" className="flex-1" asChild>
                  <Link to={`/provider/patients/${nextPatient.patient_id}`}>
                    عرض الملف الطبي
                  </Link>
                </Button>
                <Button variant="outline">بدء الفحص</Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="medical-card p-6 flex flex-col items-center justify-center text-center"
            >
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">لا توجد مواعيد اليوم</h2>
              <p className="text-muted-foreground">
                ستظهر هنا المواعيد القادمة عند حجزها من المرضى
              </p>
            </motion.div>
          )}

          {/* Today's Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="medical-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">مواعيد اليوم</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/provider/appointments">
                  عرض الكل
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.appointment_time.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === "confirmed"
                          ? "badge-confirmed"
                          : apt.status === "pending"
                            ? "badge-pending"
                            : "badge-cancelled"
                      }`}
                    >
                      {apt.status === "confirmed"
                        ? "مؤكد"
                        : apt.status === "pending"
                          ? "معلق"
                          : "ملغي"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>لا توجد مواعيد لهذا اليوم</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProviderLayout>
  );
}
