import { useAuth } from "@/lib/auth";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { formatStatus, getStatusColor } from "@/lib/utils";
import { BookOpen, Calendar, Clock, FileText, TrendingUp, ArrowUpRight, MapPin, GraduationCap, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const activityData = [
  { month: "Яну", подадени: 4, защитени: 2 }, { month: "Фев", подадени: 7, защитени: 4 },
  { month: "Мар", подадени: 5, защитени: 3 }, { month: "Апр", подадени: 9, защитени: 6 },
  { month: "Май", подадени: 12, защитени: 8 }, { month: "Юни", подадени: 18, защитени: 14 },
  { month: "Юли", подадени: 8, защитени: 5 }, { month: "Авг", подадени: 6, защитени: 4 },
  { month: "Сеп", подадени: 14, защитени: 10 }, { month: "Окт", подадени: 11, защитени: 7 },
  { month: "Ное", подадени: 16, защитени: 12 }, { month: "Дек", подадени: 22, защитени: 18 },
];

const facultyData = [
  { dept: "ФМИ", count: 14 }, { dept: "ФТФ", count: 9 }, { dept: "ФХФ", count: 7 },
  { dept: "ПФ", count: 11 }, { dept: "ФФ", count: 6 },
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

      {/* Charts row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Dual-line area chart */}
        <div className="col-span-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-800">Активност на дипломния процес</h2>
              <p className="text-xs text-slate-400 mt-0.5">Подадени vs Защитени — 2025/2026</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                Подадени
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                Защитени
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
              />
              <Area type="monotone" dataKey="подадени" stroke="#6366f1" strokeWidth={2.5} fill="url(#indigoGrad)" dot={false} />
              <Area type="monotone" dataKey="защитени" stroke="#10b981" strokeWidth={2.5} fill="url(#emeraldGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Faculty bar chart */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-800">По факултет</h2>
            <p className="text-xs text-slate-400 mt-0.5">Брой дипломни работи</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={facultyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                formatter={(v: number) => [v, "Работи"]}
              />
              <Bar dataKey="count" name="Брой" fill="#6366f1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
