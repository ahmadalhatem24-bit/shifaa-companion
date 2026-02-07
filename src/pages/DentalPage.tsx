import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star,
  ChevronLeft,
  SmilePlus
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

const dentalSpecializations = [
  'طب أسنان عام',
  'طب أسنان تجميلي',
  'تقويم أسنان',
  'جراحة فموية',
  'طب أسنان أطفال',
  'علاج عصب',
  'زراعة أسنان',
];

export default function DentalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedSpec, setSelectedSpec] = useState<string>('all');

  const { data: clinics = [], isLoading } = useProviders('dental');

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
      <section className="bg-gradient-to-bl from-info/10 to-background py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10 text-info">
                <SmilePlus className="h-6 w-6" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">طب الأسنان</h1>
            </div>
            <p className="text-muted-foreground mb-8">
              ابحث عن أفضل عيادات الأسنان واحصل على ابتسامة مثالية
            </p>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl shadow-lg border border-border/50">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن عيادة أو تخصص..."
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
                  {dentalSpecializations.map((spec) => (
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
              <SmilePlus className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
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
                  className="medical-card p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={clinic.avatar_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&h=150&fit=crop'} 
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
                        <p className="text-sm text-muted-foreground">{clinic.specialization}</p>
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
                      <span className="text-xs text-muted-foreground">الكشفية</span>
                      <p className="font-semibold text-info">{(clinic.consultation_fee || 0).toLocaleString()} ل.س</p>
                    </div>
                    <Button variant="hero" size="sm" asChild>
                      <Link to={`/dental/${clinic.id}`}>
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
