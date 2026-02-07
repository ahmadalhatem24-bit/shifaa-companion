import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type UserRole =
  | "patient"
  | "doctor"
  | "pharmacist"
  | "hospital"
  | "laboratory"
  | "dental"
  | "cosmetic"
  | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setDemoUser: (role: UserRole) => void;
  redirectBasedOnRole: (role: UserRole) => string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  licenseNumber?: string;
  specialization?: string;
  governorate?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Function to get redirect path based on role
  const redirectBasedOnRole = (role: UserRole): string => {
    switch (role) {
      case "patient":
        return "/";
      case "doctor":
        return "/provider";
      case "pharmacist":
        return "/provider/pharmacy";
      case "laboratory":
        return "/provider/laboratory";
      case "hospital":
        return "/provider/hospital";
      case "dental":
        return "/provider/dental";
      case "cosmetic":
        return "/provider/cosmetic";
      case "admin":
        return "/admin";
      default:
        return "/";
    }
  };

  // Fetch user role from database
  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return (data?.role as UserRole) || null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Defer role fetching with setTimeout to avoid deadlock
      if (session?.user && !isDemoMode) {
        setTimeout(() => {
          fetchUserRole(session.user.id).then((role) => {
            setUserRole(role);
            setIsLoading(false);
          });
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && !isDemoMode) {
        fetchUserRole(session.user.id).then((role) => {
          setUserRole(role);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Debugging: surface raw supabase response
      // eslint-disable-next-line no-console
      console.debug("supabase.auth.signInWithPassword response:", {
        data,
        error,
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Auth login error:", error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const role = await fetchUserRole(data.user.id);
        setUserRole(role);
        return { success: true };
      }

      return { success: false, error: "حدث خطأ غير متوقع" };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Unexpected login exception:", error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (
    data: SignupData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.name,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          return { success: false, error: "هذا البريد الإلكتروني مسجل بالفعل" };
        }
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: "حدث خطأ في إنشاء الحساب" };
      }

      // Wait a moment for the trigger to create the user_role record
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update user role using security definer function (bypasses RLS)
      if (data.role !== "patient") {
        const { error: roleError } = await supabase.rpc("set_user_role", {
          _user_id: authData.user.id,
          _role: data.role,
        });

        if (roleError) {
          console.error("Error setting role:", roleError);
        }
      }

      // Update profile with additional info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: data.name })
        .eq("user_id", authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      // If provider, create provider profile using security definer function
      if (
        [
          "doctor",
          "pharmacist",
          "hospital",
          "laboratory",
          "dental",
          "cosmetic",
        ].includes(data.role)
      ) {
        const providerType = data.role as
          | "doctor"
          | "pharmacist"
          | "hospital"
          | "laboratory"
          | "dental"
          | "cosmetic";
        const { error: providerError } = await supabase.rpc(
          "create_provider_profile",
          {
            _user_id: authData.user.id,
            _name: data.name,
            _email: data.email,
            _provider_type: providerType,
            _license_number: data.licenseNumber || null,
            _specialization: data.specialization || null,
            _governorate: data.governorate || null,
            _address: data.address || null,
          }
        );

        if (providerError) {
          console.error("Error creating provider profile:", providerError);
        }
      }

      setUserRole(data.role);
      return { success: true };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    setIsDemoMode(false);
    setUserRole(null);
    await supabase.auth.signOut();
  };

  const setDemoUser = (role: UserRole) => {
    setIsDemoMode(true);
    setUserRole(role);
    // Create a mock user for demo
    setUser({
      id: `demo-${role}`,
      email: `${role}@demo.medical.sy`,
      app_metadata: {},
      user_metadata: {
        full_name:
          role === "patient"
            ? "مريض تجريبي"
            : role === "doctor"
              ? "د. أحمد"
              : "مدير النظام",
      },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        setDemoUser,
        redirectBasedOnRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
