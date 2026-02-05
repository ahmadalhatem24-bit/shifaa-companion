import { motion } from 'framer-motion';
import { 
  Sparkles,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Star,
  Heart,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { 
    title: 'جلسات اليوم', 
    value: 8, 
    icon: Calendar, 
    color: 'bg-primary/10 text-primary',
    change: '+2 عن الأمس'
  },
  { 
    title: 'استشارات معلقة', 
    value: 6, 
    icon: Clock, 
    color: 'bg-warning/10 text-warning',
    change: 'بانتظار التأكيد'
  },
  { 
    title: 'إجمالي العملاء', 
    value: 312, 
    icon: Users, 
    color: 'bg-success/10 text-success',
    change: '+25 هذا الشهر'
  },
  { 
    title: 'إيرادات الشهر', 
    value: '8.5M', 
    icon: TrendingUp, 
    color: 'bg-accent/10 text-accent',
    change: '+30% عن الشهر الماضي'
  },
];

const todaySessions = [
  { id: 1, client: 'رنا أحمد', procedure: 'حقن بوتوكس', time: '10:00', status: 'مكتمل' },
  { id: 2, client: 'سارة محمد', procedure: 'فيلر شفاه', time: '11:30', status: 'جاري' },
  { id: 3, client: 'نور علي', procedure: 'ليزر إزالة الشعر', time: '13:00', status: 'قادم' },
  { id: 4, client: 'ليلى خالد', procedure: 'تقشير كيميائي', time: '15:00', status: 'قادم' },
];

const topProcedures = [
  { name: 'حقن البوتوكس', count: 42, rating: 4.9 },
  { name: 'فيلر الوجه', count: 38, rating: 4.8 },
  { name: 'ليزر إزالة الشعر', count: 55, rating: 4.7 },
  { name: 'تقشير البشرة', count: 30, rating: 4.9 },
];

export default function CosmeticDashboard() {
  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في مركز التجميل ✨</h1>
          <p className="text-muted-foreground">إليك ملخص نشاط المركز اليوم</p>
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
          {/* Today's Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  جلسات اليوم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaySessions.map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <Heart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{session.client}</p>
                          <p className="text-sm text-muted-foreground">{session.procedure}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === 'مكتمل' 
                            ? 'bg-success/10 text-success' 
                            : session.status === 'جاري'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {session.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{session.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع الجلسات
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Procedures */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  الإجراءات الأكثر طلباً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProcedures.map((procedure, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{procedure.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span>{procedure.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold">{procedure.count}</p>
                        <p className="text-xs text-muted-foreground">هذا الشهر</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Camera className="h-4 w-4 ml-2" />
                  معرض قبل وبعد
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProviderLayout>
  );
}
