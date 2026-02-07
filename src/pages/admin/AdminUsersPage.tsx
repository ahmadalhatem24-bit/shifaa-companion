import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  governorate: string | null;
  gender: string | null;
  created_at: string;
  role?: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  patient: "مريض",
  doctor: "طبيب",
  pharmacist: "صيدلي",
  hospital: "مشفى",
  laboratory: "مختبر",
  dental: "عيادة أسنان",
  cosmetic: "مركز تجميل",
  admin: "مدير",
};

const roleColors: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
  patient: "outline",
  doctor: "default",
  pharmacist: "secondary",
  hospital: "default",
  laboratory: "secondary",
  dental: "default",
  cosmetic: "secondary",
  admin: "destructive",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || "patient",
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<UserWithRole>[] = [
    { key: "full_name", header: "الاسم" },
    { key: "phone", header: "الهاتف" },
    { key: "governorate", header: "المحافظة" },
    {
      key: "role",
      header: "الدور",
      render: (user) => (
        <Badge variant={roleColors[user.role || "patient"]}>
          {roleLabels[user.role || "patient"]}
        </Badge>
      ),
    },
    {
      key: "gender",
      header: "الجنس",
      render: (user) => (
        <Badge variant="outline">
          {user.gender === "male" ? "ذكر" : user.gender === "female" ? "أنثى" : "-"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "تاريخ التسجيل",
      render: (user) => new Date(user.created_at).toLocaleDateString("ar-SY"),
    },
  ];

  const handleDelete = async (user: UserWithRole) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      // Delete profile (this will cascade to other records if needed)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      // Also delete the user_role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.user_id);

      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <DataTable
        title="إدارة المستخدمين"
        data={users}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        searchPlaceholder="بحث بالاسم..."
      />
    </AdminLayout>
  );
}
