import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star,
  ChevronLeft,
  FlaskConical,
  Phone,
  Clock,
  FileText,
  Zap
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

const labs = [
  {
    id: 'l1',
    name: 'المخبر المركزي للتحاليل',
    avatar: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'شارع بغداد، بناء الأمل',
    rating: 4.9,
    reviewCount: 456,
    isOpen: true,
    openHours: '7:00 - 21:00',
    hasHomeVisit: true,
    resultTime: '24 ساعة',
    tests: ['تحليل دم شامل', 'هرمونات', 'سكر', 'كوليسترول'],
    phone: '+963 11 555 6666',
  },
  {
    id: 'l2',
    name: 'مخبر الحياة التشخيصي',
    avatar: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=150&h=150&fit=crop',
    governorate: 'دمشق',
    address: 'المالكي، شارع الجلاء',
    rating: 4.8,
    reviewCount: 312,
    isOpen: true,
    openHours: '6:00 - 22:00',
    hasHomeVisit: true,
    resultTime: '12 ساعة',
    tests: ['PCR', 'تحاليل جينية', 'أورام'],
    phone: '+963 11 666 7777',
  },
  {
    id: 'l3',
    name: 'مخبر البيولوجيا الطبية',
    avatar: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=150&h=150&fit=crop',
    governorate: 'حلب',
    address: 'حلب الجديدة',
    rating: 4.7,
    reviewCount: 234,
    isOpen: true,
    openHours: '7:00 - 20:00',
    hasHomeVisit: false,
    resultTime: '24 ساعة',
    tests: ['زراعة', 'بكتيريا', 'فيروسات'],
    phone: '+963 21 777 8888',
  },
  {
    id: 'l4',
    name: 'مخبر الأشعة والتصوير',
    avatar: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=150&h=150&fit=crop',
    governorate: 'حمص',
    address: 'شارع الحضارة',
    rating: 4.6,
    reviewCount: 189,
    isOpen: true,
    openHours: '8:00 - 18:00',
    hasHomeVisit: false,
    resultTime: '2 ساعة',
    tests: ['أشعة سينية', 'CT Scan', 'MRI', 'إيكو'],
    phone: '+963 31 888 9999',
  },
  {
    id: 'l5',
    name: 'مخبر النور للتحاليل',
    avatar: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=150&h=150&fit=crop',
    governorate: 'اللاذقية',
    address: 'شارع 8 آذار',
    rating: 4.5,
    reviewCount: 145,
    isOpen: false,
    openHours: '8:00 - 17:00',
    hasHomeVisit: true,
    resultTime: '24 ساعة',
    tests: ['تحليل دم', 'بول', 'براز'],
    phone: '+963 41 999 0000',
  },
];

const testTypes = [
  'تحليل دم شامل',
  'هرمونات',
  'سكر',
  'كوليسترول',
  'PCR',
  'تحاليل جينية',
  'أشعة سينية',
  'CT Scan',
  'MRI',
];

export default function LabsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedTest, setSelectedTest] = useState<string>('all');

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch = lab.name.includes(searchQuery);
    const matchesGov = selectedGov === 'all' || lab.governorate === selectedGov;
    const matchesTest = selectedTest === 'all' || lab.tests.some(t => t.includes(selectedTest));
    return matchesSearch && matchesGov && matchesTest;
  });

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      {/* Header */}
      <section className="bg-gradient-to-bl from-warning/10 to-background py-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">المختبرات</h1>
            </div>
            <p className="text-muted-foreground mb-8">
              ابحث عن أفضل المختبرات للتحاليل الطبية والأشعة
            </p>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl shadow-lg border border-border/50">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن مختبر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="نوع التحليل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التحاليل</SelectItem>
                  {testTypes.map((test) => (
                    <SelectItem key={test} value={test}>{test}</SelectItem>
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
            تم العثور على <span className="font-semibold text-foreground">{filteredLabs.length}</span> مختبر
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.map((lab, i) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="medical-card p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={lab.avatar} 
                    alt={lab.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{lab.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{lab.rating}</span>
                      <span className="text-xs text-muted-foreground">({lab.reviewCount} تقييم)</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lab.isOpen 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {lab.isOpen ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    النتائج خلال {lab.resultTime}
                  </span>
                  {lab.hasHomeVisit && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      زيارة منزلية
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {lab.tests.slice(0, 3).map((test) => (
                    <span 
                      key={test}
                      className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                    >
                      {test}
                    </span>
                  ))}
                  {lab.tests.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      +{lab.tests.length - 3}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{lab.openHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{lab.address}، {lab.governorate}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="hero" size="sm" className="flex-1" asChild>
                    <Link to={`/labs/${lab.id}`}>
                      <FileText className="h-4 w-4" />
                      احجز تحليل
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${lab.phone}`}>
                      <Phone className="h-4 w-4" />
                    </a>
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
