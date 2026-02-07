import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  todayAppointments: number;
  pendingRequests: number;
  totalPatients: number;
  monthlyRevenue: number;
}

interface AppointmentWithPatient {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  patient_name: string;
}

interface ProviderInfo {
  id: string;
  name: string;
  consultation_fee: number | null;
}

export function useProviderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingRequests: 0,
    totalPatients: 0,
    monthlyRevenue: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<AppointmentWithPatient[]>([]);
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Get provider info for current user
        const { data: provider, error: providerError } = await supabase
          .from("providers")
          .select("id, name, consultation_fee")
          .eq("user_id", user.id)
          .single();

        if (providerError || !provider) {
          console.error("Error fetching provider:", providerError);
          setIsLoading(false);
          return;
        }

        setProviderInfo(provider);

        const today = new Date().toISOString().split("T")[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0];

        // 2. Fetch all appointments for this provider
        const { data: allAppointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select("id, patient_id, appointment_date, appointment_time, status, notes")
          .eq("provider_id", provider.id);

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
        }

        const appointments = allAppointments || [];

        // 3. Calculate stats
        const todayApts = appointments.filter((apt) => apt.appointment_date === today);
        const pendingApts = appointments.filter((apt) => apt.status === "pending");
        const uniquePatients = new Set(appointments.map((apt) => apt.patient_id));
        const completedThisMonth = appointments.filter(
          (apt) => apt.status === "completed" && apt.appointment_date >= startOfMonth
        );
        const monthlyRevenue = completedThisMonth.length * (provider.consultation_fee || 0);

        setStats({
          todayAppointments: todayApts.length,
          pendingRequests: pendingApts.length,
          totalPatients: uniquePatients.size,
          monthlyRevenue,
        });

        // 4. Get today's appointments with patient names
        const todayAppointmentIds = todayApts.map((apt) => apt.patient_id);
        
        if (todayAppointmentIds.length > 0) {
          // Fetch patient profiles for today's appointments
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", todayAppointmentIds);

          const profileMap = new Map(
            (profiles || []).map((p) => [p.user_id, p.full_name])
          );

          const appointmentsWithNames: AppointmentWithPatient[] = todayApts
            .filter((apt) => apt.status === "pending" || apt.status === "confirmed")
            .map((apt) => ({
              id: apt.id,
              patient_id: apt.patient_id,
              appointment_date: apt.appointment_date,
              appointment_time: apt.appointment_time,
              status: apt.status as "pending" | "confirmed" | "completed" | "cancelled",
              notes: apt.notes,
              patient_name: profileMap.get(apt.patient_id) || "مريض",
            }))
            .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

          setTodayAppointments(appointmentsWithNames);
        } else {
          setTodayAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  return {
    stats,
    todayAppointments,
    providerInfo,
    isLoading,
  };
}
