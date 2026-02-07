import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Droplet,
  Ruler,
  Weight,
  AlertCircle,
  Edit2,
  Save,
  X,
  Camera,
  Loader2,
} from "lucide-react";
import { PatientNavbar } from "@/components/layout/PatientNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SYRIAN_GOVERNORATES } from "@/types";
import { Progress } from "@/components/ui/progress";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  governorate: string | null;
  city: string | null;
  street: string | null;
  blood_type: string | null;
  height: number | null;
  weight: number | null;
  marital_status: string | null;
  avatar_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const maritalStatuses = [
  { value: "single", label: "أعزب" },
  { value: "married", label: "متزوج" },
  { value: "divorced", label: "مطلق" },
  { value: "widowed", label: "أرمل" },
];
const relations = ["أب", "أم", "زوج/زوجة", "ابن/ابنة", "أخ/أخت", "صديق", "آخر"];

const getMaritalStatusLabel = (value: string | null) => {
  if (!value) return "-";
  const status = maritalStatuses.find((s) => s.value === value);
  return status?.label || value;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setUserEmail(session.user.email || "");
      await fetchProfile(session.user.id);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData(data);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const updateData = {
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        governorate: formData.governorate || null,
        city: formData.city || null,
        street: formData.street || null,
        blood_type: formData.blood_type || null,
        height: formData.height ?? null,
        weight: formData.weight ?? null,
        marital_status: formData.marital_status || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null,
        updated_at: new Date().toISOString(),
      };

      console.log("Saving profile data:", updateData);

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;

      // Refetch profile to ensure we have the latest data
      await fetchProfile(profile.user_id);
      setIsEditing(false);
      toast.success("تم حفظ جميع البيانات بنجاح");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("خطأ في حفظ البيانات: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const calculateProfileCompletion = (): number => {
    if (!profile) return 0;
    const fields = [
      profile.full_name,
      profile.phone,
      profile.gender,
      profile.date_of_birth,
      profile.governorate,
      profile.blood_type,
      profile.height,
      profile.weight,
      profile.emergency_contact_name,
      profile.emergency_contact_phone,
    ];
    const filledFields = fields.filter((f) => f !== null && f !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
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

  const completion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar />

      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-l from-primary to-primary/80 h-32" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                      {profile?.full_name ? (
                        getInitials(profile.full_name)
                      ) : (
                        <User />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-2 left-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">
                    {profile?.full_name || "مستخدم جديد"}
                  </h1>
                  <p className="text-muted-foreground">{userEmail}</p>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 ml-2" />
                        إلغاء
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 ml-2" />
                        )}
                        حفظ
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Completion */}
              <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    اكتمال الملف الشخصي
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {completion}%
                  </span>
                </div>
                <Progress value={completion} className="h-2" />
                {completion < 100 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    أكمل ملفك الشخصي للحصول على تجربة أفضل
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="personal">البيانات الشخصية</TabsTrigger>
              <TabsTrigger value="health">البيانات الصحية</TabsTrigger>
              <TabsTrigger value="emergency">الطوارئ</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    البيانات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>الاسم الكامل</Label>
                    {isEditing ? (
                      <Input
                        value={formData.full_name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                        placeholder="أدخل اسمك الكامل"
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg">
                        {profile?.full_name || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="09xxxxxxxx"
                        dir="ltr"
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {profile?.phone || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>الجنس</Label>
                    {isEditing ? (
                      <Select
                        value={formData.gender || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجنس" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg">
                        {profile?.gender === "male"
                          ? "ذكر"
                          : profile?.gender === "female"
                            ? "أنثى"
                            : "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>تاريخ الميلاد</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.date_of_birth || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            date_of_birth: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {profile?.date_of_birth || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>الحالة الاجتماعية</Label>
                    {isEditing ? (
                      <Select
                        value={formData.marital_status || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, marital_status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {maritalStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg">
                        {getMaritalStatusLabel(profile?.marital_status || null)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>المحافظة</Label>
                    {isEditing ? (
                      <Select
                        value={formData.governorate || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, governorate: value })
                        }
                      >
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
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {profile?.governorate || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>المدينة</Label>
                    {isEditing ? (
                      <Input
                        value={formData.city || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="اسم المدينة"
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg">
                        {profile?.city || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>العنوان التفصيلي</Label>
                    {isEditing ? (
                      <Input
                        value={formData.street || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, street: e.target.value })
                        }
                        placeholder="الشارع، البناء، الطابق"
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg">
                        {profile?.street || "-"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Info Tab */}
            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    البيانات الصحية
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>فصيلة الدم</Label>
                    {isEditing ? (
                      <Select
                        value={formData.blood_type || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, blood_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر فصيلة الدم" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-4 bg-destructive/10 rounded-lg text-center">
                        <Droplet className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <p className="text-2xl font-bold text-destructive">
                          {profile?.blood_type || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>الطول (سم)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.height ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            height: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="170"
                      />
                    ) : (
                      <div className="p-4 bg-primary/10 rounded-lg text-center">
                        <Ruler className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">
                          {profile?.height || "-"}{" "}
                          <span className="text-sm font-normal">سم</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>الوزن (كغ)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.weight ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weight: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="70"
                      />
                    ) : (
                      <div className="p-4 bg-success/10 rounded-lg text-center">
                        <Weight className="h-8 w-8 text-success mx-auto mb-2" />
                        <p className="text-2xl font-bold">
                          {profile?.weight || "-"}{" "}
                          <span className="text-sm font-normal">كغ</span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emergency Contact Tab */}
            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    جهة اتصال الطوارئ
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>اسم جهة الاتصال</Label>
                    {isEditing ? (
                      <Input
                        value={formData.emergency_contact_name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergency_contact_name: e.target.value,
                          })
                        }
                        placeholder="اسم الشخص"
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg">
                        {profile?.emergency_contact_name || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.emergency_contact_phone || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergency_contact_phone: e.target.value,
                          })
                        }
                        placeholder="09xxxxxxxx"
                        dir="ltr"
                      />
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg">
                        {profile?.emergency_contact_phone || "-"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>صلة القرابة</Label>
                    {isEditing ? (
                      <Select
                        value={formData.emergency_contact_relation || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            emergency_contact_relation: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر صلة القرابة" />
                        </SelectTrigger>
                        <SelectContent>
                          {relations.map((rel) => (
                            <SelectItem key={rel} value={rel}>
                              {rel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="p-3 bg-secondary/30 rounded-lg">
                        {profile?.emergency_contact_relation || "-"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
