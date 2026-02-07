import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star,
  ChevronLeft,
  Sparkles
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
import { useState } from 'react';
import { useProviders } from '@/hooks/useProviders';
import { Skeleton } from '@/components/ui/skeleton';

const specializations = [
  'تجميل الوجه',
  'نحت الجسم',
  'العناية بالبشرة',
  'إزالة الشعر',
  'زراعة الشعر',
  'تجميل الأسنان',
];

export default function CosmeticPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedSpec, setSelectedSpec] = useState<string>('all');

  const { data: clinics = [], isLoading } = useProviders('cosmetic');

  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (clinic.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesGov = selectedGov === 'all' || clinic.governorate === selectedGov;
    const matchesSpec = selectedSpec === 'all' || clinic.specialization === selectedSpec;
    return matchesSearch && matchesGov && matchesSpec;
  });

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      {/* Header */}
      <section className="bg-gradient-to-bl from-pink-500/10 to-background py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">التجميل</h1>
            </div>
            <p className="text-muted-foreground mb-8">
              اكتشف أفضل عيادات ومراكز التجميل للحصول على مظهر مثالي
            </p>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl shadow-lg border border-border/50">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن عيادة أو خدمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={selectedSpec} onValueChange={setSelectedSpec}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="التخصص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التخصصات</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedGov} onValueChange={setSelectedGov}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المحافظات</SelectItem>
                  {SYRIAN_GOVERNORATES.map((gov) => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container">
          <p className="text-muted-foreground mb-6">
            تم العثور على <span className="font-semibold text-foreground">{filteredClinics.length}</span> عيادة
          </p>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="medical-card p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredClinics.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد عيادات</h3>
              <p className="text-muted-foreground">لم يتم العثور على عيادات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClinics.map((clinic, i) => (
                <motion.div
                  key={clinic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="medical-card p-6 overflow-hidden group"
                >
                  {/* Decorative gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={clinic.avatar_url || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150&h=150&fit=crop'} 
                      alt={clinic.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{clinic.name}</h3>
                        {clinic.is_verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                            معتمد
                          </span>
                        )}
                      </div>
                      {clinic.specialization && (
                        <p className="text-sm text-pink-500 font-medium">{clinic.specialization}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{clinic.rating || 0}</span>
                        <span className="text-xs text-muted-foreground">({clinic.review_count || 0} تقييم)</span>
                      </div>
                    </div>
                  </div>

                  {clinic.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{clinic.address}{clinic.governorate ? `، ${clinic.governorate}` : ''}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground">الاستشارة</span>
                      <p className="font-semibold text-pink-500">{(clinic.consultation_fee || 0).toLocaleString()} ل.س</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-l from-pink-500 to-purple-500 text-white hover:opacity-90"
                      asChild
                    >
                      <Link to={`/cosmetic/${clinic.id}`}>
                        احجز الآن
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
