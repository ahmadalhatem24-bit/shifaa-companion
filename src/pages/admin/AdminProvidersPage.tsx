import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SYRIAN_GOVERNORATES, MEDICAL_SPECIALIZATIONS } from "@/types";
import { Database } from "@/integrations/supabase/types";

type ProviderType = Database["public"]["Enums"]["provider_type"];

interface Provider {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  provider_type: ProviderType;
  specialization: string | null;
  governorate: string | null;
  address: string | null;
  license_number: string | null;
  is_verified: boolean | null;
  rating: number | null;
  bio: string | null;
  consultation_fee: number | null;
  created_at: string;
}

interface AdminProvidersPageProps {
  providerType: ProviderType;
  title: string;
}

const providerTypeLabels: Record<ProviderType, string> = {
  doctor: "طبيب",
  pharmacist: "صيدلي",
  hospital: "مشفى",
  laboratory: "مختبر",
  dental: "عيادة أسنان",
  cosmetic: "مركز تجميل",
};

export default function AdminProvidersPage({
  providerType,
  title,
}: AdminProvidersPageProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    governorate: "",
    address: "",
    license_number: "",
    bio: "",
    consultation_fee: "",
  });

  useEffect(() => {
    fetchProviders();
  }, [providerType]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("provider_type", providerType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Provider>[] = [
    { key: "name", header: "الاسم" },
    { key: "email", header: "البريد الإلكتروني" },
    { key: "phone", header: "الهاتف" },
    { key: "specialization", header: "التخصص" },
    { key: "governorate", header: "المحافظة" },
    {
      key: "is_verified",
      header: "الحالة",
      render: (provider) => (
        <Badge variant={provider.is_verified ? "default" : "secondary"}>
          {provider.is_verified ? "موثق" : "غير موثق"}
        </Badge>
      ),
    },
    {
      key: "rating",
      header: "التقييم",
      render: (provider) => (
        <span>{provider.rating ? `${provider.rating}/5` : "-"}</span>
      ),
    },
  ];

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setFormData({
      name: provider.name,
      email: provider.email || "",
      phone: provider.phone || "",
      specialization: provider.specialization || "",
      governorate: provider.governorate || "",
      address: provider.address || "",
      license_number: provider.license_number || "",
      bio: provider.bio || "",
      consultation_fee: provider.consultation_fee?.toString() || "",
    });
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      governorate: "",
      address: "",
      license_number: "",
      bio: "",
      consultation_fee: "",
    });
    setAddDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProvider) return;

    try {
      const { error } = await supabase
        .from("providers")
        .update({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          specialization: formData.specialization || null,
          governorate: formData.governorate || null,
          address: formData.address || null,
          license_number: formData.license_number || null,
          bio: formData.bio || null,
          consultation_fee: formData.consultation_fee
            ? parseInt(formData.consultation_fee)
            : null,
        })
        .eq("id", selectedProvider.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث البيانات بنجاح",
      });
      setEditDialogOpen(false);
      fetchProviders();
    } catch (error) {
      console.error("Error updating provider:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث البيانات",
        variant: "destructive",
      });
    }
  };

  const handleSaveAdd = async () => {
    try {
      const { error } = await supabase.from("providers").insert({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        provider_type: providerType,
        specialization: formData.specialization || null,
        governorate: formData.governorate || null,
        address: formData.address || null,
        license_number: formData.license_number || null,
        bio: formData.bio || null,
        consultation_fee: formData.consultation_fee
          ? parseInt(formData.consultation_fee)
          : null,
      });

      if (error) throw error;

      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة مزود الخدمة بنجاح",
      });
      setAddDialogOpen(false);
      fetchProviders();
    } catch (error) {
      console.error("Error adding provider:", error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة مزود الخدمة",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (provider: Provider) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;

    try {
      const { error } = await supabase
        .from("providers")
        .delete()
        .eq("id", provider.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف السجل بنجاح",
      });
      fetchProviders();
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف السجل",
        variant: "destructive",
      });
    }
  };

  const handleVerify = async (provider: Provider) => {
    try {
      const { error } = await supabase
        .from("providers")
        .update({ is_verified: !provider.is_verified })
        .eq("id", provider.id);

      if (error) throw error;

      toast({
        title: provider.is_verified ? "تم إلغاء التوثيق" : "تم التوثيق",
        description: provider.is_verified
          ? "تم إلغاء توثيق مزود الخدمة"
          : "تم توثيق مزود الخدمة بنجاح",
      });
      fetchProviders();
    } catch (error) {
      console.error("Error verifying provider:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة التوثيق",
        variant: "destructive",
      });
    }
  };

  const ProviderForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">الاسم</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">الهاتف</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="specialization">التخصص</Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) =>
              setFormData({ ...formData, specialization: value })
            }
          >
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
        <div className="grid gap-2">
          <Label htmlFor="governorate">المحافظة</Label>
          <Select
            value={formData.governorate}
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
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">العنوان</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="license_number">رقم الترخيص</Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) =>
              setFormData({ ...formData, license_number: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="consultation_fee">رسوم الاستشارة</Label>
          <Input
            id="consultation_fee"
            type="number"
            value={formData.consultation_fee}
            onChange={(e) =>
              setFormData({ ...formData, consultation_fee: e.target.value })
            }
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">نبذة</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <DataTable
        title={title}
        data={providers}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onVerify={handleVerify}
        onAdd={handleAdd}
        searchPlaceholder="بحث بالاسم..."
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل {providerTypeLabels[providerType]}</DialogTitle>
          </DialogHeader>
          <ProviderForm />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit}>حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              إضافة {providerTypeLabels[providerType]} جديد
            </DialogTitle>
          </DialogHeader>
          <ProviderForm />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveAdd}>إضافة</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
