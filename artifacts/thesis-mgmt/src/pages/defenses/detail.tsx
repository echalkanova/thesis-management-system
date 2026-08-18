import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetDefense, getGetDefenseQueryKey, useListUsers, getListUsersQueryKey, useDeleteDefense, getListDefensesQueryKey, useListTheses, getListThesesQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Clock, Trash2, Calendar, Crown, Star, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

function apiHeaders(): Record<string, string> {
  const token = localStorage.getItem("thesis_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const GRADES = [
  "6.00", "5.75", "5.50", "5.25", "5.00",
  "4.75", "4.50", "4.25", "4.00",
  "3.75", "3.50", "3.25", "3.00", "2.00"
];

function gradeLabel(v: number) {
  if (v >= 5.5) return "Отличен";
  if (v >= 4.5) return "Много добър";
  if (v >= 3.5) return "Добър";
  if (v >= 2.5) return "Среден";
  return "Слаб";
}

export default function DefenseDetail() {
  const { id } = useParams<{ id: string }>();
  const defenseId = Number(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedGrades, setSelectedGrades] = useState<Record<number, string>>({});
  const [defendedStudents, setDefendedStudents] = useState<Set<number>>(new Set());

  const { data: defense, isLoading } = useGetDefense(defenseId, { query: { queryKey: getGetDefenseQueryKey(defenseId) } });
  const { data: users } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });
  const { data: theses } = useListTheses({}, { query: { queryKey: getListThesesQueryKey({}) } });
  const deleteDefense = useDeleteDefense();

  // Проверка дали потребителят е председател на тази комисия
  const isChairman = (defense as any)?.committee?.members?.some(
    (m: any) => m.id === user?.id && m.isChairman
  ) ?? false;
  console.log("user?.id:", user?.id, "isChairman:", isChairman, "members:", (defense as any)?.committee?.members);

  // Зареждане на нанесените оценки
  const { data: defenseGrades, refetch: refetchGrades } = useQuery({
    queryKey: ["defense-grades", defenseId],
    queryFn: async () => {
      const res = await fetch(`/api/defenses/${defenseId}/grades`, { headers: apiHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!defenseId,
  });

  const addGrade = useMutation({
    mutationFn: async ({ studentId, grade }: { studentId: number; grade: string }) => {
      const res = await fetch(`/api/defenses/${defenseId}/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiHeaders() },
        body: JSON.stringify({ studentId, grade: Number(grade) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Грешка");
      return json;
    },
    onSuccess: (_, { studentId }) => {
      toast({ title: "Оценката е нанесена успешно" });
      refetchGrades();
      queryClient.invalidateQueries({ queryKey: getListThesesQueryKey({}) });
      queryClient.invalidateQueries({ queryKey: getGetDefenseQueryKey(defenseId) });
      queryClient.invalidateQueries({ queryKey: getListThesesQueryKey({} as any) });
      queryClient.invalidateQueries({ queryKey: ["theses"] });
      setSelectedGrades(prev => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const markDefended = useMutation({
    mutationFn: async (studentId: number) => {
      const res = await fetch(`/api/defenses/${defenseId}/mark-defended`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiHeaders() },
        body: JSON.stringify({ studentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Грешка");
      return json;
    },
    onSuccess: (_, studentId) => {
      toast({ title: "Студентът е маркиран като защитил" });
      refetchGrades();
      setDefendedStudents(prev => new Set([...prev, studentId]));
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;
  if (!defense) return <div className="p-8 text-center text-slate-500">Защитата не е намерена.</div>;

  const date = new Date(defense.scheduledAt);
  const isPast = date < new Date();
  const committeeMembers = (defense as any).committee?.members ?? [];
  const defenseStudents = (defense as any).students ?? [];

  const getStudentGrade = (studentId: number) => {
    return defenseGrades?.find((g: any) => g.studentId === studentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/defenses" data-testid="link-back-defenses">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0a192f]">{defense.title}</h1>
            <Badge variant="outline" className={isPast ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-green-50 text-green-700 border-green-200"}>
              {isPast ? "Проведена" : "Предстояща"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{date.toLocaleDateString("bg", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{(defense as any).startTime ?? date.toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" })}</span>
            {defense.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{defense.location}</span>}
          </div>
        </div>
        {user?.role === "department_head" && (
          <Button variant="destructive" size="sm" disabled={deleteDefense.isPending} data-testid="button-delete-defense"
            onClick={() => deleteDefense.mutate({ id: defenseId }, {
              onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListDefensesQueryKey({}) }); toast({ title: "Защитата е изтрита" }); setLocation("/defenses"); }
            })}>
            <Trash2 className="h-4 w-4 mr-1" /> Изтрий
          </Button>
        )}
      </div>

      {defense.notes && (
        <Card>
          <CardHeader><CardTitle>Бележки</CardTitle></CardHeader>
          <CardContent><p className="text-slate-700">{defense.notes}</p></CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Комисия ({committeeMembers.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {committeeMembers.length === 0 ? (
              <p className="text-slate-400 text-sm italic">Няма членове на комисия</p>
            ) : (
              [...committeeMembers].sort((a: any, b: any) => (b.isChairman ? 1 : 0) - (a.isChairman ? 1 : 0)).map((u: any) => (
                <div key={u.id} className={`flex items-center justify-between p-3 rounded-lg border ${u.isChairman ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center gap-3">
                    {u.isChairman && <Crown className="h-3 w-3 text-amber-600 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-[#0a192f]">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-500">{u.isChairman ? "Председател" : "Член"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-5 w-5 text-amber-500" /> Оценки
              </CardTitle>
              {isChairman && defenseStudents.length > 0 && (
                <Button className="bg-[#0a192f] text-white h-8 text-sm px-4"
                  disabled={Object.values(selectedGrades).filter(Boolean).length === 0 || addGrade.isPending}
                  onClick={async () => {
                    console.log("selectedGrades:", selectedGrades);
                    for (const [studentId, grade] of Object.entries(selectedGrades)) {
                      console.log("Sending grade:", studentId, grade);
                      await addGrade.mutateAsync({ studentId: Number(studentId), grade });
                    }
                  }}>
                  {addGrade.isPending ? "Нанасяне..." : "Нанеси оценките"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {defenseStudents.length === 0 ? (
              <p className="text-slate-400 text-sm italic">Няма добавени студенти</p>
            ) : (
              defenseStudents.map((s: any) => {
                const existingGrade = getStudentGrade(s.id);
                return (
                  <div key={s.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-base text-[#0a192f]">{s.firstName} {s.lastName}</p>
                        {(s.specialty || s.faculty || s.degree) && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {[s.specialty, s.faculty, s.degree === "bachelor" ? "Бакалавър" : s.degree === "master" ? "Магистър" : s.degree].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {existingGrade && (
                          <p className="text-sm text-slate-500 mt-0.5">{gradeLabel(Number(existingGrade.grade))}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {isChairman && !existingGrade && (
                          <Button size="sm" variant="outline"
                            className={`text-xs h-8 ${defendedStudents.has(s.id) ? "border-green-200 text-green-600 bg-green-50 cursor-not-allowed opacity-70" : "border-green-300 text-green-700 hover:bg-green-50"}`}
                            disabled={markDefended.isPending || defendedStudents.has(s.id)}
                            onClick={() => markDefended.mutate(s.id)}>
                            ✓ {defendedStudents.has(s.id) ? "Защитил" : "Маркирай като защитил"}
                          </Button>
                        )}
                        {existingGrade ? (
                          <span className="text-xl font-bold text-amber-600">{Number(existingGrade.grade).toFixed(2)}</span>
                        ) : isChairman ? (
                          <Select value={selectedGrades[s.id] ?? ""} onValueChange={v => { console.log("Grade selected:", s.id, v); setSelectedGrades(prev => ({ ...prev, [s.id]: v })); }}>
                            <SelectTrigger className="w-32 h-9 text-sm">
                              <SelectValue placeholder="Оценка" />
                            </SelectTrigger>
                            <SelectContent className="max-h-48 overflow-y-auto">
                              {GRADES.map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Няма оценка</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {!isChairman && defenseStudents.length > 0 && (
              <p className="text-xs text-slate-400 text-center italic">Само председателят на комисията може да нанася оценки</p>
            )}
          </CardContent>
        </Card>
            </div>
    </div>
  );
}
