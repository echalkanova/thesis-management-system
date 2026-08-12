import { useAuth } from "@/lib/auth";
import {
  useGetDashboardStats, getGetDashboardStatsQueryKey,
  useGetThesesReport, getGetThesesReportQueryKey,
  useListTheses, getListThesesQueryKey,
  useListDefenses, getListDefensesQueryKey,
  useListNotifications, getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { formatStatus, getStatusColor } from "@/lib/utils";
import {
  BookOpen, Calendar, Clock, FileText, TrendingUp,
  ArrowUpRight, ArrowDownRight, MapPin, CheckCircle2,
  CircleDot, Circle, ChevronRight, Plus, Bell, Star,
  User, GraduationCap, AlertCircle, ClipboardCheck, Hourglass,
  Users, Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_BADGE_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-100 text-blue-700",
  pending_supervisor_approval: "bg-yellow-100 text-yellow-700",
  returned_for_revision: "bg-orange-100 text-orange-700",
  approved_by_supervisor: "bg-lime-100 text-lime-700",
  under_review: "bg-purple-100 text-purple-700",
  reviewed: "bg-cyan-100 text-cyan-700",
  approved_for_defense: "bg-green-100 text-green-700",
  scheduled_for_defense: "bg-indigo-100 text-indigo-700",
  defended: "bg-teal-100 text-teal-700",
};

const STEPS = [
  { key: "draft",        label: "Чернова" },
  { key: "submitted",    label: "Подадена" },
  { key: "under_review", label: "В рецензия" },
  { key: "approved",     label: "Одобрена" },
  { key: "defended",     label: "Защитена" },
];

function stepIndex(status: string) {
  return STEPS.findIndex(s => s.key === status);
}

/* ═══════════════════════════════════════════════════
   STUDENT DASHBOARD
═══════════════════════════════════════════════════ */
function StudentDashboard() {
  const { user } = useAuth();

  const { data: thesesList, isLoading: thesesLoading } = useListTheses(
    { studentId: user?.id } as any,
    { query: { queryKey: getListThesesQueryKey({ studentId: user?.id } as any) } }
  );

  const { data: allDefenses } = useListDefenses(
    {} as any,
    { query: { queryKey: getListDefensesQueryKey() } }
  );

  const { data: notifications } = useListNotifications(
    { query: { queryKey: getListNotificationsQueryKey() } }
  );

  const thesis = thesesList?.[0] ?? null;
  const currentStep = thesis ? stepIndex(thesis.status) : -1;

  const myDefense = allDefenses?.find(d =>
    thesis && (d.thesisIds as number[])?.includes(thesis.id)
  ) ?? null;

  const recentNotifs = notifications?.slice(0, 4) ?? [];

  if (thesesLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded-lg" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Добре дошли!</h1>
        <p className="text-sm text-slate-400 mt-0.5">Това е актуалното състояние на твоята дипломна работа.</p>
      </div>

      {!thesis && (
        <div className="bg-white rounded-2xl border border-dashed border-indigo-200 p-10 flex flex-col items-center text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-indigo-500" />
          </div>
          <h2 className="font-bold text-slate-800 text-lg mb-1">Нямаш дипломна работа</h2>
          <p className="text-sm text-slate-400 mb-5 max-w-sm">
            Все още не си регистрирал дипломна работа. Започни сега, за да следиш напредъка си.
          </p>
          <Link href="/theses/new">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors">
              <Plus size={15} /> Регистрирай дипломна работа
            </button>
          </Link>
        </div>
      )}

      {thesis && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Напредък на дипломната работа</h2>
              <Badge className={`text-xs ${getStatusColor(thesis.status)}`} variant="outline">
                {formatStatus(thesis.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-0">
              {STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.key} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        done   ? "bg-indigo-600 border-indigo-600 text-white" :
                        active ? "bg-white border-indigo-600 text-indigo-600" :
                                 "bg-white border-slate-200 text-slate-300"
                      }`}>
                        {done ? <CheckCircle2 size={16} /> : active ? <CircleDot size={16} /> : <Circle size={16} />}
                      </div>
                      <span className={`text-[10px] font-medium mt-1.5 text-center leading-tight ${
                        done ? "text-indigo-600" : active ? "text-slate-800" : "text-slate-400"
                      }`}>{step.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 mb-5 rounded ${i < currentStep ? "bg-indigo-600" : "bg-slate-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-indigo-600" />
                </div>
                <Link href={`/theses/${thesis.id}`}>
                  <button className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-0.5">
                    Виж детайли <ChevronRight size={13} />
                  </button>
                </Link>
              </div>
              <h3 className="font-bold text-slate-800 text-base leading-snug mb-3 line-clamp-2">{thesis.title}</h3>
              <div className="space-y-2">
                {thesis.supervisor && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <User size={11} className="text-violet-600" />
                    </div>
                    <span className="text-slate-400 text-xs">Научен ръководител:</span>
                    <span className="text-slate-700 font-medium text-xs">
                      {(thesis.supervisor as any).firstName} {(thesis.supervisor as any).lastName}
                    </span>
                  </div>
                )}
                {thesis.reviewer && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={11} className="text-amber-600" />
                    </div>
                    <span className="text-slate-400 text-xs">Рецензент:</span>
                    <span className="text-slate-700 font-medium text-xs">
                      {(thesis.reviewer as any).firstName} {(thesis.reviewer as any).lastName}
                    </span>
                  </div>
                )}
                {!thesis.supervisor && (
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-amber-600">Няма назначен научен ръководител</span>
                  </div>
                )}
                {thesis.submittedAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                    <Clock size={12} />
                    Подадена на {new Date(thesis.submittedAt).toLocaleDateString("bg")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {myDefense ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                    <Calendar size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-xs text-slate-400 mb-0.5">Защита насрочена</div>
                  <div className="font-bold text-slate-800 text-sm">
                    {new Date(myDefense.scheduledAt).toLocaleDateString("bg", { day: "numeric", month: "long" })}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(myDefense.scheduledAt).toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" })}
                    {myDefense.roomOrLink && <> · {myDefense.roomOrLink}</>}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-4 flex-1 flex flex-col items-center justify-center text-center">
                  <Calendar size={20} className="text-slate-300 mb-2" />
                  <div className="text-xs text-slate-400">Защитата не е насрочена</div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-1">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                  <GraduationCap size={16} className="text-amber-600" />
                </div>
                <div className="text-xs text-slate-400 mb-0.5">Направление</div>
                <div className="font-semibold text-slate-800 text-sm">
                  {thesis.field ?? "Не е посочено"}
                </div>
                {thesis.keywords && (
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">{thesis.keywords}</div>
                )}
              </div>
            </div>
          </div>

          {thesis.status === "draft" && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-semibold text-indigo-800 text-sm">Дипломната работа е в чернова</div>
                  <div className="text-xs text-indigo-500">Прегледай и подай дипломната си работа, когато е готова.</div>
                </div>
              </div>
              <Link href={`/theses/${thesis.id}`}>
                <button className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                  Виж и подай
                </button>
              </Link>
            </div>
          )}
        </>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
              <Bell size={14} className="text-slate-500" />
            </div>
            <h2 className="font-semibold text-slate-800">Последни известия</h2>
          </div>
          <Link href="/notifications" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">
            Всички →
          </Link>
        </div>
        {recentNotifs.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
            <Bell size={24} className="text-slate-300" />
            Няма известия
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotifs.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.isRead ? "bg-slate-50" : "bg-indigo-50 border border-indigo-100"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? "bg-slate-300" : "bg-indigo-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${n.isRead ? "text-slate-600" : "text-slate-800"}`}>{n.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</div>
                </div>
                <div className="text-[10px] text-slate-300 flex-shrink-0 mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString("bg")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   REVIEWER DASHBOARD
═══════════════════════════════════════════════════ */
function ReviewerDashboard() {
  const { user } = useAuth();

  const { data: myTheses, isLoading } = useListTheses(
    { reviewerId: user?.id } as any,
    { query: { queryKey: getListThesesQueryKey({ reviewerId: user?.id } as any) } }
  );

  const { data: notifications } = useListNotifications(
    { query: { queryKey: getListNotificationsQueryKey() } }
  );

  const { data: reviewerInfo } = useQuery({
    queryKey: ["reviewer-info", user?.id],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/users/reviewers/list", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const all = await res.json();
      return all.find((r: any) => r.id === user?.id) ?? null;
    },
    enabled: user?.role === "reviewer",
  });

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const theses = myTheses ?? [];
  const pending = theses.filter(t => t.status === "under_review");
  const completed = theses.filter(t => ["reviewed", "approved_for_defense", "scheduled_for_defense", "defended"].includes(t.status));
  const recentNotifs = notifications?.slice(0, 4) ?? [];

  const metrics = [
    { label: "За рецензиране", value: pending.length, icon: Hourglass, iconBg: "bg-amber-50", iconColor: "text-amber-600", slots: false },
    { label: "Приключени рецензии", value: completed.length, icon: ClipboardCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", slots: false },
    { label: "Общо назначени", value: theses.length, icon: FileText, iconBg: "bg-indigo-50", iconColor: "text-indigo-600", slots: true },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Табло</h1>
        <p className="text-sm text-slate-400 mt-0.5">Добре дошли! Това са дипломните работи, назначени за рецензия.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const { label, value, icon: Icon, iconBg, iconColor, slots } = metric;
          return (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                <Icon size={20} className={iconColor} />
              </div>
              {slots && reviewerInfo ? (
                <div className="mb-0.5">
                  <span className="text-3xl font-bold text-slate-800">{value}</span>
                  <span className="text-slate-400 mx-1 text-3xl">/</span>
                  <span className="text-green-600 font-bold text-3xl">{reviewerInfo.maxStudents}</span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-slate-800 mb-0.5">{value}</div>
              )}
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Чакащи рецензия</h2>
          <Link href="/reviews" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Всички →</Link>
        </div>
        {pending.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
            <CheckCircle2 size={28} className="text-slate-300" />Нямате дипломни работи, чакащи рецензия
          </div>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 5).map(thesis => (
              <Link key={thesis.id} href={`/theses/${thesis.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{thesis.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Студент: {thesis.student?.firstName} {thesis.student?.lastName}</p>
                  </div>
                  <Badge className="ml-3 flex-shrink-0 text-xs bg-amber-50 text-amber-700 border-amber-200" variant="outline">
                    Чака рецензия
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Последно рецензирани</h2>
        </div>
        {completed.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
            <ClipboardCheck size={28} className="text-slate-300" />Все още нямате приключени рецензии
          </div>
        ) : (
          <div className="space-y-2">
            {completed.slice(0, 5).map(thesis => (
              <Link key={thesis.id} href={`/theses/${thesis.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{thesis.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Студент: {thesis.student?.firstName} {thesis.student?.lastName}</p>
                  </div>
                  <Badge className={`ml-3 flex-shrink-0 text-xs ${getStatusColor(thesis.status)}`} variant="outline">
                    {formatStatus(thesis.status)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
              <Bell size={14} className="text-slate-500" />
            </div>
            <h2 className="font-semibold text-slate-800">Последни известия</h2>
          </div>
          <Link href="/notifications" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Всички →</Link>
        </div>
        {recentNotifs.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
            <Bell size={24} className="text-slate-300" />Няма известия
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotifs.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.isRead ? "bg-slate-50" : "bg-indigo-50 border border-indigo-100"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? "bg-slate-300" : "bg-indigo-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${n.isRead ? "text-slate-600" : "text-slate-800"}`}>{n.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</div>
                </div>
                <div className="text-[10px] text-slate-300 flex-shrink-0 mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString("bg")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SUPERVISOR DASHBOARD
═══════════════════════════════════════════════════ */
function SupervisorDashboard() {
  const { user } = useAuth();

  const { data: myTheses, isLoading } = useListTheses(
    {} as any,
    { query: { queryKey: getListThesesQueryKey({} as any) } }
  );

  const { data: notifications } = useListNotifications(
    { query: { queryKey: getListNotificationsQueryKey() } }
  );

  const { data: supervisorRequests } = useQuery({
    queryKey: ["supervisor-requests-dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/supervisor-requests", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const theses = myTheses ?? [];
  const pendingApproval = theses.filter(t => (t.status as string) === "pending_supervisor_approval");
  const active = theses.filter(t => !["defended", "draft"].includes(t.status));
  const defended = theses.filter(t => t.status === "defended");
  const pendingRequests = (supervisorRequests ?? []).filter((r: any) => r.status === "pending");
  const recentNotifs = (notifications ?? []).slice(0, 4);

  const metrics = [
    { label: "Чакат одобрение", value: pendingApproval.length, icon: AlertCircle, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Активни дипломни работи", value: active.length, icon: BookOpen, iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
    { label: "Запитвания от студенти", value: pendingRequests.length, icon: Inbox, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "Успешно защитени", value: defended.length, icon: GraduationCap, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Табло</h1>
        <p className="text-sm text-slate-400 mt-0.5">Добре дошли! Това е актуалното ниво на вашите дипломанти.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-0.5">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Чакат вашето одобрение</h2>
          <Link href="/theses" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Всички →</Link>
        </div>
        {pendingApproval.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
            <CheckCircle2 size={28} className="text-slate-300" />Няма дипломни работи, чакащи одобрение
          </div>
        ) : (
          <div className="space-y-2">
            {pendingApproval.map(thesis => (
              <Link key={thesis.id} href={`/theses/${thesis.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all cursor-pointer group">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-800 truncate group-hover:text-amber-800">{thesis.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Студент: {thesis.student?.firstName} {thesis.student?.lastName}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200" variant="outline">Чака одобрение</Badge>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Мои дипломанти</h2>
          <Link href="/theses" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Всички →</Link>
        </div>
        {theses.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
            <Users size={28} className="text-slate-300" />Нямате назначени дипломанти
          </div>
        ) : (
          <div className="space-y-2">
            {theses.slice(0, 6).map(thesis => (
              <Link key={thesis.id} href={`/theses/${thesis.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-700">
                      {thesis.student?.firstName?.[0]}{thesis.student?.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate group-hover:text-indigo-700">{thesis.title}</p>
                      <p className="text-xs text-slate-400">{thesis.student?.firstName} {thesis.student?.lastName}</p>
                    </div>
                  </div>
                  <Badge className={`ml-3 flex-shrink-0 text-xs ${getStatusColor(thesis.status)}`} variant="outline">
                    {formatStatus(thesis.status)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Нови запитвания от студенти</h2>
            <Link href="/supervisor-requests" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Всички →</Link>
          </div>
          <div className="space-y-2">
            {pendingRequests.slice(0, 4).map((r: any) => (
              <Link key={r.id} href="/supervisor-requests">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-50 border border-transparent hover:border-violet-100 transition-all cursor-pointer group">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-800 truncate">{r.student?.firstName} {r.student?.lastName}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{r.message ?? "Запитване за ръководство"}</p>
                  </div>
                  <Badge className="ml-3 flex-shrink-0 text-xs bg-violet-50 text-violet-700 border-violet-200" variant="outline">Ново</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
              <Bell size={14} className="text-slate-500" />
            </div>
            <h2 className="font-semibold text-slate-800">Последни известия</h2>
          </div>
          <Link href="/notifications" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Всички →</Link>
        </div>
        {recentNotifs.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
            <Bell size={24} className="text-slate-300" />Няма известия
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotifs.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.isRead ? "bg-slate-50" : "bg-indigo-50 border border-indigo-100"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? "bg-slate-300" : "bg-indigo-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${n.isRead ? "text-slate-600" : "text-slate-800"}`}>{n.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</div>
                </div>
                <div className="text-[10px] text-slate-300 flex-shrink-0 mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString("bg")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════ */
function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });
  const { data: report } = useGetThesesReport({}, {
    query: { queryKey: getGetThesesReportQueryKey({}) }
  });

  const byMonthData = (report?.byMonth ?? []).map((m: any) => ({ month: m.month, count: m.count }));
  const byFieldData = report
    ? Object.entries(report.byField as Record<string, number>)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, count }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }
  if (!stats) return null;

  const metrics = [
    { label: "Дипломни работи", value: stats.totalTheses, change: `${stats.totalTheses} общо`, up: true, icon: BookOpen, iconBg: "bg-indigo-50", iconColor: "text-indigo-600", changeColor: "text-emerald-600" },
    { label: "Предстоящи защити", value: stats.upcomingDefenses, change: stats.upcomingDefenses > 0 ? `${stats.upcomingDefenses} насрочени` : "Няма насрочени", up: stats.upcomingDefenses > 0, icon: Calendar, iconBg: "bg-violet-50", iconColor: "text-violet-600", changeColor: stats.upcomingDefenses > 0 ? "text-emerald-600" : "text-slate-400" },
    { label: "Чакащи рецензии", value: stats.pendingReviews, change: stats.pendingReviews > 0 ? `${stats.pendingReviews} за рецензия` : "Всички прегледани", up: false, icon: FileText, iconBg: "bg-amber-50", iconColor: "text-amber-600", changeColor: stats.pendingReviews > 0 ? "text-rose-500" : "text-emerald-600" },
    { label: "Среден успех", value: stats.averageGrade > 0 ? stats.averageGrade.toFixed(2) : "—", change: stats.averageGrade > 0 ? gradeLabel(stats.averageGrade) : "Няма оценки", up: stats.averageGrade >= 4, icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", changeColor: stats.averageGrade >= 4 ? "text-emerald-600" : stats.averageGrade > 0 ? "text-rose-500" : "text-slate-400" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Табло</h1>
        <p className="text-sm text-slate-400 mt-0.5">Добре дошли! Обобщението на дипломния процес е:</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, change, up, icon: Icon, iconBg, iconColor, changeColor }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon size={20} className={iconColor} />
              </div>
              <div className={`flex items-center gap-0.5 ${changeColor}`}>
                {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-0.5">{value}</div>
            <div className="text-xs text-slate-400 mb-1.5">{label}</div>
            <div className={`text-xs font-semibold ${changeColor}`}>{change}</div>
          </div>
        ))}
      </div>

      {stats.thesesByStatus && Object.keys(stats.thesesByStatus).length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Разпределение по статус</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.thesesByStatus as Record<string, number>)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <span key={status} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_BADGE_COLORS[status] ?? "bg-slate-100 text-slate-600"}`}>
                  {formatStatus(status)}
                  <span className="font-bold">{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-800">Дипломни работи по месец</h2>
              <p className="text-xs text-slate-400 mt-0.5">Регистрирани работи</p>
            </div>
          </div>
          {byMonthData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">Няма данни</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={byMonthData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="count" name="Брой" stroke="#6366f1" strokeWidth={2.5} fill="url(#indigoGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-800">По специалност</h2>
            <p className="text-xs text-slate-400 mt-0.5">Брой дипломни работи</p>
          </div>
          {byFieldData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">Няма данни</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byFieldData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: number) => [v, "Работи"]} />
                <Bar dataKey="count" name="Брой" fill="#6366f1" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Последни дипломни работи</h2>
            <Link href="/theses" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Всички →</Link>
          </div>
          <div className="space-y-2">
            {stats.recentTheses?.slice(0, 5).map(thesis => (
              <Link key={thesis.id} href={`/theses/${thesis.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{thesis.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{thesis.student?.firstName} {thesis.student?.lastName}</p>
                  </div>
                  <Badge className={`ml-3 flex-shrink-0 text-xs ${getStatusColor(thesis.status)}`} variant="outline">
                    {formatStatus(thesis.status)}
                  </Badge>
                </div>
              </Link>
            ))}
            {(!stats.recentTheses || stats.recentTheses.length === 0) && (
              <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
                <BookOpen size={28} className="text-slate-300" />Няма намерени дипломни работи
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Предстоящи защити</h2>
            <Link href="/defenses" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">Всички →</Link>
          </div>
          <div className="space-y-2">
            {stats.upcomingDefenseList?.slice(0, 5).map(defense => {
              const d = new Date(defense.scheduledAt);
              return (
                <Link key={defense.id} href={`/defenses/${defense.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-700 leading-none">{d.getDate()}</span>
                      <span className="text-[9px] text-indigo-400 uppercase font-medium">{d.toLocaleString("bg", { month: "short" })}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-800 truncate">{defense.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Clock size={11} />{d.toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" })}
                        {defense.roomOrLink && <><MapPin size={11} /><span className="truncate">{defense.roomOrLink}</span></>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {(!stats.upcomingDefenseList || stats.upcomingDefenseList.length === 0) && (
              <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
                <Calendar size={28} className="text-slate-300" />Няма предстоящи защити
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentDashboard />;
  if (user?.role === "reviewer") return <ReviewerDashboard />;
  if (user?.role === "supervisor") return <SupervisorDashboard />;
  return <AdminDashboard />;
}

function gradeLabel(v: number) {
  if (v >= 5.5) return "Отличен";
  if (v >= 4.5) return "Много добър";
  if (v >= 3.5) return "Добър";
  if (v >= 2.5) return "Среден";
  return "Слаб";
}
