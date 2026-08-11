import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Search } from "lucide-react";
import { formatRole } from "@/lib/utils";

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
  create_thesis: "Създаде дипломна работа",
  submit_thesis: "Подаде дипломна работа",
  approve_thesis: "Одобри дипломна работа",
  return_thesis: "Върна за корекции",
  create_grade: "Добави оценка",
  create_review: "Добави рецензия",
  publish_review: "Публикува рецензия",
};

const ACTION_COLORS: Record<string, string> = {
  create_thesis: "bg-blue-50 text-blue-700 border-blue-200",
  submit_thesis: "bg-indigo-50 text-indigo-700 border-indigo-200",
  approve_thesis: "bg-green-50 text-green-700 border-green-200",
  return_thesis: "bg-orange-50 text-orange-700 border-orange-200",
  create_grade: "bg-amber-50 text-amber-700 border-amber-200",
  create_review: "bg-cyan-50 text-cyan-700 border-cyan-200",
  publish_review: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AuditLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    return (
      !q ||
      log.action.includes(q) ||
      log.user?.firstName?.toLowerCase().includes(q) ||
      log.user?.lastName?.toLowerCase().includes(q) ||
      log.user?.email?.toLowerCase().includes(q) ||
      log.entityType.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f] tracking-tight flex items-center gap-2">
            <Shield className="h-7 w-7" /> Активност
          </h1>
          <p className="text-slate-500 mt-1">Пълна история на действията в системата</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Търсене..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {loading ? "Зареждане..." : `${filtered.length} записа`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Зареждане...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">Няма записи</div>
          ) : (
            <div className="divide-y">
              {filtered.map(log => (
                <div key={log.id} className="flex items-start gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                  <div className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5">
                    {new Date(log.createdAt).toLocaleString("bg", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-xs ${ACTION_COLORS[log.action] ?? "bg-slate-50 text-slate-600"}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {log.entityType}{log.entityId != null ? ` #${log.entityId}` : ""}
                      </span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                  </div>
                  {log.user && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium text-slate-700">{log.user.firstName} {log.user.lastName}</div>
                      <div className="text-xs text-slate-400">{formatRole(log.user.role)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
