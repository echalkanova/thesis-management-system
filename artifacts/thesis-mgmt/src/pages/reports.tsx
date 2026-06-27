import { useState } from "react";
import { useGetThesesReport, getGetThesesReportQueryKey, useGetGradesReport, getGetGradesReportQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { formatStatus } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#3b82f6",
  pending_supervisor_approval: "#eab308",
  returned_for_revision: "#f97316",
  approved_by_supervisor: "#84cc16",
  under_review: "#8b5cf6",
  reviewed: "#06b6d4",
  approved_for_defense: "#22c55e",
  scheduled_for_defense: "#6366f1",
  defended: "#0f766e",
};

const GRADE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

export default function Reports() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");

  const { data: thesesReport, isLoading: loadingTheses } = useGetThesesReport({}, { query: { queryKey: getGetThesesReportQueryKey({}) } });
  const { data: gradesReport, isLoading: loadingGrades } = useGetGradesReport({ query: { queryKey: getGetGradesReportQueryKey() } });

  const allStatuses = thesesReport ? Object.keys(thesesReport.byStatus as Record<string, number>) : [];
  const allFields = thesesReport ? Object.keys(thesesReport.byField as Record<string, number>).filter(f => f !== "Неопределено") : [];

  const statusData = thesesReport
    ? Object.entries(thesesReport.byStatus as Record<string, number>)
        .filter(([s]) => statusFilter === "all" || s === statusFilter)
        .map(([status, count]) => ({
          name: formatStatus(status),
          count: count as number,
          fill: STATUS_COLORS[status] ?? "#64748b",
        }))
    : [];

  const fieldData = thesesReport
    ? Object.entries(thesesReport.byField as Record<string, number>)
        .filter(([f]) => fieldFilter === "all" || f === fieldFilter)
        .map(([field, count]) => ({ name: field, count: count as number }))
    : [];

  const monthData = thesesReport?.byMonth ?? [];

  const gradeDistData = gradesReport
    ? Object.entries(gradesReport.gradeDistribution as Record<string, number>).map(([grade, count], i) => ({
        name: grade === "2" ? "Слаб(2)" : grade === "3" ? "Среден(3)" : grade === "4" ? "Добър(4)" : grade === "5" ? "Мн.добър(5)" : "Отличен(6)",
        value: count as number,
        fill: GRADE_COLORS[i] ?? "#64748b",
      }))
    : [];

  const clearFilters = () => { setStatusFilter("all"); setFieldFilter("all"); };
  const hasFilters = statusFilter !== "all" || fieldFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">Справки и отчети</h1>
        <p className="text-slate-500">Статистика и анализ на дипломния процес</p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap items-end gap-4">
        <div className="space-y-1.5 min-w-[180px]">
          <Label className="text-xs text-slate-500">Филтър по статус</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Всички статуси" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички статуси</SelectItem>
              {allStatuses.map(s => (
                <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 min-w-[180px]">
          <Label className="text-xs text-slate-500">Филтър по специалност</Label>
          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Всички специалности" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички специалности</SelectItem>
              {allFields.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-slate-500 h-9">
            Изчисти филтрите ✕
          </Button>
        )}
      </div>

      {loadingTheses || loadingGrades ? (
        <div className="py-8 text-center text-slate-500">Зареждане на данни...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card><CardContent className="p-5 text-center"><div className="text-3xl font-bold text-[#0a192f]">{thesesReport?.totalCount ?? 0}</div><div className="text-sm text-slate-500 mt-1">Общо работи</div></CardContent></Card>
            <Card><CardContent className="p-5 text-center"><div className="text-3xl font-bold text-amber-600">{gradesReport?.averageGrade?.toFixed(2) ?? "—"}</div><div className="text-sm text-slate-500 mt-1">Среден успех</div></CardContent></Card>
            <Card><CardContent className="p-5 text-center"><div className="text-3xl font-bold text-green-600">{gradesReport?.passingRate?.toFixed(1) ?? 0}%</div><div className="text-sm text-slate-500 mt-1">Успеваемост</div></CardContent></Card>
            <Card><CardContent className="p-5 text-center"><div className="text-3xl font-bold text-purple-600">{(thesesReport?.byStatus as Record<string, number>)?.["defended"] ?? 0}</div><div className="text-sm text-slate-500 mt-1">Защитени</div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Дипломни работи по статус{statusFilter !== "all" ? ` — ${formatStatus(statusFilter)}` : ""}</CardTitle></CardHeader>
              <CardContent>
                {statusData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Няма данни</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={statusData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Брой" radius={[4, 4, 0, 0]}>
                        {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Разпределение на оценките</CardTitle></CardHeader>
              <CardContent>
                {gradeDistData.every(d => d.value === 0) ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Няма оценки</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={gradeDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                        {gradeDistData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Подадени работи по месец</CardTitle></CardHeader>
              <CardContent>
                {(monthData as any[]).length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Няма данни</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthData as any[]} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" name="Брой" stroke="#0a192f" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Дипломни работи по специалност{fieldFilter !== "all" ? ` — ${fieldFilter}` : ""}</CardTitle></CardHeader>
              <CardContent>
                {fieldData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Няма данни</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={fieldData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="count" name="Брой" fill="#0a192f" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
