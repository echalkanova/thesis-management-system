import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  BookOpen, 
  Calendar, 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart, 
  LogOut, 
  Bell, 
  User as UserIcon,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRole } from "@/lib/utils";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Табло", icon: LayoutDashboard, roles: ["student", "supervisor", "reviewer", "committee_member", "admin"] },
    { href: "/theses", label: "Дипломни работи", icon: BookOpen, roles: ["student", "supervisor", "reviewer", "committee_member", "admin"] },
    { href: "/defenses", label: "Защити", icon: Calendar, roles: ["student", "supervisor", "reviewer", "committee_member", "admin"] },
    { href: "/reviews", label: "Рецензии", icon: FileText, roles: ["reviewer", "admin"] },
    { href: "/reports", label: "Справки", icon: BarChart, roles: ["admin", "supervisor"] },
    { href: "/users", label: "Потребители", icon: Users, roles: ["admin"] },
  ];

  const visibleLinks = links.filter(l => l.roles.includes(user.role));

  return (
    <div className="w-64 bg-[#0a192f] text-slate-300 h-screen flex flex-col border-r border-[#112240]">
      <div className="p-4 flex items-center gap-3 bg-[#020c1b]">
        <BookOpen className="text-amber-500" />
        <span className="font-bold text-slate-100 tracking-tight">TMS System</span>
      </div>
      
      <div className="px-4 py-6 text-sm">
        <div className="mb-2 text-slate-400 font-medium">НАВИГАЦИЯ</div>
        <div className="space-y-1">
          {visibleLinks.map((link) => {
            const active = location.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active ? 'bg-[#112240] text-amber-400 font-medium' : 'hover:bg-[#112240] hover:text-slate-100'}`} data-testid={`link-sidebar-${link.href.replace('/','')}`}>
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-[#112240]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-[#112240] rounded-full flex items-center justify-center text-amber-500 font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-100">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-slate-400">{formatRole(user.role)}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/profile" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors" data-testid="link-profile">
            <UserIcon className="h-4 w-4" />
            Профил
          </Link>
          <button onClick={() => logout()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors" data-testid="button-logout">
            <LogOut className="h-4 w-4" />
            Изход
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5 text-slate-600" />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors" data-testid="link-notifications">
          <Bell className="h-5 w-5" />
          {/* Badge would go here */}
        </Link>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a192f] text-slate-300">Зареждане...</div>;
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
