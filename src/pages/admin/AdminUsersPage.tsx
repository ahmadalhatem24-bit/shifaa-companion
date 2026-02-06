import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  governorate: string | null;
  gender: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
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

  const columns: Column<UserProfile>[] = [
    { key: "full_name", header: "الاسم" },
    { key: "phone", header: "الهاتف" },
    { key: "governorate", header: "المحافظة" },
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

  const handleDelete = async (user: UserProfile) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

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
