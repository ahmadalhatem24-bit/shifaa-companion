import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  User,
  Calendar,
  Phone,
  FileText,
  Search,
  Loader2,
  Heart,
  Pill,
  AlertTriangle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PatientInfo {
  patient_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  last_appointment: string;
  total_appointments: number;
}

export default function ProviderPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProviderId();
    }
  }, [user]);

  useEffect(() => {
    if (providerId) {
      fetchPatients();
    }
  }, [providerId]);

  const fetchProviderId = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProviderId(data.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      // Get all appointments for this provider with patient info
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          appointment_date,
          profiles!appointments_patient_id_fkey (
            full_name,
            phone,
            avatar_url,
            date_of_birth,
            gender,
            blood_type
          )
        `)
        .eq('provider_id', providerId)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      // Group by patient and get unique patients with their info
      const patientMap = new Map<string, PatientInfo>();
      
      appointments?.forEach((apt: any) => {
        if (!patientMap.has(apt.patient_id)) {
          patientMap.set(apt.patient_id, {
            patient_id: apt.patient_id,
            full_name: apt.profiles?.full_name || 'مريض',
            phone: apt.profiles?.phone,
            avatar_url: apt.profiles?.avatar_url,
            date_of_birth: apt.profiles?.date_of_birth,
            gender: apt.profiles?.gender,
            blood_type: apt.profiles?.blood_type,
            last_appointment: apt.appointment_date,
            total_appointments: 1
          });
        } else {
          const existing = patientMap.get(apt.patient_id)!;
          existing.total_appointments++;
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('خطأ في تحميل قائمة المرضى');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold mb-1">مرضاي</h1>
            <p className="text-muted-foreground">قائمة المرضى الذين حجزوا مواعيد لديك</p>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مريض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-full sm:w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="medical-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patients.length}</p>
                <p className="text-xs text-muted-foreground">إجمالي المرضى</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مرضى بعد'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient, i) => {
              const age = calculateAge(patient.date_of_birth);
              return (
                <motion.div
                  key={patient.patient_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="medical-card p-5"
                >
                  <div className="flex items-start gap-4">
                    {patient.avatar_url ? (
                      <img 
                        src={patient.avatar_url} 
                        alt={patient.full_name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{patient.full_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                        {age && <span>{age} سنة</span>}
                        {patient.gender && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                            {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                          </span>
                        )}
                        {patient.blood_type && (
                          <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs">
                            {patient.blood_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    {patient.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span dir="ltr">{patient.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>آخر زيارة: {format(new Date(patient.last_appointment), "d MMMM yyyy", { locale: ar })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{patient.total_appointments} موعد</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="hero" size="sm" className="w-full" asChild>
                      <Link to={`/provider/patients/${patient.patient_id}`}>
                        <FileText className="h-4 w-4 ml-2" />
                        عرض الملف الطبي
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
