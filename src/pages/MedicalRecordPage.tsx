import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Loader2,
  Heart,
  Users,
  Pill,
  AlertTriangle,
  Upload,
  Trash2,
  Eye,
  Calendar,
  Download,
} from "lucide-react";
import { PatientNavbar } from "@/components/layout/PatientNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import sub-components
import { MedicalDocuments } from "@/components/medical-record/MedicalDocuments";
import { ChronicDiseases } from "@/components/medical-record/ChronicDiseases";
import { FamilyHistory } from "@/components/medical-record/FamilyHistory";
import { Allergies } from "@/components/medical-record/Allergies";
import { Medications } from "@/components/medical-record/Medications";

export default function MedicalRecordPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setUserId(session.user.id);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PatientNavbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">الملف الطبي</h1>
            <p className="text-muted-foreground">
              إدارة سجلاتك الطبية والوثائق والتاريخ الصحي
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="documents" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2 bg-transparent p-0">
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">الوثائق والتقارير</span>
                <span className="sm:hidden">الوثائق</span>
              </TabsTrigger>
              <TabsTrigger
                value="chronic"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">الأمراض المزمنة</span>
                <span className="sm:hidden">مزمنة</span>
              </TabsTrigger>
              <TabsTrigger
                value="family"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">التاريخ العائلي</span>
                <span className="sm:hidden">عائلي</span>
              </TabsTrigger>
              <TabsTrigger
                value="allergies"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">الحساسية</span>
                <span className="sm:hidden">حساسية</span>
              </TabsTrigger>
              <TabsTrigger
                value="medications"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3"
              >
                <Pill className="h-4 w-4" />
                <span className="hidden sm:inline">الأدوية</span>
                <span className="sm:hidden">أدوية</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <MedicalDocuments userId={userId} />
            </TabsContent>

            <TabsContent value="chronic">
              <ChronicDiseases userId={userId} />
            </TabsContent>

            <TabsContent value="family">
              <FamilyHistory userId={userId} />
            </TabsContent>

            <TabsContent value="allergies">
              <Allergies userId={userId} />
            </TabsContent>

            <TabsContent value="medications">
              <Medications userId={userId} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
