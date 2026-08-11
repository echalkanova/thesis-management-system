import { useState } from "react";
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
import { Plus, Trash2, Calendar, Clock, MapPin, Users } from "lucide-react";

export default function Defenses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDeptHead = user?.role === "department_head";
  const isStudent = user?.role === "student";

  const [form, setForm] = useState({
    title: "", scheduledAt: "", room: "",
    startTime: "", endTime: "", committeeId: "", notes: ""
  });
  const [addStudentId, setAddStudentId] = useState<Record<number,string>>({});

  const token = localStorage.getItem("thesis_token");
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: defenses, isLoading } = useQuery({
    queryKey: ["defenses"],
    queryFn: async () => {
      const res = await fetch("/api/defenses", { headers: authHeaders });
      return res.json();
    },
  });

  const { data: myDefense } = useQuery({
    queryKey: ["my-defense"],
    queryFn: async () => {
      const res = await fetch("/api/defenses/my-defense", { headers: authHeaders });
      return res.json();
    },
    enabled: isStudent,
  });

  const { data: committees } = useQuery({
    queryKey: ["committees"],
    queryFn: async () => {
      const res = await fetch("/api/committees", { headers: authHeaders });
      return res.json();
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students-only"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=student", { headers: authHeaders });
      return res.json();
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
          <Card><CardContent className="py-12 text-center text-slate-400">Все още нямате насрочена защита</CardContent></Card>
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
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Зала</p>
                      <p className="font-medium text-sm">{myDefense.room}</p>
                    </div>
                  </div>
                )}
                {myDefense.committee && (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Комисия</p>
                      <p className="font-medium text-sm">Комисия {myDefense.committee.romanNumeral}</p>
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
            <p className="text-slate-500 text-sm">Насрочвайте и управлявайте защитите</p>
          )}
        </div>
        {isDeptHead && (
          <Dialog>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Начален час</Label>
                    <Input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Краен час</Label>
                    <Input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
                  </div>
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
                        <SelectItem key={c.id} value={String(c.id)}>Комисия {c.romanNumeral}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      <div className="space-y-4">
        {!defenses?.length && (
          <Card><CardContent className="py-12 text-center text-slate-400">Няма насрочени защити</CardContent></Card>
        )}
        {defenses?.map((d: any) => (
          <Card key={d.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{d.title}</CardTitle>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(d.scheduledAt).toLocaleDateString("bg")}</span>
                    {d.startTime && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{d.startTime}{d.endTime ? ` – ${d.endTime}` : ""}</span>}
                    {d.room && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Зала {d.room}</span>}
                    {d.committee && <Badge variant="outline">Комисия {d.committee.romanNumeral}</Badge>}
                  </div>
                </div>
                {isDeptHead && (
                  <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600"
                    onClick={() => deleteDefense.mutate(d.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Студенти ({d.students?.length ?? 0})</p>
                <div className="space-y-1">
                  {d.students?.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm">{s.firstName} {s.lastName}</span>
                      {isDeptHead && (
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400"
                          onClick={() => removeStudent.mutate({ defenseId: d.id, studentId: s.id })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isDeptHead && (
                <div className="flex gap-2 pt-2 border-t">
                  <Select onValueChange={v => setAddStudentId(prev => ({ ...prev, [d.id]: v }))}>
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder="Добави студент..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-8 bg-[#0a192f] text-white px-3"
                    disabled={!addStudentId[d.id] || addStudent.isPending}
                    onClick={() => addStudent.mutate({ defenseId: d.id, studentId: Number(addStudentId[d.id]) })}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
