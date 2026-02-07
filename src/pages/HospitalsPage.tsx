import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star,
  ChevronLeft,
  Building2,
  Phone,
  Clock,
  Bed,
  Stethoscope,
  Heart,
  Brain,
  Bone
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

const hospitals = [
  {
    id: 'h1',
    name: 'مستشفى الشامي التخصصي',
    avatar: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'المزة، أوتوستراد المزة',
    rating: 4.8,
    reviewCount: 567,
    isEmergencyOpen: true,
    beds: 250,
    departments: ['قلبية', 'جراحة', 'أطفال', 'نسائية', 'عظمية'],
    phone: '+963 11 333 4444',
  },
  {
    id: 'h2',
    name: 'المشفى الوطني الجامعي',
    avatar: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'المزة 86',
    rating: 4.6,
    reviewCount: 892,
    isEmergencyOpen: true,
    beds: 500,
    departments: ['قلبية', 'جراحة', 'أورام', 'أعصاب', 'عيون'],
    phone: '+963 11 444 5555',
  },
  {
    id: 'h3',
    name: 'مستشفى حلب الجامعي',
    avatar: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=150&h=150&fit=crop',
    governorate: 'حلب',
    address: 'حلب الجديدة',
    rating: 4.5,
    reviewCount: 423,
    isEmergencyOpen: true,
    beds: 400,
    departments: ['باطنية', 'جراحة', 'أطفال', 'عظمية'],
    phone: '+963 21 555 6666',
  },
  {
    id: 'h4',
    name: 'المشفى الوطني بحمص',
    avatar: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=150&h=150&fit=crop',
    governorate: 'حمص',
    address: 'شارع الحضارة',
    rating: 4.4,
    reviewCount: 234,
    isEmergencyOpen: true,
    beds: 200,
    departments: ['باطنية', 'جراحة', 'نسائية'],
    phone: '+963 31 666 7777',
  },
  {
    id: 'h5',
    name: 'مستشفى تشرين الجامعي',
    avatar: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=150&h=150&fit=crop',
    governorate: 'اللاذقية',
    address: 'طريق جبلة',
    rating: 4.7,
    reviewCount: 345,
    isEmergencyOpen: true,
    beds: 350,
    departments: ['قلبية', 'جراحة', 'أورام', 'أطفال', 'أعصاب'],
    phone: '+963 41 777 8888',
  },
];

const departmentIcons: { [key: string]: any } = {
  'قلبية': Heart,
  'أعصاب': Brain,
  'عظمية': Bone,
};

export default function HospitalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const allDepartments = [...new Set(hospitals.flatMap(h => h.departments))];

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name.includes(searchQuery);
    const matchesGov = selectedGov === 'all' || hospital.governorate === selectedGov;
    const matchesDept = selectedDept === 'all' || hospital.departments.includes(selectedDept);
    return matchesSearch && matchesGov && matchesDept;
  });

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      {/* Header */}
      <section className="bg-gradient-to-bl from-accent/10 to-background py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Building2 className="h-6 w-6" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">المستشفيات</h1>
            </div>
            <p className="text-muted-foreground mb-8">
              ابحث عن المستشفيات والمراكز الطبية المتخصصة
            </p>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl shadow-lg border border-border/50">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن مستشفى..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  {allDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
            تم العثور على <span className="font-semibold text-foreground">{filteredHospitals.length}</span> مستشفى
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital, i) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="medical-card p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={hospital.avatar} 
                    alt={hospital.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{hospital.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{hospital.rating}</span>
                      <span className="text-xs text-muted-foreground">({hospital.reviewCount} تقييم)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {hospital.isEmergencyOpen && (
                    <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full animate-pulse-soft">
                      🚨 طوارئ 24/7
                    </span>
                  )}
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {hospital.beds} سرير
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {hospital.departments.slice(0, 4).map((dept) => (
                    <span 
                      key={dept}
                      className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                    >
                      {dept}
                    </span>
                  ))}
                  {hospital.departments.length > 4 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      +{hospital.departments.length - 4}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{hospital.address}، {hospital.governorate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span dir="ltr">{hospital.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="hero" size="sm" className="flex-1" asChild>
                    <a href={`tel:${hospital.phone}`}>
                      <Phone className="h-4 w-4" />
                      اتصل
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/hospitals/${hospital.id}`}>
                      التفاصيل
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
