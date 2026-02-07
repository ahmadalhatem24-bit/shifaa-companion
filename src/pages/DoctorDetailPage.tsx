import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar,
  Shield,
  MessageSquare,
  ChevronRight,
  Check,
  User,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientNavbar } from '@/components/layout/PatientNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00'
];

const workingDays = [
  { day: 'الأحد', hours: '09:00 - 18:00', isOpen: true },
  { day: 'الإثنين', hours: '09:00 - 18:00', isOpen: true },
  { day: 'الثلاثاء', hours: '09:00 - 18:00', isOpen: true },
  { day: 'الأربعاء', hours: '09:00 - 18:00', isOpen: true },
  { day: 'الخميس', hours: '09:00 - 14:00', isOpen: true },
  { day: 'الجمعة', hours: 'مغلق', isOpen: false },
  { day: 'السبت', hours: 'مغلق', isOpen: false },
];

interface Provider {
  id: string;
  name: string;
  avatar_url: string | null;
  specialization: string | null;
  governorate: string | null;
  address: string | null;
  bio: string | null;
  phone: string | null;
  consultation_fee: number | null;
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  patient_id: string;
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [doctor, setDoctor] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDoctor();
      fetchReviews();
    }
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('خطأ في تحميل بيانات الطبيب');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated || !user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/auth');
      return;
    }

    if (!selectedDate || !selectedTime || !doctor) {
      toast.error('الرجاء اختيار التاريخ والوقت');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          provider_id: doctor.id,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          notes: notes || null,
          status: 'pending'
        });

      if (error) throw error;

      setShowBookingDialog(false);
      setShowSuccessDialog(true);
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime(null);
      setNotes('');
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(error.message || 'حدث خطأ أثناء إرسال طلب الحجز');
    } finally {
      setIsSubmitting(false);
    }
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

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <PatientNavbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">الطبيب غير موجود</h1>
          <Button onClick={() => navigate('/doctors')}>العودة للأطباء</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-bl from-primary/5 to-background py-8">
        <div className="container">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/doctors')}
            className="mb-4"
          >
            <ChevronRight className="h-4 w-4" />
            العودة للأطباء
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-8"
          >
            {/* Doctor Info Card */}
            <div className="flex-1">
              <div className="medical-card p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {doctor.avatar_url ? (
                    <img 
                      src={doctor.avatar_url} 
                      alt={doctor.name}
                      className="h-32 w-32 rounded-2xl object-cover mx-auto sm:mx-0"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto sm:mx-0">
                      <User className="h-16 w-16 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{doctor.name}</h1>
                      {doctor.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                          <Shield className="h-3 w-3" />
                          معتمد
                        </span>
                      )}
                    </div>
                    <p className="text-primary font-medium mb-2">{doctor.specialization}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1 mb-4">
                      <Star className="h-5 w-5 fill-warning text-warning" />
                      <span className="font-semibold">{doctor.rating || 0}</span>
                      <span className="text-muted-foreground">({doctor.review_count || 0} تقييم)</span>
                    </div>
                    <p className="text-muted-foreground mb-4">{doctor.bio || 'لا يوجد وصف'}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {doctor.governorate}
                      </span>
                      {doctor.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span dir="ltr">{doctor.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">العنوان الكامل</p>
                  <p className="font-medium">{doctor.address}، {doctor.governorate}</p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="medical-card p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  ساعات العمل
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {workingDays.map((day) => (
                    <div 
                      key={day.day}
                      className={cn(
                        "p-3 rounded-lg text-center",
                        day.isOpen ? "bg-success/10" : "bg-muted"
                      )}
                    >
                      <p className="font-medium text-sm">{day.day}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        day.isOpen ? "text-success" : "text-muted-foreground"
                      )}>
                        {day.hours}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="medical-card p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  التقييمات ({reviews.length})
                </h2>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">لا توجد تقييمات بعد</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">مريض</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Card */}
            <div className="w-full md:w-96">
              <div className="medical-card p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">احجز موعدك</h2>
                
                <div className="p-4 bg-primary/5 rounded-xl mb-6">
                  <p className="text-sm text-muted-foreground">رسوم الكشفية</p>
                  <p className="text-3xl font-bold text-primary">
                    {(doctor.consultation_fee || 0).toLocaleString()} <span className="text-lg">ل.س</span>
                  </p>
                </div>

                {/* Date Picker */}
                <div className="mb-4">
                  <Label className="mb-2 block">اختر التاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="ml-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => 
                          date < new Date() || 
                          date.getDay() === 5 || 
                          date.getDay() === 6
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4"
                  >
                    <Label className="mb-2 block">اختر الوقت</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "p-2 rounded-lg text-sm font-medium transition-all",
                            selectedTime === time
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={() => setShowBookingDialog(true)}
                  disabled={!selectedDate || !selectedTime}
                >
                  تأكيد الحجز
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  سيتم تأكيد الموعد بعد موافقة الطبيب
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تأكيد طلب الحجز</DialogTitle>
            <DialogDescription>
              راجع تفاصيل الحجز قبل الإرسال
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-xl space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الطبيب:</span>
                <span className="font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التخصص:</span>
                <span>{doctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التاريخ:</span>
                <span>{selectedDate && format(selectedDate, "PPP", { locale: ar })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الوقت:</span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">الكشفية:</span>
                <span className="font-bold text-primary">{(doctor.consultation_fee || 0).toLocaleString()} ل.س</span>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
              <Textarea
                id="notes"
                placeholder="أضف أي ملاحظات تريد إرسالها للطبيب..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowBookingDialog(false)}
              >
                إلغاء
              </Button>
              <Button 
                variant="hero" 
                className="flex-1"
                onClick={handleBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال طلب الحجز'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-4"
          >
            <Check className="h-10 w-10 text-success" />
          </motion.div>
          <DialogHeader>
            <DialogTitle className="text-center">تم إرسال طلب الحجز بنجاح!</DialogTitle>
            <DialogDescription className="text-center">
              سيتم إشعارك فور موافقة الطبيب على موعدك
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/appointments');
              }}
            >
              عرض مواعيدي
            </Button>
            <Button 
              variant="hero" 
              className="flex-1"
              onClick={() => setShowSuccessDialog(false)}
            >
              حسناً
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
