import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes: string | null;
  cancel_reason: string | null;
  created_at: string;
  providers?: {
    name: string;
    provider_type: string;
  };
  profiles?: {
    full_name: string;
  };
}

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "معلق",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusColors: Record<AppointmentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          providers (name, provider_type)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المواعيد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Appointment>[] = [
    {
      key: "providers",
      header: "مزود الخدمة",
      render: (apt) => apt.providers?.name || "-",
    },
    {
      key: "appointment_date",
      header: "التاريخ",
      render: (apt) => new Date(apt.appointment_date).toLocaleDateString("ar-SY"),
    },
    {
      key: "appointment_time",
      header: "الوقت",
      render: (apt) => apt.appointment_time,
    },
    {
      key: "status",
      header: "الحالة",
      render: (apt) => (
        <Badge variant={statusColors[apt.status]}>
          {statusLabels[apt.status]}
        </Badge>
      ),
    },
    {
      key: "notes",
      header: "ملاحظات",
      render: (apt) => (
        <span className="truncate max-w-xs block">{apt.notes || "-"}</span>
      ),
    },
    {
      key: "created_at",
      header: "تاريخ الإنشاء",
      render: (apt) => new Date(apt.created_at).toLocaleDateString("ar-SY"),
    },
  ];

  const handleDelete = async (appointment: Appointment) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموعد؟")) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointment.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الموعد بنجاح",
      });
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الموعد",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <DataTable
        title="إدارة المواعيد"
        data={appointments}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        searchPlaceholder="بحث..."
      />
    </AdminLayout>
  );
}
