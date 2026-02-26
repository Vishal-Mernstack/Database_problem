import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute, getDashboardPath } from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
 import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import ReceptionDashboard from "./pages/reception/ReceptionDashboard";
import NurseDashboard from "./pages/nurse/NurseDashboard";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import LaboratoryDashboard from "./pages/laboratory/LaboratoryDashboard";
import BillingDashboard from "./pages/billing/BillingDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import BloodBankDashboard from "./pages/bloodbank/BloodBankDashboard";

const queryClient = new QueryClient();

// Redirect component for the index route
function IndexRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  
  return <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            
            {/* Profile route - accessible to all authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist', 'nurse', 'pharmacy', 'laboratory', 'billing', 'patient', 'bloodbank']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
             
             {/* Notifications route - accessible to all authenticated users */}
             <Route
               path="/notifications"
               element={
                 <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist', 'nurse', 'pharmacy', 'laboratory', 'billing', 'patient', 'bloodbank']}>
                   <Notifications />
                 </ProtectedRoute>
               }
             />
            
            {/* Index redirect */}
            <Route path="/" element={<IndexRedirect />} />
            
            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Doctor routes */}
            <Route
              path="/doctor/*"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Reception routes */}
            <Route
              path="/reception/*"
              element={
                <ProtectedRoute allowedRoles={['receptionist']}>
                  <ReceptionDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Nurse routes */}
            <Route
              path="/nurse/*"
              element={
                <ProtectedRoute allowedRoles={['nurse']}>
                  <NurseDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Pharmacy routes */}
            <Route
              path="/pharmacy/*"
              element={
                <ProtectedRoute allowedRoles={['pharmacy']}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Laboratory routes */}
            <Route
              path="/lab/*"
              element={
                <ProtectedRoute allowedRoles={['laboratory']}>
                  <LaboratoryDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Billing routes */}
            <Route
              path="/billing/*"
              element={
                <ProtectedRoute allowedRoles={['billing']}>
                  <BillingDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Patient routes */}
            <Route
              path="/patient/*"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Blood Bank routes */}
            <Route
              path="/bloodbank/*"
              element={
                <ProtectedRoute allowedRoles={['bloodbank']}>
                  <BloodBankDashboard />
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
