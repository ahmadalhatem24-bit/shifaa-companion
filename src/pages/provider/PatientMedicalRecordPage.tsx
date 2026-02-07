import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  User,
  Calendar,
  Phone,
  MapPin,
  Heart,
  Pill,
  AlertTriangle,
  Users,
  FileText,
  ChevronRight,
  Loader2,
  Droplet,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderLayout } from '@/components/layout/ProviderLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PatientProfile {
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  governorate: string | null;
  city: string | null;
  height: number | null;
  weight: number | null;
}

interface ChronicDisease {
  id: string;
  disease_name: string;
  diagnosis_date: string | null;
  notes: string | null;
}

interface Allergy {
  id: string;
  allergy_name: string;
  severity: string | null;
  notes: string | null;
}

interface Medication {
  id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  is_active: boolean | null;
}

interface FamilyHistory {
  id: string;
  condition_name: string;
  relation: string | null;
  notes: string | null;
}

interface MedicalDocument {
  id: string;
  title: string;
  document_type: string;
  description: string | null;
  file_url: string;
  doctor_name: string | null;
  document_date: string | null;
  created_at: string;
}

export default function PatientMedicalRecordPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [chronicDiseases, setChronicDiseases] = useState<ChronicDisease[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      // Fetch patient profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', patientId)
        .maybeSingle();

      if (profileError) throw profileError;
      setPatient(profileData);

      // Fetch medical data in parallel - Note: Providers can only view, not modify
      const [
        { data: diseases },
        { data: allergyData },
        { data: medsData },
        { data: familyData },
        { data: docsData }
      ] = await Promise.all([
        supabase.from('chronic_diseases').select('*').eq('user_id', patientId),
        supabase.from('allergies').select('*').eq('user_id', patientId),
        supabase.from('medications').select('*').eq('user_id', patientId).eq('is_active', true),
        supabase.from('family_history').select('*').eq('user_id', patientId),
        supabase.from('medical_documents').select('*').eq('user_id', patientId).order('created_at', { ascending: false })
      ]);

      setChronicDiseases(diseases || []);
      setAllergies(allergyData || []);
      setMedications(medsData || []);
      setFamilyHistory(familyData || []);
      setDocuments(docsData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('خطأ في تحميل بيانات المريض');
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

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'شديدة': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'متوسطة': return 'bg-warning/10 text-warning border-warning/30';
      case 'خفيفة': return 'bg-success/10 text-success border-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProviderLayout>
    );
  }

  if (!patient) {
    return (
      <ProviderLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">المريض غير موجود</h1>
          <Button onClick={() => navigate('/provider/patients')}>العودة للمرضى</Button>
        </div>
      </ProviderLayout>
    );
  }

  const age = calculateAge(patient.date_of_birth);

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/provider/patients')}
            className="mb-4"
          >
            <ChevronRight className="h-4 w-4" />
            العودة للمرضى
          </Button>

          {/* Patient Info Card */}
          <div className="medical-card p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {patient.avatar_url ? (
                <img 
                  src={patient.avatar_url} 
                  alt={patient.full_name}
                  className="h-24 w-24 rounded-2xl object-cover mx-auto sm:mx-0"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto sm:mx-0">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
              <div className="flex-1 text-center sm:text-right">
                <h1 className="text-2xl font-bold mb-2">{patient.full_name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                  {age && <span>{age} سنة</span>}
                  {patient.gender && (
                    <span>{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                  )}
                  {patient.blood_type && (
                    <span className="flex items-center gap-1 text-destructive">
                      <Droplet className="h-4 w-4" />
                      {patient.blood_type}
                    </span>
                  )}
                  {patient.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">{patient.phone}</span>
                    </span>
                  )}
                  {patient.governorate && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {patient.governorate}
                    </span>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {patient.height && (
                    <div className="px-3 py-2 bg-secondary rounded-lg">
                      <span className="text-xs text-muted-foreground">الطول</span>
                      <p className="font-semibold">{patient.height} سم</p>
                    </div>
                  )}
                  {patient.weight && (
                    <div className="px-3 py-2 bg-secondary rounded-lg">
                      <span className="text-xs text-muted-foreground">الوزن</span>
                      <p className="font-semibold">{patient.weight} كغ</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Medical Info Tabs */}
        <Tabs defaultValue="diseases" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 mb-6">
            <TabsTrigger value="diseases" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              الأمراض
            </TabsTrigger>
            <TabsTrigger value="allergies" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              الحساسية
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-1">
              <Pill className="h-4 w-4" />
              الأدوية
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              التاريخ العائلي
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              الوثائق
            </TabsTrigger>
          </TabsList>

          {/* Chronic Diseases */}
          <TabsContent value="diseases">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="medical-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                الأمراض المزمنة
              </h2>
              {chronicDiseases.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد أمراض مزمنة مسجلة</p>
              ) : (
                <div className="space-y-3">
                  {chronicDiseases.map((disease) => (
                    <div key={disease.id} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{disease.disease_name}</h3>
                        {disease.diagnosis_date && (
                          <span className="text-sm text-muted-foreground">
                            منذ {format(new Date(disease.diagnosis_date), "MMMM yyyy", { locale: ar })}
                          </span>
                        )}
                      </div>
                      {disease.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{disease.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Allergies */}
          <TabsContent value="allergies">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="medical-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                الحساسية
              </h2>
              {allergies.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد حساسية مسجلة</p>
              ) : (
                <div className="space-y-3">
                  {allergies.map((allergy) => (
                    <div key={allergy.id} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{allergy.allergy_name}</h3>
                        {allergy.severity && (
                          <span className={`px-3 py-1 rounded-full text-sm border ${getSeverityColor(allergy.severity)}`}>
                            {allergy.severity}
                          </span>
                        )}
                      </div>
                      {allergy.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{allergy.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Medications */}
          <TabsContent value="medications">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="medical-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Pill className="h-5 w-5 text-success" />
                الأدوية الحالية
              </h2>
              {medications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد أدوية مسجلة</p>
              ) : (
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div key={med.id} className="p-4 bg-secondary/30 rounded-lg">
                      <h3 className="font-medium">{med.medication_name}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        {med.dosage && <span>الجرعة: {med.dosage}</span>}
                        {med.frequency && <span>التكرار: {med.frequency}</span>}
                        {med.start_date && (
                          <span>منذ: {format(new Date(med.start_date), "d MMM yyyy", { locale: ar })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Family History */}
          <TabsContent value="family">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="medical-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                التاريخ العائلي
              </h2>
              {familyHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا يوجد تاريخ عائلي مسجل</p>
              ) : (
                <div className="space-y-3">
                  {familyHistory.map((item) => (
                    <div key={item.id} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{item.condition_name}</h3>
                        {item.relation && (
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                            {item.relation}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="medical-card p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                الوثائق الطبية
              </h2>
              {documents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد وثائق مسجلة</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {doc.document_type}
                          </span>
                        </div>
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          عرض
                        </a>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mt-2">{doc.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {doc.doctor_name && <span>الطبيب: {doc.doctor_name}</span>}
                        {doc.document_date && (
                          <span>{format(new Date(doc.document_date), "d MMM yyyy", { locale: ar })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </ProviderLayout>
  );
}
