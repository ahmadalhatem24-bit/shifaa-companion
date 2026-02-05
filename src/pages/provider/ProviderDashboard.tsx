import { motion } from 'framer-motion';
import { 
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { mockDashboardStats, mockAppointments } from '@/data/mockData';
import { Link } from 'react-router-dom';

const stats = [
  { 
    title: 'مواعيد اليوم', 
    value: mockDashboardStats.todayAppointments, 
    icon: Calendar, 
    color: 'bg-primary/10 text-primary',
    change: '+2 عن الأمس'
  },
  { 
    title: 'طلبات معلقة', 
    value: mockDashboardStats.pendingRequests, 
    icon: Clock, 
    color: 'bg-warning/10 text-warning',
    change: 'بانتظار الموافقة'
  },
  { 
    title: 'إجمالي المرضى', 
    value: mockDashboardStats.totalPatients, 
    icon: Users, 
    color: 'bg-success/10 text-success',
    change: '+12 هذا الشهر'
  },
  { 
    title: 'إيرادات الشهر', 
    value: `${(mockDashboardStats.monthlyRevenue / 1000000).toFixed(1)}M`, 
    icon: DollarSign, 
    color: 'bg-accent/10 text-accent',
    change: '+15% عن الشهر الماضي'
  },
];

export default function ProviderDashboard() {
  const todayAppointments = mockAppointments.filter(
    apt => apt.status === 'confirmed' || apt.status === 'pending'
  ).slice(0, 3);

  const nextPatient = todayAppointments[0];

  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">مرحباً، د. أحمد 👋</h1>
          <p className="text-muted-foreground">إليك ملخص نشاطك اليوم</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="medical-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Next Patient Widget */}
          {nextPatient && (
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
                  {nextPatient.time}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{nextPatient.patientName}</h3>
                  <p className="text-sm text-muted-foreground">موعد جديد</p>
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
                  <Link to={`/provider/patients/${nextPatient.patientId}`}>
                    عرض الملف الطبي
                  </Link>
                </Button>
                <Button variant="outline">بدء الفحص</Button>
              </div>
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

            <div className="space-y-4">
              {todayAppointments.map((apt, i) => (
                <div 
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">{apt.time}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'confirmed' 
                      ? 'badge-confirmed' 
                      : apt.status === 'pending'
                      ? 'badge-pending'
                      : 'badge-cancelled'
                  }`}>
                    {apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'pending' ? 'معلق' : 'ملغي'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </ProviderLayout>
  );
}
