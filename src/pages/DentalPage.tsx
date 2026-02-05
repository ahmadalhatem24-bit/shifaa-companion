import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star,
  ChevronLeft,
  SmilePlus,
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

const dentalClinics = [
  {
    id: 'd1',
    name: 'عيادة ابتسامة دمشق',
    avatar: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&h=150&fit=crop',
    specialization: 'طب أسنان تجميلي',
    governorate: 'دمشق',
    address: 'المزة، شارع الفيحاء',
    rating: 4.9,
    reviewCount: 312,
    consultationFee: 25000,
    services: ['تبييض الأسنان', 'زراعة', 'تقويم'],
    isVerified: true,
  },
  {
    id: 'd2',
    name: 'مركز الابتسامة الذهبية',
    avatar: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=150&h=150&fit=crop',
    specialization: 'جراحة فموية',
    governorate: 'حلب',
    address: 'حلب الجديدة، شارع النيل',
    rating: 4.7,
    reviewCount: 189,
    consultationFee: 20000,
    services: ['خلع ضرس العقل', 'جراحة لثة', 'زراعة'],
    isVerified: true,
  },
  {
    id: 'd3',
    name: 'عيادة د. سامر للأسنان',
    avatar: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=150&h=150&fit=crop',
    specialization: 'تقويم أسنان',
    governorate: 'اللاذقية',
    address: 'شارع 8 آذار',
    rating: 4.8,
    reviewCount: 156,
    consultationFee: 30000,
    services: ['تقويم معدني', 'تقويم شفاف', 'Invisalign'],
    isVerified: true,
  },
  {
    id: 'd4',
    name: 'مركز أسنان الأطفال',
    avatar: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=150&h=150&fit=crop',
    specialization: 'طب أسنان أطفال',
    governorate: 'دمشق',
    address: 'باب توما، شارع الأمين',
    rating: 4.9,
    reviewCount: 234,
    consultationFee: 20000,
    services: ['حشوات ملونة', 'فلورايد', 'تنظيف'],
    isVerified: true,
  },
];

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

  const filteredClinics = dentalClinics.filter((clinic) => {
    const matchesSearch = clinic.name.includes(searchQuery) || 
                          clinic.specialization.includes(searchQuery);
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
                    src={clinic.avatar} 
                    alt={clinic.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{clinic.name}</h3>
                      {clinic.isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                          معتمد
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{clinic.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{clinic.rating}</span>
                      <span className="text-xs text-muted-foreground">({clinic.reviewCount} تقييم)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {clinic.services.map((service) => (
                    <span 
                      key={service}
                      className="px-2 py-1 bg-info/10 text-info text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{clinic.address}، {clinic.governorate}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">الكشفية</span>
                    <p className="font-semibold text-info">{clinic.consultationFee?.toLocaleString()} ل.س</p>
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
        </div>
      </section>
    </div>
  );
}
