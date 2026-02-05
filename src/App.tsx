import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

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
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderAppointmentsPage from "./pages/provider/ProviderAppointmentsPage";
import NotFound from "./pages/NotFound";

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
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            <Route path="/dental" element={<DentalPage />} />
            <Route path="/pharmacies" element={<PharmaciesPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/cosmetic" element={<CosmeticPage />} />
            <Route path="/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/medical-record" element={<MedicalRecordPage />} />
            
            {/* Provider Routes */}
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/appointments" element={<ProviderAppointmentsPage />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
