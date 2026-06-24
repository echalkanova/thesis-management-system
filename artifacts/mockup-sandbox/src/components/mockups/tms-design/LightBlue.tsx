import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  LayoutDashboard, BookOpen, Calendar, FileText, Users, BarChart2,
  Bell, Search, Settings, HelpCircle, LogOut, User, TrendingUp,
  ChevronRight, GraduationCap, Clock, CheckCircle, AlertCircle
} from "lucide-react";

const submissionData = [
  { month: "Яну", count: 4 }, { month: "Фев", count: 7 }, { month: "Мар", count: 5 },
  { month: "Апр", count: 9 }, { month: "Май", count: 12 }, { month: "Юни", count: 18 },
  { month: "Юли", count: 8 }, { month: "Авг", count: 6 }, { month: "Сеп", count: 14 },
  { month: "Окт", count: 11 }, { month: "Ное", count: 16 }, { month: "Дек", count: 22 },
];

const gradeData = [
  { grade: "Слаб(2)", count: 2, fill: "#ef4444" },
  { grade: "Среден(3)", count: 5, fill: "#f97316" },
  { grade: "Добър(4)", count: 12, fill: "#eab308" },
  { grade: "Мн.добър(5)", count: 18, fill: "#22c55e" },
  { grade: "Отличен(6)", count: 14, fill: "#3b82f6" },
];

const recent = [
  { name: "Мария Иванова", action: "Подаде дипломна работа", time: "2 мин", color: "bg-blue-500", status: "submitted" },
  { name: "Георги Петров", action: "Получи рецензия", time: "18 мин", color: "bg-green-500", status: "reviewed" },
  { name: "Ана Николова", action: "Насрочена защита", time: "1 ч", color: "bg-amber-500", status: "defense" },
  { name: "Иван Стоянов", action: "Оценка 5.75", time: "3 ч", color: "bg-purple-500", status: "graded" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Табло", active: true },
  { icon: BookOpen, label: "Дипломни работи", active: false },
  { icon: Calendar, label: "Защити", active: false },
  { icon: FileText, label: "Рецензии", active: false },
  { icon: Users, label: "Потребители", active: false },
  { icon: BarChart2, label: "Справки", active: false },
];

export function LightBlue() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shadow-sm flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">TMS</span>
          </div>
        </div>

        {/* User profile */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              ИП
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">Иван Петров</div>
              <div className="text-xs text-slate-400">Администратор</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">Главно меню</div>
          {navItems.map(({ icon: Icon, label, active }) => (
            <button key={label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Icon size={16} className={active ? "text-blue-600" : "text-slate-400"} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-blue-400" />}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-100 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
            <HelpCircle size={16} className="text-slate-400" /> Помощ
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
            <Settings size={16} className="text-slate-400" /> Настройки
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-50">
            <LogOut size={16} /> Изход
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Табло</h1>
            <p className="text-xs text-slate-400">Вторник, 24 юни 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-100 w-48" placeholder="Търсене..." />
            </div>
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-50 border border-slate-200">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
              ИП
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Дипломни работи", value: "47", delta: "+5", icon: BookOpen, color: "blue" },
              { label: "Предстоящи защити", value: "8", delta: "+2", icon: Calendar, color: "amber" },
              { label: "Чакащи рецензии", value: "12", delta: "-3", icon: FileText, color: "orange" },
              { label: "Среден успех", value: "5.23", delta: "+0.1", icon: TrendingUp, color: "green" },
            ].map(({ label, value, delta, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color === "blue" ? "bg-blue-50" : color === "amber" ? "bg-amber-50" : color === "orange" ? "bg-orange-50" : "bg-green-50"}`}>
                    <Icon size={16} className={color === "blue" ? "text-blue-600" : color === "amber" ? "text-amber-600" : color === "orange" ? "text-orange-600" : "text-green-600"} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${delta.startsWith("+") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{delta}</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {/* Submissions chart */}
            <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-slate-800 text-sm">Подадени дипломни работи</h2>
                  <p className="text-xs text-slate-400">По месеци за 2025/2026 уч. год.</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">Тази година</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={submissionData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" name="Работи" stroke="#3b82f6" strokeWidth={2.5} fill="url(#blueGrad)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Grade distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold text-slate-800 text-sm">Оценки</h2>
                <p className="text-xs text-slate-400">Разпределение</p>
              </div>
              <div className="flex justify-center mb-3">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={gradeData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="count" paddingAngle={3}>
                      {gradeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {gradeData.slice(-3).map((item) => (
                  <div key={item.grade} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="text-slate-500 truncate">{item.grade}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Recent activity */}
            <div className="col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800 text-sm">Последни дейности</h2>
                <button className="text-xs text-blue-600 font-medium">Всички →</button>
              </div>
              <div className="space-y-3">
                {recent.map(({ name, action, time, color }) => (
                  <div key={name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{name}</div>
                      <div className="text-xs text-slate-400">{action}</div>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                      <Clock size={11} />{time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status overview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h2 className="font-semibold text-slate-800 text-sm mb-4">Статус на работите</h2>
              <div className="space-y-3">
                {[
                  { label: "Чернова", count: 8, color: "bg-slate-400", pct: 17 },
                  { label: "Подадени", count: 12, color: "bg-blue-500", pct: 26 },
                  { label: "В рецензия", count: 9, color: "bg-amber-500", pct: 19 },
                  { label: "Одобрени", count: 11, color: "bg-green-500", pct: 23 },
                  { label: "Защитени", count: 7, color: "bg-purple-500", pct: 15 },
                ].map(({ label, count, color, pct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-semibold text-slate-800">{count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full">
                      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
