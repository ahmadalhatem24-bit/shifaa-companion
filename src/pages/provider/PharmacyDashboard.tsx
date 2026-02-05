import { motion } from 'framer-motion';
import { 
  Pill,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { 
    title: 'طلبات اليوم', 
    value: 45, 
    icon: ShoppingCart, 
    color: 'bg-primary/10 text-primary',
    change: '+8 عن الأمس'
  },
  { 
    title: 'وصفات معلقة', 
    value: 12, 
    icon: FileText, 
    color: 'bg-warning/10 text-warning',
    change: 'بانتظار الصرف'
  },
  { 
    title: 'أدوية منخفضة المخزون', 
    value: 8, 
    icon: AlertTriangle, 
    color: 'bg-destructive/10 text-destructive',
    change: 'تحتاج إعادة طلب'
  },
  { 
    title: 'إيرادات الشهر', 
    value: '2.5M', 
    icon: TrendingUp, 
    color: 'bg-success/10 text-success',
    change: '+12% عن الشهر الماضي'
  },
];

const recentOrders = [
  { id: 1, customer: 'أحمد محمد', items: 3, total: 45000, status: 'جاهز', time: '10:30' },
  { id: 2, customer: 'فاطمة علي', items: 5, total: 78000, status: 'قيد التحضير', time: '10:45' },
  { id: 3, customer: 'محمود خالد', items: 2, total: 25000, status: 'بانتظار الدفع', time: '11:00' },
];

const lowStockMedications = [
  { name: 'باراسيتامول 500mg', stock: 15, minStock: 50 },
  { name: 'أموكسيسيلين 250mg', stock: 8, minStock: 30 },
  { name: 'أوميبرازول 20mg', stock: 12, minStock: 40 },
];

export default function PharmacyDashboard() {
  return (
    <ProviderLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في صيدليتك 💊</h1>
          <p className="text-muted-foreground">إليك ملخص نشاط الصيدلية اليوم</p>
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
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  أحدث الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.items} منتجات • {order.total.toLocaleString()} ل.س</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'جاهز' 
                            ? 'bg-success/10 text-success' 
                            : order.status === 'قيد التحضير'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {order.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع الطلبات
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Low Stock Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  تنبيه المخزون المنخفض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockMedications.map((med, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">الحد الأدنى: {med.minStock}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-destructive">{med.stock}</p>
                        <p className="text-xs text-muted-foreground">متبقي</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  إدارة المخزون
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProviderLayout>
  );
}
