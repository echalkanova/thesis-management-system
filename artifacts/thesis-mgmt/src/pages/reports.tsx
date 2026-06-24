import { useGetThesesReport, getGetThesesReportQueryKey, useGetGradesReport, getGetGradesReportQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { formatStatus } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#3b82f6",
  under_review: "#f59e0b",
  approved: "#22c55e",
  rejected: "#ef4444",
  defended: "#8b5cf6",
};

const GRADE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

export default function Reports() {
  const { data: thesesReport, isLoading: loadingTheses } = useGetThesesReport({}, { query: { queryKey: getGetThesesReportQueryKey({}) } });
  const { data: gradesReport, isLoading: loadingGrades } = useGetGradesReport({ query: { queryKey: getGetGradesReportQueryKey() } });

  const statusData = thesesReport ? Object.entries(thesesReport.byStatus).map(([status, count]) => ({
    name: formatStatus(status),
    count: count as number,
    fill: STATUS_COLORS[status] ?? "#64748b",
  })) : [];

  const fieldData = thesesReport ? Object.entries(thesesReport.byField).map(([field, count]) => ({
    name: field,
    count: count as number,
  })) : [];

  const monthData = thesesReport?.byMonth ?? [];

  const gradeDistData = gradesReport ? Object.entries(gradesReport.gradeDistribution).map(([grade, count], i) => ({
    name: grade === "2" ? "Слаб(2)" : grade === "3" ? "Среден(3)" : grade === "4" ? "Добър(4)" : grade === "5" ? "Мн.добър(5)" : "Отличен(6)",
    value: count as number,
    fill: GRADE_COLORS[i] ?? "#64748b",
  })) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">Справки и отчети</h1>
        <p className="text-slate-500">Статистика и анализ на дипломния процес</p>
      </div>

      {loadingTheses || loadingGrades ? (
        <div className="py-8 text-center text-slate-500">Зареждане на данни...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card><CardContent className="p-5 text-center"><div className="text-3xl font-bold text-[#0a192f]">{thesesReport?.totalCount ?? 0}</div><div className="text-sm text-slate-500 mt-1">Общо работи</div></CardContent></Card>
            <Card><CardContent className="p-5 text-center"><div className="text-3xl font-bold text-amber-600">{gradesReport?.averageGrade?.toFixed(2) ?? "—"}</div><div className="text-sm text-slate-500 mt-1">Среден успех</div></CardContent></Card>
            <Card><CardContent className="p-5 text-center"><div className="text-3xl font-bold text-green-600">{gradesReport?.passingRate?.toFixed(1) ?? 0}%</div><div className="text-sm text-slate-500 mt-1">Успеваемост</div></CardContent></Card>
            <Card><CardContent className="p-5 text-center"><div className="text-3xl font-bold text-purple-600">{thesesReport?.byStatus?.["defended"] ?? 0}</div><div className="text-sm text-slate-500 mt-1">Защитени</div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Дипломни работи по статус</CardTitle></CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Разпределение на оценките</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={gradeDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                      {gradeDistData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Подадени работи по месец</CardTitle></CardHeader>
              <CardContent>
                {monthData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Няма данни</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
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
              <CardHeader><CardTitle>Дипломни работи по област</CardTitle></CardHeader>
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
