import { motion } from 'framer-motion';
import { 
  Building2,
  Bed,
  Users,
  Ambulance,
  TrendingUp,
  Calendar,
  Activity,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const stats = [
  { 
    title: 'المرضى المنومين', 
    value: 156, 
    icon: Bed, 
    color: 'bg-primary/10 text-primary',
    change: '78% نسبة الإشغال'
  },
  { 
    title: 'مواعيد اليوم', 
    value: 89, 
    icon: Calendar, 
    color: 'bg-warning/10 text-warning',
    change: '+12 عن الأمس'
  },
  { 
    title: 'حالات الطوارئ', 
    value: 15, 
    icon: Ambulance, 
    color: 'bg-destructive/10 text-destructive',
    change: 'آخر 24 ساعة'
  },
  { 
    title: 'إيرادات الشهر', 
    value: '45M', 
    icon: TrendingUp, 
    color: 'bg-success/10 text-success',
    change: '+8% عن الشهر الماضي'
  },
];

const departments = [
  { name: 'الطوارئ', patients: 28, capacity: 30, status: 'مرتفع' },
  { name: 'الباطنية', patients: 42, capacity: 50, status: 'متوسط' },
  { name: 'الجراحة', patients: 35, capacity: 40, status: 'مرتفع' },
  { name: 'الأطفال', patients: 25, capacity: 35, status: 'منخفض' },
  { name: 'القلب', patients: 18, capacity: 25, status: 'متوسط' },
];

const recentAdmissions = [
  { id: 1, patient: 'محمد أحمد', department: 'الطوارئ', doctor: 'د. سامر', time: '08:30' },
  { id: 2, patient: 'فاطمة علي', department: 'الباطنية', doctor: 'د. رنا', time: '09:15' },
  { id: 3, patient: 'عمر خالد', department: 'الجراحة', doctor: 'د. أحمد', time: '10:00' },
];

export default function HospitalDashboard() {
  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في لوحة تحكم المشفى 🏥</h1>
          <p className="text-muted-foreground">إليك ملخص نشاط المشفى اليوم</p>
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
          {/* Department Occupancy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  إشغال الأقسام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{dept.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            dept.status === 'مرتفع' 
                              ? 'bg-destructive/10 text-destructive' 
                              : dept.status === 'متوسط'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          }`}>
                            {dept.status}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {dept.patients}/{dept.capacity}
                        </span>
                      </div>
                      <Progress 
                        value={(dept.patients / dept.capacity) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Admissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  أحدث حالات الدخول
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAdmissions.map((admission) => (
                    <div 
                      key={admission.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{admission.patient}</p>
                          <p className="text-sm text-muted-foreground">{admission.department} • {admission.doctor}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{admission.time}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع الحالات
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProviderLayout>
  );
}
