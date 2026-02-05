import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  Mail, 
  Lock, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Building2,
  FlaskConical,
  Pill,
  UserRound,
  Shield,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserRole, SYRIAN_GOVERNORATES, MEDICAL_SPECIALIZATIONS } from '@/types';
import { toast } from 'sonner';

const roles: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'patient', label: 'مريض', icon: UserRound, description: 'احجز مواعيد وتابع صحتك' },
  { value: 'doctor', label: 'طبيب', icon: Stethoscope, description: 'قدم خدماتك الطبية' },
  { value: 'pharmacist', label: 'صيدلي', icon: Pill, description: 'إدارة الصيدلية' },
  { value: 'hospital', label: 'مستشفى', icon: Building2, description: 'إدارة المستشفى' },
  { value: 'laboratory', label: 'مختبر', icon: FlaskConical, description: 'إدارة المختبر' },
];

const step1Schema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'doctor', 'pharmacist', 'hospital', 'laboratory', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمة المرور غير متطابقة',
  path: ['confirmPassword'],
});

const step2PatientSchema = z.object({
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
});

const step2ProviderSchema = z.object({
  licenseNumber: z.string().min(5, 'رقم الترخيص مطلوب'),
  specialization: z.string().min(1, 'التخصص مطلوب'),
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
  address: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل'),
});

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';
  const [isLogin, setIsLogin] = useState(!isSignup);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, setDemoUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient' as UserRole,
    },
  });

  const step2Form = useForm({
    defaultValues: {
      birthDate: '',
      gender: '' as 'male' | 'female' | '',
      licenseNumber: '',
      specialization: '',
      governorate: '',
      address: '',
    },
  });

  const selectedRole = form.watch('role');
  const isProvider = ['doctor', 'pharmacist', 'hospital', 'laboratory'].includes(selectedRole);

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/');
      }
    } catch (error) {
      toast.error('حدث خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupStep1 = async (data: any) => {
    if (data.role === 'patient') {
      setStep(2);
    } else {
      setStep(2);
    }
  };

  const handleSignupStep2 = async (data: any) => {
    setIsLoading(true);
    try {
      const step1Data = form.getValues();
      const success = await signup({ ...step1Data, ...data });
      if (success) {
        toast.success('تم إنشاء الحساب بنجاح');
        navigate('/');
      }
    } catch (error) {
      toast.error('حدث خطأ في إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    setDemoUser(role);
    toast.success(`تم الدخول كـ ${role === 'patient' ? 'مريض' : role === 'doctor' ? 'طبيب' : 'مدير'} (عرض تجريبي)`);
    if (role === 'patient') {
      navigate('/');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/provider');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Stethoscope className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">شريكك الطبي</span>
          </Link>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h1 className="text-3xl font-bold mb-2">مرحباً بعودتك</h1>
                <p className="text-muted-foreground mb-8">أدخل بياناتك لتسجيل الدخول</p>

                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        {...form.register('email')}
                        type="email" 
                        placeholder="example@email.com"
                        className="pr-10"
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        {...form.register('password')}
                        type="password" 
                        placeholder="••••••••"
                        className="pr-10"
                      />
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                  </Button>
                </form>

                {/* Demo Buttons */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-4">أو جرب الدخول السريع</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDemoLogin('patient')}>
                      مريض
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDemoLogin('doctor')}>
                      طبيب
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin')}>
                      مدير
                    </Button>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  ليس لديك حساب؟{' '}
                  <button 
                    onClick={() => setIsLogin(false)} 
                    className="text-primary font-medium hover:underline"
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h1 className="text-3xl font-bold mb-2">إنشاء حساب جديد</h1>
                      <p className="text-muted-foreground mb-8">الخطوة 1 من 2 - البيانات الأساسية</p>

                      <form onSubmit={form.handleSubmit(handleSignupStep1)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">الاسم الكامل</Label>
                          <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                              {...form.register('name')}
                              placeholder="أدخل اسمك الكامل"
                              className="pr-10"
                            />
                          </div>
                          {form.formState.errors.name && (
                            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                              {...form.register('email')}
                              type="email" 
                              placeholder="example@email.com"
                              className="pr-10"
                            />
                          </div>
                          {form.formState.errors.email && (
                            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <div className="relative">
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input 
                                {...form.register('password')}
                                type="password" 
                                placeholder="••••••••"
                                className="pr-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                            <Input 
                              {...form.register('confirmPassword')}
                              type="password" 
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                        {form.formState.errors.password && (
                          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                        )}
                        {form.formState.errors.confirmPassword && (
                          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                        )}

                        <div className="space-y-2">
                          <Label>نوع الحساب</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {roles.map((role) => (
                              <button
                                key={role.value}
                                type="button"
                                onClick={() => form.setValue('role', role.value)}
                                className={`p-4 rounded-xl border-2 transition-all text-right ${
                                  selectedRole === role.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <role.icon className={`h-6 w-6 mb-2 ${
                                  selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                                }`} />
                                <p className="font-medium">{role.label}</p>
                                <p className="text-xs text-muted-foreground">{role.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <Button type="submit" variant="hero" size="lg" className="w-full">
                          التالي
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setStep(1)}
                        className="mb-4"
                      >
                        <ChevronRight className="h-4 w-4" />
                        رجوع
                      </Button>
                      
                      <h1 className="text-3xl font-bold mb-2">
                        {isProvider ? 'بيانات المزود' : 'البيانات الشخصية'}
                      </h1>
                      <p className="text-muted-foreground mb-8">الخطوة 2 من 2 - أكمل بياناتك</p>

                      <form onSubmit={step2Form.handleSubmit(handleSignupStep2)} className="space-y-4">
                        {isProvider ? (
                          <>
                            <div className="space-y-2">
                              <Label>رقم الترخيص</Label>
                              <div className="relative">
                                <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  {...step2Form.register('licenseNumber')}
                                  placeholder="SY-MED-2024-XXX"
                                  className="pr-10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>التخصص</Label>
                              <Select onValueChange={(v) => step2Form.setValue('specialization', v)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر التخصص" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MEDICAL_SPECIALIZATIONS.map((spec) => (
                                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>المحافظة</Label>
                              <Select onValueChange={(v) => step2Form.setValue('governorate', v)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المحافظة" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SYRIAN_GOVERNORATES.map((gov) => (
                                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>العنوان التفصيلي</Label>
                              <div className="relative">
                                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  {...step2Form.register('address')}
                                  placeholder="الشارع، البناء، الطابق"
                                  className="pr-10"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label>تاريخ الميلاد</Label>
                              <div className="relative">
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  {...step2Form.register('birthDate')}
                                  type="date"
                                  className="pr-10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>الجنس</Label>
                              <Select onValueChange={(v: 'male' | 'female') => step2Form.setValue('gender', v)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الجنس" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">ذكر</SelectItem>
                                  <SelectItem value="female">أنثى</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                          {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  لديك حساب بالفعل؟{' '}
                  <button 
                    onClick={() => { setIsLogin(true); setStep(1); }} 
                    className="text-primary font-medium hover:underline"
                  >
                    تسجيل الدخول
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-bl from-primary/90 to-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pattern-medical opacity-20" />
        <div className="relative z-10 text-center text-primary-foreground">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-foreground/20 backdrop-blur-sm mx-auto mb-8">
              <Shield className="h-12 w-12" />
            </div>
            <h2 className="text-4xl font-bold mb-4">منصتك الطبية الموثوقة</h2>
            <p className="text-lg text-primary-foreground/80 max-w-md mx-auto">
              احجز موعدك مع أفضل الأطباء في سوريا، واحصل على استشارات طبية موثوقة
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            {[
              { value: '+500', label: 'طبيب معتمد' },
              { value: '+10K', label: 'مريض مسجل' },
              { value: '14', label: 'محافظة' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-primary-foreground/70">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
