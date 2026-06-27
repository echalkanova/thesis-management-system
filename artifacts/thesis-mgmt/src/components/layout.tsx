import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  BookOpen, Calendar, LayoutDashboard, Users, FileText,
  BarChart2, LogOut, Bell, UserCircle, GraduationCap,
  ChevronRight, Shield
} from "lucide-react";
import { formatRole } from "@/lib/utils";
import { useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useNotificationStream } from "@/hooks/use-notification-stream";

const NAV_LINKS = [
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard, roles: ["student", "supervisor", "reviewer", "committee_member", "admin"] },
  { href: "/theses", label: "Дипломни работи", icon: BookOpen, roles: ["student", "supervisor", "reviewer", "committee_member", "admin"] },
  { href: "/defenses", label: "Защити", icon: Calendar, roles: ["student", "supervisor", "reviewer", "committee_member", "admin"] },
  { href: "/reviews", label: "Рецензии", icon: FileText, roles: ["reviewer", "admin"] },
  { href: "/reports", label: "Справки", icon: BarChart2, roles: ["admin", "supervisor"] },
  { href: "/users", label: "Потребители", icon: Users, roles: ["admin"] },
  { href: "/audit-log", label: "Одит лог", icon: Shield, roles: ["admin"] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const visibleLinks = NAV_LINKS.filter(l => l.roles.includes(user.role));

  return (
    <aside className="w-60 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
            <GraduationCap className="text-white" size={18} />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-base tracking-tight">TMS</span>
            <div className="text-[10px] text-slate-400 leading-none mt-0.5">Дипломна система</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 mb-1 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-indigo-500 font-medium">{formatRole(user.role)}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Меню</div>
        {visibleLinks.map(({ href, label, icon: Icon, roles }) => {
          const active = location === href || (href !== "/dashboard" && location.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              data-testid={`link-sidebar-${href.replace("/", "")}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium ${
                active
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon size={16} className={active ? "text-indigo-600" : "text-slate-400"} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-indigo-300" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-0.5">
        <Link
          href="/profile"
          data-testid="link-profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        >
          <UserCircle size={15} className="text-slate-400" />
          Профил
        </Link>
        <button
          onClick={() => logout()}
          data-testid="button-logout"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={15} />
          Изход
        </button>
      </div>
    </aside>
  );
}

export function Header() {
  const { user } = useAuth();
  const { data: notifications } = useListNotifications({ query: { queryKey: getListNotificationsQueryKey() } });
  const unread = notifications?.filter(n => !n.isRead).length ?? 0;

  if (!user) return null;

  return (
    <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-end gap-3 flex-shrink-0">
      <Link
        href="/notifications"
        data-testid="link-notifications"
        className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 border border-slate-100 transition-colors"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
      <div className="flex items-center gap-2 pl-1">
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <span className="text-sm font-medium text-slate-700 hidden md:block">{user.firstName}</span>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  useNotificationStream(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <div className="text-sm text-slate-500 animate-pulse">Зареждане...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
