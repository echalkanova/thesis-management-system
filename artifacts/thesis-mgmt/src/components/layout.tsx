import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  BookOpen, Calendar, LayoutDashboard, Users, FileText,
  BarChart2, LogOut, Bell, UserCircle,
  ChevronRight, Shield, UserCheck, Inbox, MessageSquare, UsersRound, ChevronDown
} from "lucide-react";
import { formatRole } from "@/lib/utils";
import { ThesisFlowIcon, ThesisFlowWordmark } from "@/components/thesis-flow-logo";
import { useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useNotificationStream } from "@/hooks/use-notification-stream";
import { useQuery } from "@tanstack/react-query";

const NAV_LINKS = [
  // Admin
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard, roles: ["admin"] },
  { href: "/theses", label: "Дипломни работи", icon: BookOpen, roles: ["admin"] },
  { href: "/committees", label: "Комисии", icon: UsersRound, roles: ["admin"] },
  { href: "/defenses", label: "Защити", icon: Calendar, roles: ["admin"] },
  { href: "/supervisors", label: "Ръководители", icon: UserCheck, roles: ["admin"] },
  { href: "/reports", label: "Справки", icon: BarChart2, roles: ["admin"] },
  { href: "/users", label: "Потребители", icon: Users, roles: ["admin"] },
  { href: "/audit-log", label: "Активност", icon: Shield, roles: ["admin"] },
  // Department head
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard, roles: ["department_head"] },
  { href: "/theses", label: "Дипломни работи", icon: BookOpen, roles: ["department_head"] },
  { href: "/committees", label: "Комисии", icon: UsersRound, roles: ["department_head"] },
  { href: "/defenses", label: "Защити", icon: Calendar, roles: ["department_head"] },
  { href: "/supervisor-requests", label: "Запитвания", icon: Inbox, roles: ["department_head"] },
  { href: "/supervisors", label: "Ръководители", icon: UserCheck, roles: ["department_head"] },
  { href: "/reports", label: "Справки", icon: BarChart2, roles: ["department_head"] },
  // Supervisor
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard, roles: ["supervisor"] },
  { href: "/theses", label: "Дипломни работи", icon: BookOpen, roles: ["supervisor"] },
  { href: "/supervisor-requests", label: "Запитвания", icon: Inbox, roles: ["supervisor"] },
  { href: "/committees", label: "Комисии", icon: UsersRound, roles: ["supervisor"] },
  { href: "/defenses", label: "Защити", icon: Calendar, roles: ["supervisor"] },
  { href: "/reports", label: "Справки", icon: BarChart2, roles: ["supervisor"] },
  // Reviewer
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard, roles: ["reviewer"] },
  { href: "/theses", label: "Дипломни работи", icon: BookOpen, roles: ["reviewer"] },
  { href: "/reviews", label: "Рецензии", icon: FileText, roles: ["reviewer"] },
  { href: "/defenses", label: "Защити", icon: Calendar, roles: ["reviewer"] },
  // Student
  { href: "/dashboard", label: "Табло", icon: LayoutDashboard, roles: ["student"] },
  { href: "/theses", label: "Дипломни работи", icon: BookOpen, roles: ["student"] },
  { href: "/supervisors", label: "Ръководители", icon: UserCheck, roles: ["student"] },
  { href: "/committees", label: "Моята комисия", icon: UsersRound, roles: ["student"] },
  { href: "/defenses", label: "Защити", icon: Calendar, roles: ["student"] },
];

