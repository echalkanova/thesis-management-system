import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Calendar, Clock, MapPin, Users, ChevronDown, Star } from "lucide-react";

export default function Defenses() {
  const { user } = useAuth();
  useEffect(() => {
    if (user?.role === "student") {
      localStorage.setItem(`defense_seen_${user.id}`, "true");
    }
  }, [user]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDeptHead = user?.role === "department_head";
  const isStudent = user?.role === "student";

  const [form, setForm] = useState({
    title: "", scheduledAt: "", room: "",
    startTime: "", endTime: "", committeeId: "", notes: ""
  });
  const [addStudentId, setAddStudentId] = useState<Record<number,string>>({});
  const [selectedStudentIds, setSelectedStudentIds] = useState<Record<number, Set<number>>>({});
  const [defenseDropdownOpen, setDefenseDropdownOpen] = useState<Record<number, boolean>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const token = localStorage.getItem("thesis_token");
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: allDefenses, isLoading } = useQuery({
    queryKey: ["defenses"],
    queryFn: async () => {
      const res = await fetch("/api/defenses", { headers: authHeaders });
      return res.json();
    },
  });

  const defenses = (user?.role === "supervisor" || user?.role === "reviewer")
    ? (allDefenses ?? []).filter((d: any) =>
        d.committee?.members?.some((m: any) => m.id === user?.id)
      )
    : allDefenses;

  const { data: myDefense } = useQuery({
    queryKey: ["my-defense"],
    queryFn: async () => {
      const res = await fetch("/api/defenses/my-defense", { headers: authHeaders });
      return res.json();
    },
    enabled: isStudent,
  });

  const { data: myGrade } = useQuery({
    queryKey: ["my-defense-grade", user?.id],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      if (!myDefense) return null;
      const res = await fetch(`/api/defenses/${(myDefense as any).id}/grades`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return null;
      const grades = await res.json();
      return grades.find((g: any) => g.studentId === user?.id) ?? null;
    },
    enabled: !!myDefense && isStudent,
  });

  const { data: committees } = useQuery({
    queryKey: ["committees"],
    queryFn: async () => {
      const res = await fetch("/api/committees", { headers: authHeaders });
      return res.json();
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students-approved-for-defense"],
    queryFn: async () => {
      const res = await fetch("/api/theses?status=approved_for_defense", { headers: authHeaders });
      const theses = await res.json();
      return theses.map((t: any) => t.student).filter(Boolean);
    },
    enabled: isDeptHead,
  });

  const createDefense = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/defenses", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ ...form, committeeId: form.committeeId ? Number(form.committeeId) : null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Защитата е насрочена" });
      queryClient.invalidateQueries({ queryKey: ["defenses"] });
      setForm({ title: "", scheduledAt: "", room: "", startTime: "", endTime: "", committeeId: "", notes: "" });
      setCreateDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const addStudent = useMutation({
    mutationFn: async ({ defenseId, studentId }: { defenseId: number; studentId: number }) => {
      const res = await fetch(`/api/defenses/${defenseId}/add-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ studentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => { toast({ title: "Студентът е добавен" }); queryClient.invalidateQueries({ queryKey: ["defenses"] }); },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const removeStudent = useMutation({
    mutationFn: async ({ defenseId, studentId }: { defenseId: number; studentId: number }) => {
      await fetch(`/api/defenses/${defenseId}/remove-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ studentId }),
      });
    },
    onSuccess: () => { toast({ title: "Студентът е премахнат" }); queryClient.invalidateQueries({ queryKey: ["defenses"] }); },
  });

  const deleteDefense = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/defenses/${id}`, { method: "DELETE", headers: authHeaders });
    },
    onSuccess: () => { toast({ title: "Защитата е изтрита" }); queryClient.invalidateQueries({ queryKey: ["defenses"] }); },
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;

  // STUDENT VIEW
  if (isStudent) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a192f]">Моята защита</h1>
        {!myDefense ? (
          <Card><CardContent className="py-12 text-center text-slate-400">Все още нямате насрочена защита.</CardContent></Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />{myDefense.title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Дата</p>
                    <p className="font-medium text-sm">{new Date(myDefense.scheduledAt).toLocaleDateString("bg")}</p>
                  </div>
                </div>
                {myDefense.startTime && (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Начален час</p>
                      <p className="font-medium text-sm">{myDefense.startTime}</p>
                    </div>
                  </div>
                )}
                {myDefense.room && (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Комисия</p>
                      <p className="font-medium text-sm">Комисия {myDefense.committee?.romanNumeral}</p>
                    </div>
                  </div>
                )}
                {myDefense.room && (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Зала</p>
                      <p className="font-medium text-sm">{myDefense.room}</p>
                    </div>
                  </div>
                )}
              </div>
              {myDefense.notes && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-400 mb-1">Бележки</p>
                  <p className="text-sm text-blue-800">{myDefense.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {myGrade && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" /> Оценка от защитата
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-amber-600">
                    {Number(myGrade.grade).toFixed(2)}
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">
                      {Number(myGrade.grade) >= 5.5 ? "Отличен" :
                       Number(myGrade.grade) >= 4.5 ? "Много добър" :
                       Number(myGrade.grade) >= 3.5 ? "Добър" :
                       Number(myGrade.grade) >= 2.5 ? "Среден" : "Слаб"}
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Нанесена от председателя на комисията
                      {(myDefense as any).committee?.members?.find((m: any) => m.isChairman) && 
                        ` - ${(myDefense as any).committee.members.find((m: any) => m.isChairman).firstName} ${(myDefense as any).committee.members.find((m: any) => m.isChairman).lastName}`
                      }.
                    </p>
                  </div>
                </div>
                {myGrade.createdAt && (
                  <div className="text-flex-shrink-0">
                    <p className="text-sm text-amber-900">Час: {new Date(myGrade.createdAt).toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-sm text-amber-900">Дата: {new Date(myGrade.createdAt).toLocaleDateString("bg")}</p>
                    
                  </div>
                )}
             
          </div>
            </CardContent>
          </Card>
        )}
      </div>
      
    );
  }

  // DEPARTMENT HEAD / ADMIN / SUPERVISOR / REVIEWER VIEW
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f]">График на защитите</h1>
          {!["supervisor", "admin"].includes(user?.role ?? "") && (
            <p className="text-slate-500 text-sm"></p>
          )}
        </div>
        {isDeptHead && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0a192f] text-white"><Plus className="h-4 w-4 mr-2" />Насрочи защита</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Насрочи защита</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Заглавие *</Label>
                  <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Защита Юли 2027..." />
                </div>
                <div className="space-y-2">
                  <Label>Дата *</Label>
                  <Input type="date" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Начален час</Label>
                  <Select value={form.startTime} onValueChange={v => setForm(p => ({ ...p, startTime: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Изберете час..." />
                    </SelectTrigger>
                    <SelectContent side="bottom" className="max-h-48 overflow-y-auto">
                      {Array.from({ length: 19 }, (_, i) => {
                        const hour = Math.floor(i / 2) + 8;
                        const min = i % 2 === 0 ? "00" : "30";
                        const time = `${String(hour).padStart(2, "0")}:${min}`;
                        return <SelectItem key={time} value={time}>{time}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Зала</Label>
                  <Input value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="2103, 710..." />
                </div>
                <div className="space-y-2">
                  <Label>Комисия</Label>
                  <Select value={form.committeeId} onValueChange={v => setForm(p => ({ ...p, committeeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Изберете комисия" /></SelectTrigger>
                    <SelectContent>
                      {committees?.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          Комисия {c.romanNumeral}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {form.committeeId && (() => {
                    const selected = committees?.find((c: any) => String(c.id) === form.committeeId);
                    if (!selected) return null;
                    return (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        {selected.chairman && (
                          <p className="text-xs text-amber-700 font-medium">
                            Председател: {selected.chairman.firstName} {selected.chairman.lastName}
                          </p>
                        )}
                        {selected.members?.filter((m: any) => !m.isChairman).map((m: any) => (
                          <p key={m.id} className="text-xs text-slate-500">
                            • {m.firstName} {m.lastName}
                          </p>
                        ))}
                      </div>
                    );
                  })()}

                </div>
                <div className="space-y-2">
                  <Label>Бележки</Label>
                  <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Допълнителна информация..." />
                </div>
                <Button className="w-full bg-[#0a192f] text-white"
                  disabled={!form.title || !form.scheduledAt || createDefense.isPending}
                  onClick={() => createDefense.mutate()}>
                  {createDefense.isPending ? "Запазване..." : "Насрочи"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!defenses?.length && (
          <Card><CardContent className="py-12 text-center text-slate-400">Няма насрочени защити</CardContent></Card>
        )}
        {defenses?.map((d: any) => (
          <Card key={d.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0a192f] truncate">{d.title}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(d.scheduledAt).toLocaleDateString("bg")}</span>
                      {d.startTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{d.startTime}</span>}
                      {d.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Зала {d.room}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {new Date(d.scheduledAt) < new Date() ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">✓ Проведена</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">Изчаква провеждане</span>
                    )}
                    {d.students?.some((s: any) => d.grades?.find((g: any) => g.studentId === s.id)) ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">✓ Оценена</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 font-medium">🕐 Изчаква оценяване</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.committee && (
                    <Link href={`/defenses/${d.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="text-xs w-full">
                        Виж подробности →
                      </Button>
                    </Link>
                  )}
                {isDeptHead && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Изтриване на защита</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-slate-600">Сигурни ли сте, че искате да изтриете тази защита?</p>
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-300"
                          onClick={() => deleteDefense.mutate(d.id)}>
                          Да, изтрий
                        </Button>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">Отказ</Button>
                        </DialogTrigger>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              </div>
            </CardContent>
            <CardContent className="space-y-3">
              {isDeptHead && (
                <div className="pt-2 border-t space-y-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDefenseDropdownOpen(prev => ({ ...prev, [d.id]: !prev[d.id] }))}
                      className="w-full h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs text-left flex items-center justify-between"
                    >
                      <span className={selectedStudentIds[d.id]?.size > 0 ? "text-slate-800" : "text-slate-400"}>
                        {selectedStudentIds[d.id]?.size > 0 ? `Избрани: ${selectedStudentIds[d.id].size}` : "Добави студенти..."}
                      </span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </button>
                    {defenseDropdownOpen[d.id] && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setDefenseDropdownOpen(prev => ({ ...prev, [d.id]: false }))} />
                        <div className="absolute left-0 right-0 mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                          <div className="max-h-40 overflow-y-auto">
                            {students?.filter((s: any) => {
                                if (d.students?.some((ds: any) => ds.id === s.id)) return false;
                                // Скрий студенти вече добавени в друга защита
                                if (defenses?.some((def: any) => def.id !== d.id && def.students?.some((ds: any) => ds.id === s.id))) return false;
                                return true;
                              }).map((s: any) => (
                              <label key={s.id}
                                onClick={() => setSelectedStudentIds(prev => {
                                  const current = new Set(prev[d.id] ?? []);
                                  current.has(s.id) ? current.delete(s.id) : current.add(s.id);
                                  return { ...prev, [d.id]: current };
                                })}
                                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50 text-xs ${selectedStudentIds[d.id]?.has(s.id) ? "bg-indigo-50" : ""}`}>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedStudentIds[d.id]?.has(s.id) ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
                                  {selectedStudentIds[d.id]?.has(s.id) && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                {s.firstName} {s.lastName}
                              </label>
                            ))}
                          </div>
                          <div className="border-t p-2">
                            <Button className="w-full bg-[#0a192f] text-white h-7 text-xs"
                              onClick={() => setDefenseDropdownOpen(prev => ({ ...prev, [d.id]: false }))}>
                              {selectedStudentIds[d.id]?.size > 0 ? `Избери (${selectedStudentIds[d.id].size})` : "Избери"}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <Button size="sm" className="w-full h-8 bg-[#0a192f] text-white text-xs"
                    disabled={!selectedStudentIds[d.id]?.size || addStudent.isPending}
                    onClick={async () => {
                      for (const studentId of (selectedStudentIds[d.id] ?? new Set())) {
                        const res = await fetch(`/api/defenses/${d.id}/add-student`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", ...authHeaders },
                          body: JSON.stringify({ studentId }),
                        });
                        const json = await res.json();
                        if (!res.ok) {
                          toast({ title: "Грешка", description: json.error, variant: "destructive" });
                        }
                      }
                      queryClient.invalidateQueries({ queryKey: ["defenses"] });
                      setSelectedStudentIds(prev => ({ ...prev, [d.id]: new Set() }));
                    }}>
                    <Plus className="h-3 w-3 mr-1" /> {selectedStudentIds[d.id]?.size > 0 ? `Добави (${selectedStudentIds[d.id].size})` : "Добави"}                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
