import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star,
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
import { useProviders } from '@/hooks/useProviders';
import { Skeleton } from '@/components/ui/skeleton';

export default function PharmaciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  
  const { data: pharmacies = [], isLoading } = useProviders('pharmacist');

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGov = selectedGov === 'all' || pharmacy.governorate === selectedGov;
    return matchesSearch && matchesGov;
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
          ) : filteredPharmacies.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد صيدليات</h3>
              <p className="text-muted-foreground">لم يتم العثور على صيدليات مطابقة للبحث</p>
            </div>
          ) : (
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
                      src={pharmacy.avatar_url || 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&h=150&fit=crop'} 
                      alt={pharmacy.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{pharmacy.rating || 0}</span>
                        <span className="text-xs text-muted-foreground">({pharmacy.review_count || 0} تقييم)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {pharmacy.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{pharmacy.address}{pharmacy.governorate ? `، ${pharmacy.governorate}` : ''}</span>
                      </div>
                    )}
                    {pharmacy.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span dir="ltr">{pharmacy.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    {pharmacy.phone && (
                      <Button variant="hero" size="sm" className="flex-1" asChild>
                        <a href={`tel:${pharmacy.phone}`}>
                          <Phone className="h-4 w-4" />
                          اتصل الآن
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/pharmacies/${pharmacy.id}`}>
                        التفاصيل
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
