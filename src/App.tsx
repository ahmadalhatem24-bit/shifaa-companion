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
import DentalPage from "./pages/DentalPage";
import PharmaciesPage from "./pages/PharmaciesPage";
import HospitalsPage from "./pages/HospitalsPage";
import LabsPage from "./pages/LabsPage";
import CosmeticPage from "./pages/CosmeticPage";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import AppointmentsPage from "./pages/provider/AppointmentsPage";
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
            <Route path="/dental" element={<DentalPage />} />
            <Route path="/pharmacies" element={<PharmaciesPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/cosmetic" element={<CosmeticPage />} />
            
            {/* Provider Routes */}
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/appointments" element={<AppointmentsPage />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
