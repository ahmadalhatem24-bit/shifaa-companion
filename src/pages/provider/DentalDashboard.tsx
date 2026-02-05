import { motion } from 'framer-motion';
import { 
  Smile,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { 
    title: 'مواعيد اليوم', 
    value: 12, 
    icon: Calendar, 
    color: 'bg-primary/10 text-primary',
    change: '+3 عن الأمس'
  },
  { 
    title: 'طلبات معلقة', 
    value: 5, 
    icon: Clock, 
    color: 'bg-warning/10 text-warning',
    change: 'بانتظار التأكيد'
  },
  { 
    title: 'إجمالي المرضى', 
    value: 248, 
    icon: Users, 
    color: 'bg-success/10 text-success',
    change: '+18 هذا الشهر'
  },
  { 
    title: 'إيرادات الشهر', 
    value: '3.2M', 
    icon: TrendingUp, 
    color: 'bg-accent/10 text-accent',
    change: '+22% عن الشهر الماضي'
  },
];

const todayAppointments = [
  { id: 1, patient: 'ليلى محمد', procedure: 'تنظيف وتبييض', time: '09:00', status: 'مكتمل' },
  { id: 2, patient: 'أحمد سالم', procedure: 'حشوة تجميلية', time: '10:30', status: 'جاري' },
  { id: 3, patient: 'نورا خالد', procedure: 'خلع ضرس العقل', time: '12:00', status: 'قادم' },
  { id: 4, patient: 'سامي علي', procedure: 'تركيب تقويم', time: '14:00', status: 'قادم' },
];

const popularServices = [
  { name: 'تنظيف الأسنان', count: 45, icon: Sparkles },
  { name: 'حشوات تجميلية', count: 32, icon: Smile },
  { name: 'تبييض الأسنان', count: 28, icon: Sparkles },
  { name: 'زراعة الأسنان', count: 15, icon: CheckCircle },
];

export default function DentalDashboard() {
  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في عيادة الأسنان 🦷</h1>
          <p className="text-muted-foreground">إليك ملخص نشاط العيادة اليوم</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  مواعيد اليوم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
                    <div 
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Smile className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{apt.patient}</p>
                          <p className="text-sm text-muted-foreground">{apt.procedure}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'مكتمل' 
                            ? 'bg-success/10 text-success' 
                            : apt.status === 'جاري'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {apt.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{apt.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع المواعيد
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Popular Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  الخدمات الأكثر طلباً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularServices.map((service, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <service.icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{service.count}</span>
                        <span className="text-sm text-muted-foreground">هذا الشهر</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProviderLayout>
  );
}
