import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorDetailPage from "./pages/DoctorDetailPage";
import DentalPage from "./pages/DentalPage";
import PharmaciesPage from "./pages/PharmaciesPage";
import HospitalsPage from "./pages/HospitalsPage";
import LabsPage from "./pages/LabsPage";
import CosmeticPage from "./pages/CosmeticPage";
import PatientAppointmentsPage from "./pages/PatientAppointmentsPage";
import ProfilePage from "./pages/ProfilePage";
import MedicalRecordPage from "./pages/MedicalRecordPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import PharmacyDashboard from "./pages/provider/PharmacyDashboard";
import LaboratoryDashboard from "./pages/provider/LaboratoryDashboard";
import HospitalDashboard from "./pages/provider/HospitalDashboard";
import DentalDashboard from "./pages/provider/DentalDashboard";
import CosmeticDashboard from "./pages/provider/CosmeticDashboard";
import ProviderAppointmentsPage from "./pages/provider/ProviderAppointmentsPage";
import ProviderPatientsPage from "./pages/provider/ProviderPatientsPage";
import PatientMedicalRecordPage from "./pages/provider/PatientMedicalRecordPage";
import SystemCheckPage from "./pages/SystemCheckPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminProvidersPage from "./pages/admin/AdminProvidersPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* System Check (Development Only) */}
            <Route path="/system-check" element={<SystemCheckPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            <Route path="/dental" element={<DentalPage />} />
            <Route path="/pharmacies" element={<PharmaciesPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/cosmetic" element={<CosmeticPage />} />

            {/* Protected Patient Routes */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-record"
              element={
                <ProtectedRoute>
                  <MedicalRecordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <AIAssistantPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Provider Routes */}
            <Route
              path="/provider"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "doctor",
                    "pharmacist",
                    "hospital",
                    "laboratory",
                    "dental",
                    "cosmetic",
                  ]}
                >
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/pharmacy"
              element={
                <ProtectedRoute allowedRoles={["pharmacist"]}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/laboratory"
              element={
                <ProtectedRoute allowedRoles={["laboratory"]}>
                  <LaboratoryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/hospital"
              element={
                <ProtectedRoute allowedRoles={["hospital"]}>
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/dental"
              element={
                <ProtectedRoute allowedRoles={["dental"]}>
                  <DentalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/cosmetic"
              element={
                <ProtectedRoute allowedRoles={["cosmetic"]}>
                  <CosmeticDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/appointments"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "doctor",
                    "pharmacist",
                    "hospital",
                    "laboratory",
                    "dental",
                    "cosmetic",
                  ]}
                >
                  <ProviderAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/patients"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "doctor",
                    "pharmacist",
                    "hospital",
                    "laboratory",
                    "dental",
                    "cosmetic",
                  ]}
                >
                  <ProviderPatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider/patients/:patientId"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "doctor",
                    "pharmacist",
                    "hospital",
                    "laboratory",
                    "dental",
                    "cosmetic",
                  ]}
                >
                  <PatientMedicalRecordPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProvidersPage providerType="doctor" title="إدارة الأطباء" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hospitals"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProvidersPage providerType="hospital" title="إدارة المشافي" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pharmacies"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProvidersPage providerType="pharmacist" title="إدارة الصيدليات" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/laboratories"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProvidersPage providerType="laboratory" title="إدارة المختبرات" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dental"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProvidersPage providerType="dental" title="إدارة عيادات الأسنان" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cosmetic"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProvidersPage providerType="cosmetic" title="إدارة مراكز التجميل" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAppointmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