function useSidebarBadges(user: { id: number; role: string } | null | undefined) {
  const { data: supervisorRequests } = useQuery({
    queryKey: ["sidebar-supervisor-requests"],
    
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/supervisor-requests", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: user?.role === "supervisor",
    refetchInterval: 15000,
  });

  const { data: studentRequests } = useQuery({
    queryKey: ["sidebar-student-requests"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/supervisor-requests", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: user?.role === "student",
    refetchInterval: 15000,
  });

  const { data: studentDefense } = useQuery({
    queryKey: ["sidebar-student-defense"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/defenses/my-defense", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: user?.role === "student",
    refetchInterval: 30000,
  });

  const { data: studentCommittee } = useQuery({
    queryKey: ["sidebar-student-committee"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/committees/my-committee", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: user?.role === "student",
    refetchInterval: 30000,
  });

  const { data: reviewerTheses } = useQuery({
    queryKey: ["sidebar-reviewer-theses"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch(`/api/theses?reviewerId=${user?.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: user?.role === "reviewer",
    refetchInterval: 15000,
  });

  const pendingRequests = (supervisorRequests ?? []).filter((r: any) => r.status === "pending").length;
  const pendingReviews = (reviewerTheses ?? []).filter((t: any) => t.status === "under_review").length;

  
  const lastSeenKey = `supervisor_response_seen_${user?.id}`;
  const lastSeen = localStorage.getItem(lastSeenKey);
  const latestResponse = (studentRequests ?? []).find((r: any) => ["accepted", "rejected"].includes(r.status));
  const hasNewResponse = latestResponse && lastSeen !== latestResponse.id?.toString();
  const noSupervisor = user?.role === "student" && hasNewResponse ? 1 : 0;
  
  const defenseSeenKey = `defense_seen_${user?.id}`;
  const committeeSeenKey = `committee_seen_${user?.id}`;
  const defenseSeen = localStorage.getItem(defenseSeenKey);
  const committeeSeen = localStorage.getItem(committeeSeenKey);
  
  const hasDefense = user?.role === "student" && studentDefense && !defenseSeen ? 1 : 0;
  const hasCommittee = user?.role === "student" && studentCommittee && !committeeSeen ? 1 : 0;  
  return {
    "/supervisor-requests": pendingRequests,
    "/reviews": pendingReviews,
    "/supervisors": noSupervisor,
    "/defenses": hasDefense,
    "/committees": hasCommittee,
  } as Record<string, number>;
}

function RoleSwitcher({ user, alternativeRole, switchRole, originalRole }: {
  user: { firstName: string; lastName: string; role: string };
  alternativeRole: string[] | string | null;
  switchRole: (role?: string) => void;
  originalRole: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-2.5"
      >
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-sm font-semibold text-slate-800 truncate">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-indigo-500 font-medium">{formatRole(user.role)}</div>
        </div>
        <ChevronDown size={14} className="text-violet-400 flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="absolute left-0 right-0 mt-1 z-20 bg-white border border-violet-200 rounded-xl shadow-lg overflow-hidden">
          {[...(originalRole && originalRole !== user.role ? [originalRole] : []), ...(Array.isArray(alternativeRole) ? alternativeRole : [alternativeRole]).filter((r: string) => r !== user.role)].map((role: string) => (              <button
                key={role}
                onClick={() => { switchRole(role); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-violet-50 transition-colors text-left border-b border-slate-50 last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-white border border-violet-300 flex items-center justify-center text-violet-600 font-bold text-xs flex-shrink-0">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-700">Превключи роля</div>
                  <div className="text-[10px] text-indigo-500">{formatRole(role)}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Sidebar() {
  const { user, logout, canSwitchRole, alternativeRole, switchRole, originalRole } = useAuth();
  const [location] = useLocation();
  const badges = useSidebarBadges(user);

  if (!user) return null;

  const visibleLinks = NAV_LINKS.filter(l => l.roles.includes(user.role));

  return (
    <aside className="w-60 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 shadow-sm">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <ThesisFlowIcon size={37} />
          <div>
            <ThesisFlowWordmark className="text-sm" />
            <div className="text-[10px] text-slate-400 leading-none mt-0.5">Дипломна система</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 mb-1">
        {canSwitchRole ? (
          <RoleSwitcher user={user} alternativeRole={alternativeRole} switchRole={switchRole} originalRole={originalRole} />        ) : (
          <Link
            href="/profile"
            data-testid="link-profile-card"
            className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors block"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{user.firstName} {user.lastName}</div>
                <div className="text-xs text-indigo-500 font-medium">{formatRole(user.role)}</div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Меню</div>
        {visibleLinks.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/dashboard" && location.startsWith(href));
          const badgeCount = badges[href] ?? 0;
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
              <span className="flex-1">{label}</span>
              {badgeCount > 0 && (
                <span
                  data-testid={`badge-sidebar-${href.replace("/", "")}`}
                  className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center"
                >
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-indigo-300" />}
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

  const { data: msgData } = useQuery({
    queryKey: ["messages-unread"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/messages/unread-count", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    refetchInterval: 5000,
    enabled: !!user,
  });
  const unreadMsgs = msgData?.count ?? 0;

  if (!user) return null;

  return (
    <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-end gap-2 flex-shrink-0">
      {/* Messages */}
      <Link
        href="/messages"
        data-testid="link-messages"
        className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 border border-slate-100 transition-colors"
      >
        <MessageSquare size={16} />
        {unreadMsgs > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
            {unreadMsgs > 9 ? "9+" : unreadMsgs}
          </span>
        )}
      </Link>

      {/* Notifications */}
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
          <ThesisFlowIcon size={47} />
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
