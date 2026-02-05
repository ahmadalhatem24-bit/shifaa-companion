import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star,
  ChevronLeft,
  Sparkles,
  Heart,
  Smile,
  Scissors
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

const cosmeticClinics = [
  {
    id: 'c1',
    name: 'عيادة الجمال التخصصية',
    avatar: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'المالكي، شارع أبو رمانة',
    rating: 4.9,
    reviewCount: 456,
    specialization: 'تجميل الوجه',
    services: ['بوتوكس', 'فيلر', 'تقشير كيميائي', 'ليزر'],
    consultationFee: 50000,
    isVerified: true,
  },
  {
    id: 'c2',
    name: 'مركز الأناقة للتجميل',
    avatar: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'المزة فيلات غربية',
    rating: 4.8,
    reviewCount: 312,
    specialization: 'نحت الجسم',
    services: ['شفط دهون', 'نحت بالليزر', 'كرايو', 'ميزوثيرابي'],
    consultationFee: 45000,
    isVerified: true,
  },
  {
    id: 'c3',
    name: 'عيادة الدكتورة سارة للتجميل',
    avatar: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=150&h=150&fit=crop',
    governorate: 'حلب',
    address: 'حلب الجديدة',
    rating: 4.7,
    reviewCount: 234,
    specialization: 'العناية بالبشرة',
    services: ['هايدرافيشيال', 'ميكرونيدلينغ', 'بلازما', 'فيتامين C'],
    consultationFee: 35000,
    isVerified: true,
  },
  {
    id: 'c4',
    name: 'مركز إزالة الشعر بالليزر',
    avatar: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'ساحة الأمويين',
    rating: 4.6,
    reviewCount: 567,
    specialization: 'إزالة الشعر',
    services: ['ليزر ديود', 'IPL', 'إزالة دائمة'],
    consultationFee: 25000,
    isVerified: true,
  },
  {
    id: 'c5',
    name: 'عيادة زراعة الشعر',
    avatar: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'شارع الثورة',
    rating: 4.8,
    reviewCount: 189,
    specialization: 'زراعة الشعر',
    services: ['FUE', 'DHI', 'بلازما للشعر', 'ميزوثيرابي للشعر'],
    consultationFee: 40000,
    isVerified: true,
  },
  {
    id: 'c6',
    name: 'مركز تجميل الأسنان',
    avatar: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=150&h=150&fit=crop',
    governorate: 'اللاذقية',
    address: 'شارع 8 آذار',
    rating: 4.7,
    reviewCount: 145,
    specialization: 'تجميل الأسنان',
    services: ['ابتسامة هوليود', 'فينير', 'تبييض', 'تلبيسات'],
    consultationFee: 35000,
    isVerified: true,
  },
];

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

  const filteredClinics = cosmeticClinics.filter((clinic) => {
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
                    <p className="text-sm text-pink-500 font-medium">{clinic.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{clinic.rating}</span>
                      <span className="text-xs text-muted-foreground">({clinic.reviewCount} تقييم)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {clinic.services.slice(0, 3).map((service) => (
                    <span 
                      key={service}
                      className="px-2 py-1 bg-pink-500/10 text-pink-500 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                  {clinic.services.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      +{clinic.services.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{clinic.address}، {clinic.governorate}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">الاستشارة</span>
                    <p className="font-semibold text-pink-500">{clinic.consultationFee?.toLocaleString()} ل.س</p>
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
        </div>
      </section>
    </div>
  );
}
