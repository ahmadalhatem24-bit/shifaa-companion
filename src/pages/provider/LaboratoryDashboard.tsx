import { motion } from 'framer-motion';
import { 
  FlaskConical,
  Clock,
  CheckCircle,
  FileText,
  TrendingUp,
  Users,
  AlertCircle,
  Microscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const stats = [
  { 
    title: 'تحاليل اليوم', 
    value: 32, 
    icon: FlaskConical, 
    color: 'bg-primary/10 text-primary',
    change: '+5 عن الأمس'
  },
  { 
    title: 'قيد الانتظار', 
    value: 8, 
    icon: Clock, 
    color: 'bg-warning/10 text-warning',
    change: 'بانتظار العينات'
  },
  { 
    title: 'مكتملة اليوم', 
    value: 24, 
    icon: CheckCircle, 
    color: 'bg-success/10 text-success',
    change: '75% من الإجمالي'
  },
  { 
    title: 'إيرادات الشهر', 
    value: '1.8M', 
    icon: TrendingUp, 
    color: 'bg-accent/10 text-accent',
    change: '+18% عن الشهر الماضي'
  },
];

const pendingTests = [
  { id: 1, patient: 'سارة أحمد', test: 'تحليل دم شامل', priority: 'عادي', time: '09:30' },
  { id: 2, patient: 'خالد محمد', test: 'وظائف الكبد', priority: 'مستعجل', time: '10:00' },
  { id: 3, patient: 'نور علي', test: 'سكر صيامي', priority: 'عادي', time: '10:30' },
  { id: 4, patient: 'أمل حسن', test: 'هرمونات الغدة', priority: 'عادي', time: '11:00' },
];

const testCategories = [
  { name: 'تحاليل الدم', count: 45, percentage: 35 },
  { name: 'تحاليل البول', count: 28, percentage: 22 },
  { name: 'الهرمونات', count: 20, percentage: 16 },
  { name: 'وظائف الأعضاء', count: 18, percentage: 14 },
  { name: 'أخرى', count: 16, percentage: 13 },
];

export default function LaboratoryDashboard() {
  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في المختبر 🔬</h1>
          <p className="text-muted-foreground">إليك ملخص نشاط المختبر اليوم</p>
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
          {/* Pending Tests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  التحاليل المعلقة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTests.map((test) => (
                    <div 
                      key={test.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Microscope className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{test.patient}</p>
                          <p className="text-sm text-muted-foreground">{test.test}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          test.priority === 'مستعجل' 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {test.priority}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{test.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع التحاليل
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Test Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  توزيع التحاليل حسب النوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testCategories.map((category, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{category.count} تحليل</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
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
