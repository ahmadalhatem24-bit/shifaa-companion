import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientNavbar } from '@/components/layout/PatientNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';

type AppointmentStatus = Database['public']['Enums']['appointment_status'];

interface PatientAppointment {
  id: string;
  provider_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes: string | null;
  cancel_reason: string | null;
  created_at: string;
  providers?: {
    name: string;
    avatar_url: string | null;
    specialization: string | null;
    governorate: string | null;
    address: string | null;
    consultation_fee: number | null;
  };
}

const statusConfig: Record<AppointmentStatus, { label: string; icon: any; className: string; bgClass: string }> = {
  pending: { 
    label: 'بانتظار الموافقة', 
    icon: Clock3, 
    className: 'text-warning',
    bgClass: 'bg-warning/10 border-warning/30'
  },
  confirmed: { 
    label: 'تمت الموافقة', 
    icon: CheckCircle2, 
    className: 'text-success',
    bgClass: 'bg-success/10 border-success/30'
  },
  completed: { 
    label: 'منتهي', 
    icon: CheckCircle2, 
    className: 'text-muted-foreground',
    bgClass: 'bg-muted border-muted-foreground/30'
  },
  cancelled: { 
    label: 'ملغي', 
    icon: XCircle, 
    className: 'text-destructive',
    bgClass: 'bg-destructive/10 border-destructive/30'
  },
};

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          providers (
            name,
            avatar_url,
            specialization,
            governorate,
            address,
            consultation_fee
          )
        `)
        .eq('patient_id', user?.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('خطأ في تحميل المواعيد');
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (status: AppointmentStatus | 'all' | 'upcoming') => {
    if (status === 'all') return appointments;
    if (status === 'upcoming') {
      return appointments.filter(apt => 
        (apt.status === 'confirmed' || apt.status === 'pending') && 
        new Date(apt.appointment_date) >= new Date(new Date().toDateString())
      );
    }
    return appointments.filter(apt => apt.status === status);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          cancel_reason: cancelReason || 'إلغاء من قبل المريض'
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: 'cancelled' as AppointmentStatus, cancel_reason: cancelReason } 
            : apt
        )
      );
      
      toast.success('تم إلغاء الموعد بنجاح');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('خطأ في إلغاء الموعد');
    } finally {
      setShowCancelDialog(false);
      setSelectedAppointment(null);
      setCancelReason('');
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: PatientAppointment }) => {
    const status = statusConfig[appointment.status];
    const StatusIcon = status.icon;
    const isPast = new Date(appointment.appointment_date) < new Date(new Date().toDateString());
    const canCancel = appointment.status === 'pending' || 
                      (appointment.status === 'confirmed' && !isPast);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "medical-card p-6 border-r-4",
          status.bgClass
        )}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Doctor Info */}
          <div className="flex items-start gap-4 flex-1">
            {appointment.providers?.avatar_url ? (
              <img 
                src={appointment.providers.avatar_url} 
                alt={appointment.providers.name}
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-7 w-7 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{appointment.providers?.name || 'طبيب'}</h3>
              <p className="text-sm text-muted-foreground">{appointment.providers?.specialization}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{appointment.providers?.governorate}</span>
              </div>
            </div>
          </div>

          {/* Date & Status */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border",
              status.bgClass,
              status.className
            )}>
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(appointment.appointment_date), "d MMMM yyyy", { locale: ar })}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {appointment.appointment_time}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Reason */}
        {appointment.status === 'cancelled' && appointment.cancel_reason && (
          <div className="mt-4 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>سبب الإلغاء:</strong> {appointment.cancel_reason}</span>
            </p>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>ملاحظات:</strong> {appointment.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">الكشفية</span>
            <p className="font-semibold text-primary">
              {(appointment.providers?.consultation_fee || 0).toLocaleString()} ل.س
            </p>
          </div>
          <div className="flex gap-2">
            {canCancel && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowCancelDialog(true);
                }}
              >
                إلغاء الموعد
              </Button>
            )}
            {appointment.status === 'cancelled' && (
              <Button variant="hero" size="sm" asChild>
                <Link to={`/doctors/${appointment.provider_id}`}>
                  إعادة الحجز
                </Link>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PatientNavbar />
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      <section className="py-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">مواعيدي</h1>
            <p className="text-muted-foreground">إدارة ومتابعة جميع مواعيدك الطبية</p>
          </motion.div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-5 mb-8">
              <TabsTrigger value="upcoming" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                القادمة
              </TabsTrigger>
              <TabsTrigger value="pending">بانتظار الموافقة</TabsTrigger>
              <TabsTrigger value="confirmed">مؤكدة</TabsTrigger>
              <TabsTrigger value="completed">منتهية</TabsTrigger>
              <TabsTrigger value="cancelled">ملغاة</TabsTrigger>
            </TabsList>

            {(['upcoming', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
              <TabsContent key={status} value={status}>
                <div className="space-y-4">
                  {filterByStatus(status).length === 0 ? (
                    <div className="text-center py-20">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-medium text-muted-foreground">لا توجد مواعيد</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {status === 'upcoming' ? 'ليس لديك أي مواعيد قادمة' : 'لا توجد مواعيد في هذه الفئة'}
                      </p>
                      {status === 'upcoming' && (
                        <Button variant="hero" className="mt-4" asChild>
                          <Link to="/doctors">احجز موعد جديد</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    filterByStatus(status).map((apt) => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إلغاء الموعد</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  {selectedAppointment.providers?.avatar_url ? (
                    <img 
                      src={selectedAppointment.providers.avatar_url} 
                      alt={selectedAppointment.providers.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedAppointment.providers?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.providers?.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{format(new Date(selectedAppointment.appointment_date), "d MMMM yyyy", { locale: ar })}</span>
                  <span>{selectedAppointment.appointment_time}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="cancelReason">سبب الإلغاء (اختياري)</Label>
                <Textarea
                  id="cancelReason"
                  placeholder="أضف سبب الإلغاء..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowCancelDialog(false);
                    setSelectedAppointment(null);
                    setCancelReason('');
                  }}
                >
                  تراجع
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleCancelAppointment}
                >
                  تأكيد الإلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
