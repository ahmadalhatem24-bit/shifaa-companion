import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowLeft,
  Stethoscope,
  SmilePlus,
  Pill,
  Building2,
  FlaskConical,
  Sparkles,
  Clock,
  Shield,
  Heart,
  ChevronLeft,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PatientNavbar } from '@/components/layout/PatientNavbar';
import { SYRIAN_GOVERNORATES } from '@/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedDoctor {
  id: string;
  name: string;
  specialization: string | null;
  governorate: string | null;
  avatar_url: string | null;
  consultation_fee: number | null;
  rating: number | null;
  review_count: number | null;
}

const services = [
  { 
    title: 'الأطباء', 
    description: 'احجز موعد مع أفضل الأطباء', 
    icon: Stethoscope, 
    href: '/doctors',
    color: 'bg-primary/10 text-primary'
  },
  { 
    title: 'طب الأسنان', 
    description: 'عيادات أسنان متخصصة', 
    icon: SmilePlus, 
    href: '/dental',
    color: 'bg-info/10 text-info'
  },
  { 
    title: 'الصيدليات', 
    description: 'صيدليات على مدار الساعة', 
    icon: Pill, 
    href: '/pharmacies',
    color: 'bg-success/10 text-success'
  },
  { 
    title: 'المستشفيات', 
    description: 'مستشفيات ومراكز طبية', 
    icon: Building2, 
    href: '/hospitals',
    color: 'bg-accent/10 text-accent'
  },
  { 
    title: 'المختبرات', 
    description: 'تحاليل طبية دقيقة', 
    icon: FlaskConical, 
    href: '/labs',
    color: 'bg-warning/10 text-warning'
  },
  { 
    title: 'التجميل', 
    description: 'عيادات تجميل متميزة', 
    icon: Sparkles, 
    href: '/cosmetic',
    color: 'bg-pink-500/10 text-pink-500'
  },
];

const features = [
  { icon: Clock, title: 'حجز سريع', description: 'احجز موعدك في دقائق' },
  { icon: Shield, title: 'أطباء معتمدون', description: 'أطباء موثوقون ومرخصون' },
  { icon: Heart, title: 'رعاية متميزة', description: 'خدمة صحية عالية الجودة' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState<FeaturedDoctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  useEffect(() => {
    const fetchFeaturedDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('id, name, specialization, governorate, avatar_url, consultation_fee, rating, review_count')
          .eq('provider_type', 'doctor')
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(3);

        if (error) {
          console.error('Error fetching featured doctors:', error);
        } else {
          setFeaturedDoctors(data || []);
        }
      } catch (error) {
        console.error('Error fetching featured doctors:', error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchFeaturedDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-primary/5 via-background to-secondary/20 py-20 lg:py-32">
        <div className="absolute inset-0 pattern-dots" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                منصتك الطبية الأولى في سوريا
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="gradient-text">شريكك الطبي</span>
                <br />
                لصحة أفضل
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                احجز موعدك مع أفضل الأطباء والمختصين في سوريا. استشارات طبية موثوقة، حجز سهل، ورعاية صحية متميزة.
              </p>
              
              {/* Search Box */}
              <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-2xl shadow-xl border border-border/50">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="ابحث عن طبيب أو تخصص..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 border-0 bg-secondary/50 h-12"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-40 border-0 bg-secondary/50 h-12">
                    <SelectValue placeholder="المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYRIAN_GOVERNORATES.map((gov) => (
                      <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/doctors">
                    ابحث الآن
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-8 mt-8">
                {[
                  { value: '+500', label: 'طبيب' },
                  { value: '+10K', label: 'حجز' },
                  { value: '4.9', label: 'تقييم' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-l from-primary/20 to-transparent rounded-3xl blur-2xl" />
                <img 
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=500&fit=crop"
                  alt="Medical Team"
                  className="relative rounded-3xl shadow-2xl"
                />
                
                {/* Floating Card */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -right-6 bg-card p-4 rounded-xl shadow-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">أطباء معتمدون</p>
                      <p className="text-sm text-muted-foreground">+500 طبيب مرخص</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">خدماتنا الطبية</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نقدم لك مجموعة شاملة من الخدمات الطبية لتلبية جميع احتياجاتك الصحية
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  to={service.href}
                  className="block medical-card p-6 h-full"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${service.color} mb-4`}>
                    <service.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <span className="inline-flex items-center text-primary font-medium">
                    استكشف
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">أطباء مميزون</h2>
              <p className="text-muted-foreground">أفضل الأطباء المعتمدين في منصتنا</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/doctors">
                عرض الكل
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {isLoadingDoctors ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : featuredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا يوجد أطباء مسجلين حالياً</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/auth?mode=signup">سجّل كطبيب</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDoctors.map((doctor, i) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="medical-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {doctor.avatar_url ? (
                      <img 
                        src={doctor.avatar_url} 
                        alt={doctor.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialization || 'طب عام'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{doctor.rating || 0}</span>
                        <span className="text-xs text-muted-foreground">({doctor.review_count || 0} تقييم)</span>
                      </div>
                    </div>
                  </div>
                  
                  {doctor.governorate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{doctor.governorate}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground">الكشفية</span>
                      <p className="font-semibold text-primary">
                        {doctor.consultation_fee ? `${doctor.consultation_fee.toLocaleString()} ل.س` : 'غير محدد'}
                      </p>
                    </div>
                    <Button variant="hero" size="sm" asChild>
                      <Link to={`/doctors/${doctor.id}`}>احجز الآن</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-l from-primary to-primary/80">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-primary-foreground"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">هل أنت طبيب؟</h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              انضم إلى منصتنا وابدأ باستقبال المرضى وإدارة عيادتك بسهولة
            </p>
            <Button variant="glass" size="lg" asChild>
              <Link to="/auth?mode=signup">
                سجل كمقدم خدمة
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">شريكك الطبي</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 شريكك الطبي. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
