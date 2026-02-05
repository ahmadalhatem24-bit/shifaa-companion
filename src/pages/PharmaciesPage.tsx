import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star,
  ChevronLeft,
  Pill,
  Clock,
  Upload,
  Phone
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
import { toast } from 'sonner';

const pharmacies = [
  {
    id: 'p1',
    name: 'صيدلية الشفاء',
    avatar: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'ساحة الأمويين، بناء الفردوس',
    rating: 4.8,
    reviewCount: 456,
    isOpen: true,
    openHours: '24 ساعة',
    hasDelivery: true,
    phone: '+963 11 111 2222',
  },
  {
    id: 'p2',
    name: 'صيدلية الحياة',
    avatar: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'المالكي، شارع أبو رمانة',
    rating: 4.7,
    reviewCount: 234,
    isOpen: true,
    openHours: '8:00 - 23:00',
    hasDelivery: true,
    phone: '+963 11 222 3333',
  },
  {
    id: 'p3',
    name: 'صيدلية النور',
    avatar: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=150&h=150&fit=crop',
    governorate: 'حلب',
    address: 'حلب الجديدة، شارع النيل',
    rating: 4.6,
    reviewCount: 178,
    isOpen: false,
    openHours: '8:00 - 22:00',
    hasDelivery: false,
    phone: '+963 21 333 4444',
  },
  {
    id: 'p4',
    name: 'صيدلية الأمل',
    avatar: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=150&h=150&fit=crop',
    governorate: 'حمص',
    address: 'شارع الحضارة',
    rating: 4.9,
    reviewCount: 312,
    isOpen: true,
    openHours: '24 ساعة',
    hasDelivery: true,
    phone: '+963 31 444 5555',
  },
  {
    id: 'p5',
    name: 'صيدلية الصحة',
    avatar: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=150&h=150&fit=crop',
    governorate: 'اللاذقية',
    address: 'شارع 8 آذار',
    rating: 4.5,
    reviewCount: 145,
    isOpen: true,
    openHours: '9:00 - 21:00',
    hasDelivery: true,
    phone: '+963 41 555 6666',
  },
];

export default function PharmaciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [showOpenOnly, setShowOpenOnly] = useState<string>('all');

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch = pharmacy.name.includes(searchQuery);
    const matchesGov = selectedGov === 'all' || pharmacy.governorate === selectedGov;
    const matchesOpen = showOpenOnly === 'all' || (showOpenOnly === 'open' && pharmacy.isOpen);
    return matchesSearch && matchesGov && matchesOpen;
  });

  const handleUploadPrescription = () => {
    toast.info('سيتم إضافة ميزة رفع الوصفة قريباً');
  };

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      {/* Header */}
      <section className="bg-gradient-to-bl from-success/10 to-background py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Pill className="h-6 w-6" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold">الصيدليات</h1>
              </div>
              <Button variant="accent" onClick={handleUploadPrescription}>
                <Upload className="h-4 w-4" />
                رفع وصفة طبية
              </Button>
            </div>
            <p className="text-muted-foreground mb-8">
              ابحث عن أقرب صيدلية واحصل على أدويتك بسهولة
            </p>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl shadow-lg border border-border/50">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن صيدلية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={showOpenOnly} onValueChange={setShowOpenOnly}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="open">مفتوح الآن</SelectItem>
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
            تم العثور على <span className="font-semibold text-foreground">{filteredPharmacies.length}</span> صيدلية
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPharmacies.map((pharmacy, i) => (
              <motion.div
                key={pharmacy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="medical-card p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={pharmacy.avatar} 
                    alt={pharmacy.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{pharmacy.rating}</span>
                      <span className="text-xs text-muted-foreground">({pharmacy.reviewCount} تقييم)</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pharmacy.isOpen 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {pharmacy.isOpen ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{pharmacy.openHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{pharmacy.address}، {pharmacy.governorate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span dir="ltr">{pharmacy.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {pharmacy.hasDelivery && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      توصيل متاح
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="hero" size="sm" className="flex-1" asChild>
                    <a href={`tel:${pharmacy.phone}`}>
                      <Phone className="h-4 w-4" />
                      اتصل الآن
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/pharmacies/${pharmacy.id}`}>
                      التفاصيل
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
