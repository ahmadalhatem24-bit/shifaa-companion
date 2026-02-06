import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  Pill,
  FlaskConical,
  Smile,
  Sparkles,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { title: "لوحة التحكم", url: "/admin", icon: LayoutDashboard },
  { title: "المستخدمين", url: "/admin/users", icon: Users },
  { title: "الأطباء", url: "/admin/doctors", icon: Stethoscope },
  { title: "المشافي", url: "/admin/hospitals", icon: Building2 },
  { title: "الصيدليات", url: "/admin/pharmacies", icon: Pill },
  { title: "المختبرات", url: "/admin/laboratories", icon: FlaskConical },
  { title: "عيادات الأسنان", url: "/admin/dental", icon: Smile },
  { title: "مراكز التجميل", url: "/admin/cosmetic", icon: Sparkles },
  { title: "المواعيد", url: "/admin/appointments", icon: CalendarDays },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Sidebar className="border-l border-border" side="right">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Settings className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">لوحة الإدارة</h2>
            <p className="text-xs text-muted-foreground">إدارة المنصة</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
