import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Calendar,
  Check,
  X,
  Clock,
  User,
  MoreVertical,
  MessageSquare,
  Phone,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { AppointmentStatus } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ProviderAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  patientPhone: string;
  patientAge: number;
  date: Date;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  rejectionReason?: string;
  createdAt: Date;
}

const mockProviderAppointments: ProviderAppointment[] = [
  {
    id: 'apt1',
    patientId: 'p1',
    patientName: 'محمد العمر',
    patientPhone: '+963 11 777 8888',
    patientAge: 35,
    date: new Date(),
    time: '10:00',
    status: 'pending',
    notes: 'فحص دوري للقلب',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'apt2',
    patientId: 'p2',
    patientName: 'سارة أحمد',
    patientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    patientPhone: '+963 11 888 9999',
    patientAge: 28,
    date: new Date(),
    time: '11:30',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'apt3',
    patientId: 'p3',
    patientName: 'أحمد خالد',
    patientPhone: '+963 11 999 0000',
    patientAge: 45,
    date: new Date(Date.now() + 86400000),
    time: '09:00',
    status: 'confirmed',
    notes: 'متابعة حالة ضغط الدم',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'apt4',
    patientId: 'p4',
    patientName: 'فاطمة علي',
    patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    patientPhone: '+963 11 111 2222',
    patientAge: 32,
    date: new Date(Date.now() - 86400000),
    time: '14:00',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'apt5',
    patientId: 'p5',
    patientName: 'خالد محمود',
    patientPhone: '+963 11 222 3333',
    patientAge: 50,
    date: new Date(Date.now() - 86400000 * 2),
    time: '16:00',
    status: 'cancelled',
    rejectionReason: 'طلب المريض إلغاء الموعد',
    createdAt: new Date(Date.now() - 86400000 * 4),
  },
];

const statusConfig = {
  pending: { 
    label: 'بانتظار الموافقة', 
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  confirmed: { 
    label: 'مؤكد', 
    className: 'bg-success/10 text-success border-success/30',
  },
  completed: { 
    label: 'مكتمل', 
    className: 'bg-muted text-muted-foreground border-muted-foreground/30',
  },
  cancelled: { 
    label: 'ملغي', 
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState(mockProviderAppointments);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ProviderAppointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const updateStatus = (id: string, status: AppointmentStatus, reason?: string) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status, rejectionReason: reason } : apt)
    );
    
    const messages = {
      confirmed: 'تم تأكيد الموعد وإشعار المريض',
      completed: 'تم إكمال الموعد بنجاح',
      cancelled: 'تم رفض الموعد وإشعار المريض',
    };
    
    toast.success(messages[status] || 'تم تحديث الموعد');
  };

  const handleReject = () => {
    if (selectedAppointment) {
      updateStatus(selectedAppointment.id, 'cancelled', rejectReason);
      setShowRejectDialog(false);
      setSelectedAppointment(null);
      setRejectReason('');
    }
  };

  const filterByStatus = (status: AppointmentStatus | 'all') => {
    if (status === 'all') return appointments;
    return appointments.filter(apt => apt.status === status);
  };

  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold mb-1">إدارة المواعيد</h1>
            <p className="text-muted-foreground">إدارة طلبات الحجز ومتابعة المواعيد</p>
          </div>
          {pendingCount > 0 && (
            <div className="px-4 py-2 bg-warning/10 rounded-lg border border-warning/30">
              <p className="text-warning font-medium">
                {pendingCount} طلب بانتظار الموافقة
              </p>
            </div>
          )}
        </motion.div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              بانتظار الموافقة
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning text-warning-foreground text-xs flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">مؤكدة</TabsTrigger>
            <TabsTrigger value="completed">مكتملة</TabsTrigger>
            <TabsTrigger value="cancelled">ملغاة</TabsTrigger>
          </TabsList>

          {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="space-y-4">
                {filterByStatus(status as AppointmentStatus).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">لا توجد مواعيد</p>
                  </div>
                ) : (
                  filterByStatus(status as AppointmentStatus).map((apt, i) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "medical-card p-6 border-r-4",
                        apt.status === 'pending' && "border-r-warning",
                        apt.status === 'confirmed' && "border-r-success",
                        apt.status === 'completed' && "border-r-muted-foreground",
                        apt.status === 'cancelled' && "border-r-destructive"
                      )}
                    >
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Patient Info */}
                        <div className="flex items-start gap-4 flex-1">
                          {apt.patientAvatar ? (
                            <img 
                              src={apt.patientAvatar} 
                              alt={apt.patientName}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                              <User className="h-7 w-7 text-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{apt.patientName}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{apt.patientAge} سنة</span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span dir="ltr">{apt.patientPhone}</span>
                              </span>
                            </div>
                            {apt.notes && (
                              <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {apt.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Date & Actions */}
                        <div className="flex flex-col items-start lg:items-end gap-3">
                          <span className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium border",
                            statusConfig[apt.status].className
                          )}>
                            {statusConfig[apt.status].label}
                          </span>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="h-4 w-4 text-primary" />
                              {format(apt.date, "d MMMM yyyy", { locale: ar })}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="h-4 w-4 text-primary" />
                              {apt.time}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-2">
                            {apt.status === 'pending' && (
                              <>
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
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                  رفض
                                </Button>
                              </>
                            )}

                            {apt.status === 'confirmed' && (
                              <>
                                <Button variant="hero" size="sm" asChild>
                                  <Link to={`/provider/patients/${apt.patientId}`}>
                                    <FileText className="h-4 w-4" />
                                    الملف الطبي
                                  </Link>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => updateStatus(apt.id, 'completed')}>
                                      <Check className="h-4 w-4 ml-2" />
                                      تم الفحص
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setSelectedAppointment(apt);
                                        setShowRejectDialog(true);
                                      }}
                                      className="text-destructive"
                                    >
                                      <X className="h-4 w-4 ml-2" />
                                      إلغاء الموعد
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}

                            {apt.status === 'completed' && (
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/provider/patients/${apt.patientId}`}>
                                  <FileText className="h-4 w-4" />
                                  عرض الملف
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {apt.status === 'cancelled' && apt.rejectionReason && (
                        <div className="mt-4 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <p className="text-sm text-destructive">
                            <strong>سبب الإلغاء:</strong> {apt.rejectionReason}
                          </p>
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>رفض طلب الحجز</DialogTitle>
            <DialogDescription>
              سيتم إشعار المريض برفض طلب الحجز
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedAppointment && (
              <div className="p-4 bg-secondary/50 rounded-xl">
                <p className="font-medium">{selectedAppointment.patientName}</p>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  <span>{format(selectedAppointment.date, "d MMMM yyyy", { locale: ar })}</span>
                  <span>{selectedAppointment.time}</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="rejectReason">سبب الرفض (سيظهر للمريض)</Label>
              <Textarea
                id="rejectReason"
                placeholder="مثال: الموعد محجوز مسبقاً، يرجى اختيار موعد آخر"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedAppointment(null);
                  setRejectReason('');
                }}
              >
                تراجع
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleReject}
              >
                تأكيد الرفض
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProviderLayout>
  );
}
