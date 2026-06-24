import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  LayoutDashboard, BookOpen, Calendar, FileText, Users, BarChart2,
  Bell, Search, Settings, LogOut, TrendingUp, ChevronRight,
  GraduationCap, Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react";

const submissionData = [
  { month: "Яну", подадени: 4, защитени: 2 }, { month: "Фев", подадени: 7, защитени: 4 },
  { month: "Мар", подадени: 5, защитени: 3 }, { month: "Апр", подадени: 9, защитени: 6 },
  { month: "Май", подадени: 12, защитени: 8 }, { month: "Юни", подадени: 18, защитени: 14 },
  { month: "Юли", подадени: 8, защитени: 5 }, { month: "Авг", подадени: 6, защитени: 4 },
  { month: "Сеп", подадени: 14, защитени: 10 }, { month: "Окт", подадени: 11, защитени: 7 },
  { month: "Ное", подадени: 16, защитени: 12 }, { month: "Дек", подадени: 22, защитени: 18 },
];

const barData = [
  { dept: "ФМИ", count: 14 }, { dept: "ФТФ", count: 9 }, { dept: "ФХФ", count: 7 },
  { dept: "ПФ", count: 11 }, { dept: "ФФ", count: 6 },
];

const recent = [
  { name: "Мария Иванова", action: "Подаде дипломна работа", time: "2 мин", initials: "МИ", bg: "from-violet-500 to-purple-600" },
  { name: "Георги Петров", action: "Получи рецензия — Одобрен", time: "18 мин", initials: "ГП", bg: "from-emerald-500 to-green-600" },
  { name: "Ана Николова", action: "Насрочена защита на 30.06", time: "1 ч", initials: "АН", bg: "from-amber-500 to-orange-500" },
  { name: "Иван Стоянов", action: "Оценка 5.75 — Отличен", time: "3 ч", initials: "ИС", bg: "from-blue-500 to-indigo-600" },
  { name: "Петя Димитрова", action: "Прикачи окончателна версия", time: "5 ч", initials: "ПД", bg: "from-pink-500 to-rose-500" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Табло", active: true },
  { icon: BookOpen, label: "Дипломни работи", active: false },
  { icon: Calendar, label: "Защити", active: false },
  { icon: FileText, label: "Рецензии", active: false },
  { icon: Users, label: "Потребители", active: false },
  { icon: BarChart2, label: "Справки", active: false },
];

export function DarkIndigo() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col flex-shrink-0" style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)" }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <GraduationCap className="text-white" size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight">TMS</div>
              <div className="text-white/40 text-[10px]">v2.0 · Универсистет</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-4 mx-3 mt-3 rounded-xl bg-white/8 border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              ИП
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">Иван Петров</div>
              <div className="text-xs text-white/50">Администратор</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Навигация</div>
          {navItems.map(({ icon: Icon, label, active }) => (
            <button key={label} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-white/15 text-white font-semibold border border-white/20" : "text-white/60 hover:bg-white/8 hover:text-white/90"}`}>
              <Icon size={15} className={active ? "text-violet-300" : "text-white/40"} />
              <span>{label}</span>
              {active && <ChevronRight size={13} className="ml-auto text-white/40" />}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50 hover:bg-white/8 hover:text-white/80">
            <Settings size={14} /> Настройки
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400">
            <LogOut size={14} /> Изход
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Табло</h1>
            <p className="text-xs text-slate-400">Вторник, 24 юни 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none w-44 placeholder:text-slate-400" placeholder="Търсене..." />
            </div>
            <button className="relative p-2 rounded-lg text-slate-500 border border-slate-200 bg-white">
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              ИП
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: "Дипломни работи", value: "47", change: "+5 от миналия мес.", up: true, icon: BookOpen, accent: "indigo" },
              { label: "Предстоящи защити", value: "8", change: "+2 насрочени", up: true, icon: Calendar, accent: "violet" },
              { label: "Чакащи рецензии", value: "12", change: "−3 от миналия мес.", up: false, icon: FileText, accent: "amber" },
              { label: "Среден успех", value: "5.23", change: "+0.12 подобрение", up: true, icon: TrendingUp, accent: "emerald" },
            ].map(({ label, value, change, up, icon: Icon, accent }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent === "indigo" ? "bg-indigo-50" : accent === "violet" ? "bg-violet-50" : accent === "amber" ? "bg-amber-50" : "bg-emerald-50"}`}>
                    <Icon size={18} className={accent === "indigo" ? "text-indigo-600" : accent === "violet" ? "text-violet-600" : accent === "amber" ? "text-amber-600" : "text-emerald-600"} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
                    {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-0.5">{value}</div>
                <div className="text-xs text-slate-400 mb-1">{label}</div>
                <div className={`text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>{change}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="col-span-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-slate-800">Активност на дипломния процес</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Подадени vs Защитени — 2025/2026</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />Подадени</span>
                  <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Защитени</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={submissionData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11 }} />
                  <Area type="monotone" dataKey="подадени" stroke="#6366f1" strokeWidth={2} fill="url(#indigoGrad)" dot={false} />
                  <Area type="monotone" dataKey="защитени" stroke="#10b981" strokeWidth={2} fill="url(#emeraldGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold text-slate-800">По факултет</h2>
                <p className="text-xs text-slate-400 mt-0.5">Брой дипломни работи</p>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dept" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" name="Брой" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Последни дейности</h2>
              <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Виж всички →</button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {recent.map(({ name, action, time, initials, bg }) => (
                <div key={name} className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center text-white font-bold text-xs mb-2`}>
                    {initials}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate w-full">{name.split(" ")[0]}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight text-center line-clamp-2">{action}</div>
                  <div className="text-[10px] text-slate-300 mt-1.5 flex items-center gap-0.5"><Clock size={9} />{time}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
