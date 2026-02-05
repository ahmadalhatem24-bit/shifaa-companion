import { useState } from 'react';
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
  Filter
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

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';

interface PatientAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  specialization: string;
  governorate: string;
  address: string;
  date: Date;
  time: string;
  status: BookingStatus;
  consultationFee: number;
  notes?: string;
  rejectionReason?: string;
  createdAt: Date;
}

const mockPatientAppointments: PatientAppointment[] = [
  {
    id: 'apt1',
    doctorId: '1',
    doctorName: 'د. أحمد الخطيب',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    specialization: 'طب قلب وأوعية',
    governorate: 'دمشق',
    address: 'شارع الثورة، بناء الأمل',
    date: new Date(Date.now() + 86400000 * 2),
    time: '10:00',
    status: 'confirmed',
    consultationFee: 50000,
    notes: 'فحص دوري للقلب',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'apt2',
    doctorId: '2',
    doctorName: 'د. فاطمة العلي',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    specialization: 'طب أطفال',
    governorate: 'دمشق',
    address: 'المزة، شارع الفيحاء',
    date: new Date(Date.now() + 86400000 * 5),
    time: '14:30',
    status: 'pending',
    consultationFee: 35000,
    createdAt: new Date(),
  },
  {
    id: 'apt3',
    doctorId: '3',
    doctorName: 'د. عمر حسن',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face',
    specialization: 'طب عظام',
    governorate: 'حلب',
    address: 'حلب الجديدة',
    date: new Date(Date.now() - 86400000 * 7),
    time: '11:00',
    status: 'completed',
    consultationFee: 45000,
    createdAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: 'apt4',
    doctorId: '4',
    doctorName: 'د. لينا محمود',
    doctorAvatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face',
    specialization: 'طب جلدية',
    governorate: 'حمص',
    address: 'شارع الحضارة',
    date: new Date(Date.now() - 86400000 * 3),
    time: '16:00',
    status: 'rejected',
    consultationFee: 40000,
    rejectionReason: 'الموعد محجوز مسبقاً، يرجى اختيار موعد آخر',
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'apt5',
    doctorId: '1',
    doctorName: 'د. أحمد الخطيب',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    specialization: 'طب قلب وأوعية',
    governorate: 'دمشق',
    address: 'شارع الثورة، بناء الأمل',
    date: new Date(Date.now() - 86400000 * 14),
    time: '09:30',
    status: 'completed',
    consultationFee: 50000,
    createdAt: new Date(Date.now() - 86400000 * 20),
  },
];

const statusConfig: Record<BookingStatus, { label: string; icon: any; className: string; bgClass: string }> = {
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
  rejected: { 
    label: 'مرفوض', 
    icon: XCircle, 
    className: 'text-destructive',
    bgClass: 'bg-destructive/10 border-destructive/30'
  },
  cancelled: { 
    label: 'ملغي', 
    icon: XCircle, 
    className: 'text-muted-foreground',
    bgClass: 'bg-muted border-muted-foreground/30'
  },
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState(mockPatientAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const filterByStatus = (status: BookingStatus | 'all' | 'upcoming') => {
    if (status === 'all') return appointments;
    if (status === 'upcoming') {
      return appointments.filter(apt => 
        (apt.status === 'confirmed' || apt.status === 'pending') && 
        new Date(apt.date) >= new Date()
      );
    }
    return appointments.filter(apt => apt.status === status);
  };

  const handleCancelAppointment = () => {
    if (!selectedAppointment) return;
    
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, status: 'cancelled' as BookingStatus } 
          : apt
      )
    );
    
    toast.success('تم إلغاء الموعد بنجاح');
    setShowCancelDialog(false);
    setSelectedAppointment(null);
    setCancelReason('');
  };

  const AppointmentCard = ({ appointment }: { appointment: PatientAppointment }) => {
    const status = statusConfig[appointment.status];
    const StatusIcon = status.icon;
    const isPast = new Date(appointment.date) < new Date();
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
            <img 
              src={appointment.doctorAvatar} 
              alt={appointment.doctorName}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
              <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{appointment.governorate}</span>
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
                {format(appointment.date, "d MMMM yyyy", { locale: ar })}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {appointment.time}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection Reason */}
        {appointment.status === 'rejected' && appointment.rejectionReason && (
          <div className="mt-4 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>سبب الرفض:</strong> {appointment.rejectionReason}</span>
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
            <p className="font-semibold text-primary">{appointment.consultationFee.toLocaleString()} ل.س</p>
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
            {appointment.status === 'rejected' && (
              <Button variant="hero" size="sm">
                إعادة الحجز
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

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
              <TabsTrigger value="rejected">مرفوضة</TabsTrigger>
            </TabsList>

            {['upcoming', 'pending', 'confirmed', 'completed', 'rejected'].map((status) => (
              <TabsContent key={status} value={status}>
                <div className="space-y-4">
                  {filterByStatus(status as BookingStatus | 'upcoming').length === 0 ? (
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
                          <a href="/doctors">احجز موعد جديد</a>
                        </Button>
                      )}
                    </div>
                  ) : (
                    filterByStatus(status as BookingStatus | 'upcoming').map((apt) => (
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
                  <img 
                    src={selectedAppointment.doctorAvatar} 
                    alt={selectedAppointment.doctorName}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{selectedAppointment.doctorName}</p>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{format(selectedAppointment.date, "d MMMM yyyy", { locale: ar })}</span>
                  <span>{selectedAppointment.time}</span>
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
