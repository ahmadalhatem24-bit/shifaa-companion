import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Clock,
  DollarSign,
  Save,
  Loader2,
  Stethoscope,
  Phone,
  Mail,
  FileText,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProviderLayout } from "@/components/layout/ProviderLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { SYRIAN_GOVERNORATES, MEDICAL_SPECIALIZATIONS } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProviderData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  specialization: string | null;
  governorate: string | null;
  address: string | null;
  consultation_fee: number | null;
  license_number: string | null;
  working_hours: WorkingHours | null;
}

interface WorkingHours {
  sunday?: DaySchedule;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
}

interface DaySchedule {
  isOpen: boolean;
  start: string;
  end: string;
}

const daysOfWeek = [
  { key: "sunday", label: "الأحد" },
  { key: "monday", label: "الإثنين" },
  { key: "tuesday", label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday", label: "الخميس" },
  { key: "friday", label: "الجمعة" },
  { key: "saturday", label: "السبت" },
];

const defaultWorkingHours: WorkingHours = {
  sunday: { isOpen: true, start: "09:00", end: "17:00" },
  monday: { isOpen: true, start: "09:00", end: "17:00" },
  tuesday: { isOpen: true, start: "09:00", end: "17:00" },
  wednesday: { isOpen: true, start: "09:00", end: "17:00" },
  thursday: { isOpen: true, start: "09:00", end: "17:00" },
  friday: { isOpen: false, start: "09:00", end: "17:00" },
  saturday: { isOpen: false, start: "09:00", end: "17:00" },
};

export default function ProviderSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [providerData, setProviderData] = useState<ProviderData | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [address, setAddress] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHours>(defaultWorkingHours);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProviderData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("providers")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching provider:", error);
          toast({
            title: "خطأ",
            description: "فشل في جلب البيانات",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          const providerWithTypedHours = {
            ...data,
            working_hours: data.working_hours as WorkingHours | null,
          };
          setProviderData(providerWithTypedHours);
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setBio(data.bio || "");
          setSpecialization(data.specialization || "");
          setGovernorate(data.governorate || "");
          setAddress(data.address || "");
          setConsultationFee(data.consultation_fee?.toString() || "");
          setLicenseNumber(data.license_number || "");
          if (data.working_hours) {
            setWorkingHours(data.working_hours as WorkingHours);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderData();
  }, [user?.id, toast]);

  const handleSave = async () => {
    if (!providerData?.id) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على ملف مقدم الخدمة",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        name,
        email,
        phone: phone || null,
        bio: bio || null,
        specialization: specialization || null,
        governorate: governorate || null,
        address: address || null,
        consultation_fee: consultationFee ? Number(consultationFee) : null,
        license_number: licenseNumber || null,
        working_hours: workingHours as Json,
      };

      const { error } = await supabase
        .from("providers")
        .update(updateData)
        .eq("id", providerData.id);

      if (error) {
        console.error("Error updating provider:", error);
        toast({
          title: "خطأ",
          description: "فشل في حفظ البيانات",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم الحفظ",
        description: "تم تحديث البيانات بنجاح",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateDaySchedule = (
    day: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof WorkingHours],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <ProviderLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </ProviderLayout>
    );
  }

  if (!providerData) {
    return (
      <ProviderLayout>
        <div className="text-center py-20">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">لم يتم العثور على ملف مقدم الخدمة</h2>
          <p className="text-muted-foreground">
            يرجى التواصل مع الدعم الفني
          </p>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">الإعدادات</h1>
          <p className="text-muted-foreground">
            قم بتحديث بياناتك الشخصية والمهنية
          </p>
        </motion.div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">البيانات الشخصية</TabsTrigger>
            <TabsTrigger value="professional">البيانات المهنية</TabsTrigger>
            <TabsTrigger value="schedule">أوقات الدوام</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="medical-card p-6 space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">البيانات الشخصية</h2>
                  <p className="text-sm text-muted-foreground">
                    معلومات الاتصال الأساسية
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pr-10"
                      placeholder="د. أحمد محمد"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-10"
                      placeholder="doctor@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pr-10"
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license">رقم الترخيص</Label>
                  <div className="relative">
                    <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="license"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="pr-10"
                      placeholder="SY-MED-2024-XXX"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">نبذة تعريفية</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة مختصرة عن خبراتك ومؤهلاتك..."
                  rows={4}
                />
              </div>
            </motion.div>
          </TabsContent>

          {/* Professional Info Tab */}
          <TabsContent value="professional">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="medical-card p-6 space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">البيانات المهنية</h2>
                  <p className="text-sm text-muted-foreground">
                    التخصص والموقع والأجور
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>التخصص</Label>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICAL_SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>المحافظة</Label>
                  <Select value={governorate} onValueChange={setGovernorate}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {SYRIAN_GOVERNORATES.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">العنوان التفصيلي</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pr-10 min-h-[80px]"
                      placeholder="شارع، بناء، طابق..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee">الكشفية (ل.س)</Label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fee"
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="pr-10"
                      placeholder="50000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ستظهر هذه القيمة للمرضى عند الحجز
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="medical-card p-6 space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">أوقات الدوام</h2>
                  <p className="text-sm text-muted-foreground">
                    حدد أيام وساعات العمل
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const schedule = workingHours[day.key as keyof WorkingHours] || {
                    isOpen: false,
                    start: "09:00",
                    end: "17:00",
                  };
                  return (
                    <div
                      key={day.key}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3 w-32">
                        <Switch
                          checked={schedule.isOpen}
                          onCheckedChange={(checked) =>
                            updateDaySchedule(day.key, "isOpen", checked)
                          }
                        />
                        <span className="font-medium">{day.label}</span>
                      </div>

                      {schedule.isOpen ? (
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">من</Label>
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) =>
                                updateDaySchedule(day.key, "start", e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">إلى</Label>
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) =>
                                updateDaySchedule(day.key, "end", e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">مغلق</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end"
        >
          <Button
            variant="hero"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </ProviderLayout>
  );
}
