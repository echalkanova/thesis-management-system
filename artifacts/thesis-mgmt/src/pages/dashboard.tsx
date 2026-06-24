import { useAuth } from "@/lib/auth";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { formatStatus, getStatusColor } from "@/lib/utils";
import { BookOpen, Calendar, Clock, FileText, TrendingUp, ArrowUpRight, MapPin, GraduationCap, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Яну", count: 4 }, { month: "Фев", count: 7 }, { month: "Мар", count: 5 },
  { month: "Апр", count: 9 }, { month: "Май", count: 12 }, { month: "Юни", count: 18 },
  { month: "Юли", count: 8 }, { month: "Авг", count: 6 }, { month: "Сеп", count: 14 },
  { month: "Окт", count: 11 }, { month: "Ное", count: 16 }, { month: "Дек", count: 22 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const metrics = [
    {
      label: "Дипломни работи",
      value: stats.totalTheses,
      change: `${stats.totalTheses} общо`,
      up: true,
      icon: BookOpen,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      changeColor: "text-emerald-600",
    },
    {
      label: "Предстоящи защити",
      value: stats.upcomingDefenses,
      change: stats.upcomingDefenses > 0 ? `${stats.upcomingDefenses} насрочени` : "Няма насрочени",
      up: stats.upcomingDefenses > 0,
      icon: Calendar,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      changeColor: stats.upcomingDefenses > 0 ? "text-emerald-600" : "text-slate-400",
    },
    {
      label: "Чакащи рецензии",
      value: stats.pendingReviews,
      change: stats.pendingReviews > 0 ? `${stats.pendingReviews} за рецензия` : "Всички прегледани",
      up: false,
      icon: FileText,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      changeColor: stats.pendingReviews > 0 ? "text-rose-500" : "text-emerald-600",
    },
    {
      label: "Среден успех",
      value: stats.averageGrade > 0 ? stats.averageGrade.toFixed(2) : "—",
      change: stats.averageGrade > 0 ? gradeLabel(stats.averageGrade) : "Няма оценки",
      up: stats.averageGrade >= 4,
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      changeColor: stats.averageGrade >= 4 ? "text-emerald-600" : stats.averageGrade > 0 ? "text-rose-500" : "text-slate-400",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Табло</h1>
        <p className="text-sm text-slate-400 mt-0.5">Добре дошли, {user?.firstName}. Ето обобщение на дипломния процес.</p>
      </div>

      {/* Metric cards */}
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

      {/* Charts + Recent row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-800">Подадени дипломни работи</h2>
              <p className="text-xs text-slate-400 mt-0.5">Тенденция по месеци — учебна година</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">
              Тази година
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                formatter={(v: number) => [v, "Работи"]}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#indigoGrad)" dot={{ r: 3.5, fill: "#6366f1", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-800">Статуси</h2>
            <p className="text-xs text-slate-400 mt-0.5">Разпределение по статус</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Чернова", key: "draft", color: "bg-slate-300", light: "text-slate-500" },
              { label: "Подадена", key: "submitted", color: "bg-blue-500", light: "text-blue-600" },
              { label: "В рецензия", key: "under_review", color: "bg-amber-500", light: "text-amber-600" },
              { label: "Одобрена", key: "approved", color: "bg-emerald-500", light: "text-emerald-600" },
              { label: "Защитена", key: "defended", color: "bg-indigo-500", light: "text-indigo-600" },
            ].map(({ label, key, color, light }) => {
              const count = (stats as any).thesesByStatus?.[key] ?? 0;
              const pct = stats.totalTheses > 0 ? Math.round((count / stats.totalTheses) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className={`font-bold ${light}`}>{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent theses + Defenses */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent theses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Последни дипломни работи</h2>
            <Link href="/theses" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">
              Всички →
            </Link>
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
                <BookOpen size={28} className="text-slate-300" />
                Няма намерени дипломни работи
              </div>
            )}
          </div>
        </div>

        {/* Upcoming defenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Предстоящи защити</h2>
            <Link href="/defenses" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">
              Всички →
            </Link>
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
                        <Clock size={11} />
                        {d.toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" })}
                        {defense.roomOrLink && (
                          <>
                            <MapPin size={11} />
                            <span className="truncate">{defense.roomOrLink}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {(!stats.upcomingDefenseList || stats.upcomingDefenseList.length === 0) && (
              <div className="text-sm text-slate-400 text-center py-6 flex flex-col items-center gap-2">
                <Calendar size={28} className="text-slate-300" />
                Няма предстоящи защити
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function gradeLabel(v: number) {
  if (v >= 5.5) return "Отличен";
  if (v >= 4.5) return "Много добър";
  if (v >= 3.5) return "Добър";
  if (v >= 2.5) return "Среден";
  return "Слаб";
}
