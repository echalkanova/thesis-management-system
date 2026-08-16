import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Search } from "lucide-react";
import { formatRole } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuditEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: { id: number; firstName: string; lastName: string; email: string; role: string } | null;
}

const ACTION_LABELS: Record<string, string> = {
  login: "Влезе в системата",
  create_thesis: "Създаде дипломна работа",
  submit_thesis: "Подаде дипломна работа",
  approve_thesis: "Одобри дипломна работа",
  return_thesis: "Върна за корекции",
  select_reviewer: "Избра рецензент",
  approve_for_defense: "Допусна до защита",
  create_grade: "Добави оценка",
  create_review: "Добави рецензия",
  publish_review: "Публикува рецензия",
  assign_thesis: "Назначи дипломна работа",
  create_user: "Създаде профил",
  update_user: "Редактира профил",
  delete_user: "Изтри профил",
  create_defense: "Създаде защита",
  delete_defense: "Изтри защита",
  add_committee_member: "Добави член на комисия",
  create_committee: "Създаде комисия",
  delete_committee: "Изтри комисия",
  assign_student_committee: "Назначи студент към комисия",
  accept_request: "Одобри запитване",
  reject_request: "Отказа запитване",
};

const ACTION_COLORS: Record<string, string> = {
  create_thesis: "bg-blue-50 text-blue-700 border-blue-200",
  submit_thesis: "bg-indigo-50 text-indigo-700 border-indigo-200",
  approve_thesis: "bg-green-50 text-green-700 border-green-200",
  return_thesis: "bg-orange-50 text-orange-700 border-orange-200",
  create_grade: "bg-amber-50 text-amber-700 border-amber-200",
  create_review: "bg-cyan-50 text-cyan-700 border-cyan-200",
  publish_review: "bg-purple-50 text-purple-700 border-purple-200",
  login: "bg-slate-50 text-slate-600 border-slate-200",
  assign_thesis: "bg-violet-50 text-violet-700 border-violet-200",
  create_user: "bg-teal-50 text-teal-700 border-teal-200",
  update_user: "bg-sky-50 text-sky-700 border-sky-200",
  delete_user: "bg-red-50 text-red-700 border-red-200",
  select_reviewer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approve_for_defense: "bg-green-50 text-green-700 border-green-200",
  create_defense: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delete_defense: "bg-red-50 text-red-700 border-red-200",
  add_committee_member: "bg-violet-50 text-violet-700 border-violet-200",
  create_committee: "bg-blue-50 text-blue-700 border-blue-200",
  delete_committee: "bg-red-50 text-red-700 border-red-200",
  assign_student_committee: "bg-teal-50 text-teal-700 border-teal-200",
  accept_request: "bg-green-50 text-green-700 border-green-200",
  reject_request: "bg-red-50 text-red-700 border-red-200",
};

export default function AuditLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("thesis_token");
    fetch("/api/audit-log", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-slate-500">Нямате достъп до тази страница.</div>;
  }

  const filtered = logs.filter(log => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      log.action.includes(q) ||
      log.user?.firstName?.toLowerCase().includes(q) ||
      log.user?.lastName?.toLowerCase().includes(q) ||
      log.user?.email?.toLowerCase().includes(q) ||
      log.entityType.includes(q);
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f] tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" /> Активност
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Пълна история на действията в системата</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Търсене по име или имейл..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Всички дейности" />
            </SelectTrigger>
            <SelectContent className="max-h-96 overflow-y-auto">
              <SelectItem value="all">Всички дейности</SelectItem>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-100 bg-slate-50">
          <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Потребител</div>
          <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Имейл</div>
          <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Действие</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Роля</div>
          <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Дата</div>
        </div>

        {/* Table body */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">Зареждане...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">Няма записи</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(log => (
              <div key={log.id} className="grid grid-cols-12 px-6 py-4 hover:bg-slate-50 transition-colors items-center">
                {/* Потребител */}
                <div className="col-span-3 flex items-center gap-3">
                  {log.user ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                        {log.user.firstName?.[0]}{log.user.lastName?.[0]}
                      </div>
                      <span className="font-medium text-sm text-slate-800">
                        {log.user.firstName} {log.user.lastName}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Система</span>
                  )}
                </div>

                {/* Имейл */}
                <div className="col-span-3">
                  <span className="text-sm text-slate-500">{log.user?.email ?? "—"}</span>
                </div>

                {/* Действие */}
                <div className="col-span-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${ACTION_COLORS[log.action] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    {ACTION_LABELS[log.action] ?? log.action}
                  </Badge>
                  {log.details?.title != null && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                      {`${log.details.title}`}
                    </p>
                  )}
                </div>

                {/* Роля */}
                <div className="col-span-2">
                  {log.user ? (
                    <span className="text-xs text-slate-500">{formatRole(log.user.role)}</span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>

                {/* Дата */}
                <div className="col-span-1 text-right">
                  <div className="text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleDateString("bg", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400">{filtered.length} записа</span>
          </div>
        )}
      </div>
    </div>
  );
}
