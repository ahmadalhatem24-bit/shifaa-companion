import { motion } from 'framer-motion';
import { 
  Calendar,
  Check,
  X,
  Clock,
  User,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { mockAppointments } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { AppointmentStatus } from '@/types';
import { toast } from 'sonner';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments);

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status } : apt)
    );
    const statusText = status === 'confirmed' ? 'تم تأكيد' : status === 'cancelled' ? 'تم إلغاء' : 'تم تحديث';
    toast.success(`${statusText} الموعد بنجاح`);
  };

  const filterByStatus = (status: AppointmentStatus | 'all') => {
    if (status === 'all') return appointments;
    return appointments.filter(apt => apt.status === status);
  };

  const statusConfig = {
    pending: { label: 'معلق', class: 'badge-pending', icon: Clock },
    confirmed: { label: 'مؤكد', class: 'badge-confirmed', icon: Check },
    completed: { label: 'مكتمل', class: 'bg-muted text-muted-foreground', icon: Check },
    cancelled: { label: 'ملغي', class: 'badge-cancelled', icon: X },
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">إدارة المواعيد</h1>
          <p className="text-muted-foreground">إدارة ومتابعة جميع مواعيدك</p>
        </motion.div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-5">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="pending">معلق</TabsTrigger>
            <TabsTrigger value="confirmed">مؤكد</TabsTrigger>
            <TabsTrigger value="completed">مكتمل</TabsTrigger>
            <TabsTrigger value="cancelled">ملغي</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="space-y-4">
                {filterByStatus(status as AppointmentStatus | 'all').length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    لا توجد مواعيد
                  </div>
                ) : (
                  filterByStatus(status as AppointmentStatus | 'all').map((apt, i) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="medical-card p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <User className="h-7 w-7" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{apt.patientName}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {apt.date.toLocaleDateString('ar-SY')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {apt.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[apt.status].class}`}>
                            {statusConfig[apt.status].label}
                          </span>
                          
                          {apt.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => updateStatus(apt.id, 'confirmed')}
                              >
                                <Check className="h-4 w-4" />
                                قبول
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => updateStatus(apt.id, 'cancelled')}
                              >
                                <X className="h-4 w-4" />
                                رفض
                              </Button>
                            </div>
                          )}

                          {apt.status === 'confirmed' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateStatus(apt.id, 'completed')}>
                                  تم الفحص
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateStatus(apt.id, 'cancelled')}
                                  className="text-destructive"
                                >
                                  إلغاء الموعد
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      {apt.notes && (
                        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">ملاحظات: {apt.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ProviderLayout>
  );
}
