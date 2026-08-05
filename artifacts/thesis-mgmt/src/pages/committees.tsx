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
import { Plus, Trash2, UserPlus, Crown, Users } from "lucide-react";

const ROMAN_NUMERALS = ["I","II","III","IV","V","VI","VII","VIII","IX","X"];

export default function Committees() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDeptHead = ["department_head","admin"].includes(user?.role ?? "");

  const [newRoman, setNewRoman] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedMember, setSelectedMember] = useState<Record<number,string>>({});
  const [isChairman, setIsChairman] = useState<Record<number,boolean>>({});
  const [assignStudentId, setAssignStudentId] = useState("");
  const [assignCommitteeId, setAssignCommitteeId] = useState("");

  const token = localStorage.getItem("thesis_token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: committees, isLoading } = useQuery({
    queryKey: ["committees"],
    queryFn: async () => {
      const res = await fetch("/api/committees", { headers: authHeaders });
      return res.json();
    },
  });

  const { data: myCommittee } = useQuery({
    queryKey: ["my-committee"],
    queryFn: async () => {
      const res = await fetch("/api/committees/my-committee", { headers: authHeaders });
      return res.json();
    },
    enabled: user?.role === "student",
  });

  const { data: teachers } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: async () => {
      const res = await fetch("/api/users", { headers: authHeaders });
      const all = await res.json();
      return all.filter((u: any) => ["supervisor","reviewer","department_head"].includes(u.role));
    },
    enabled: isDeptHead,
  });

  const { data: students } = useQuery({
    queryKey: ["students-only"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=student", { headers: authHeaders });
      return res.json();
    },
    enabled: isDeptHead,
  });

  const createCommittee = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ romanNumeral: newRoman, description: newDesc }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => { toast({ title: "Комисията е създадена" }); queryClient.invalidateQueries({ queryKey: ["committees"] }); setNewRoman(""); setNewDesc(""); },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const deleteCommittee = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/committees/${id}`, { method: "DELETE", headers: authHeaders });
    },
    onSuccess: () => { toast({ title: "Комисията е изтрита" }); queryClient.invalidateQueries({ queryKey: ["committees"] }); },
  });

  const addMember = useMutation({
    mutationFn: async ({ committeeId, userId, chairman }: { committeeId: number; userId: number; chairman: boolean }) => {
      const res = await fetch(`/api/committees/${committeeId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ userId, isChairman: chairman }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => { toast({ title: "Членът е добавен" }); queryClient.invalidateQueries({ queryKey: ["committees"] }); },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const removeMember = useMutation({
    mutationFn: async ({ committeeId, userId }: { committeeId: number; userId: number }) => {
      await fetch(`/api/committees/${committeeId}/members/${userId}`, { method: "DELETE", headers: authHeaders });
    },
    onSuccess: () => { toast({ title: "Членът е премахнат" }); queryClient.invalidateQueries({ queryKey: ["committees"] }); },
  });

  const assignToCommittee = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/committees/assign-student", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ studentId: Number(assignStudentId), committeeId: Number(assignCommitteeId) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => { toast({ title: "Студентът е назначен" }); setAssignStudentId(""); setAssignCommitteeId(""); },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;

  // STUDENT VIEW
  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a192f]">Моята комисия</h1>
        {!myCommittee ? (
          <Card><CardContent className="py-12 text-center text-slate-400">Все още не сте назначени към комисия</CardContent></Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Комисия {myCommittee.romanNumeral}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myCommittee.chairman && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-semibold text-sm text-amber-800">Председател</p>
                    <p className="text-sm">{myCommittee.chairman.firstName} {myCommittee.chairman.lastName}</p>
                    <p className="text-xs text-slate-400">{myCommittee.chairman.email}</p>
                  </div>
                </div>
              )}
              {myCommittee.members?.filter((m: any) => !m.isChairman).map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#0a192f] flex items-center justify-center text-white text-xs font-bold">
                    {m.firstName?.[0]}{m.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-slate-400">{m.email}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // DEPARTMENT HEAD / ADMIN VIEW
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f]">Управление на комисии</h1>
          <p className="text-slate-500 text-sm">Създавайте и управлявайте изпитни комисии</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#0a192f] text-white"><Plus className="h-4 w-4 mr-2" />Нова комисия</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Създай комисия</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Римска цифра</Label>
                <Select value={newRoman} onValueChange={setNewRoman}>
                  <SelectTrigger><SelectValue placeholder="Изберете..." /></SelectTrigger>
                  <SelectContent>
                    {ROMAN_NUMERALS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Описание (по избор)</Label>
                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Описание..." />
              </div>
              <Button className="w-full bg-[#0a192f] text-white"
                disabled={!newRoman || createCommittee.isPending}
                onClick={() => createCommittee.mutate()}>
                {createCommittee.isPending ? "Създаване..." : "Създай"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assign student to committee */}
      <Card>
        <CardHeader><CardTitle>Назначи студент към комисия</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Студент</Label>
              <Select value={assignStudentId} onValueChange={setAssignStudentId}>
                <SelectTrigger><SelectValue placeholder="Изберете студент" /></SelectTrigger>
                <SelectContent>
                  {students?.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.firstName} {s.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Комисия</Label>
              <Select value={assignCommitteeId} onValueChange={setAssignCommitteeId}>
                <SelectTrigger><SelectValue placeholder="Изберете комисия" /></SelectTrigger>
                <SelectContent>
                  {committees?.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>Комисия {c.romanNumeral}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-[#0a192f] text-white"
              disabled={!assignStudentId || !assignCommitteeId || assignToCommittee.isPending}
              onClick={() => assignToCommittee.mutate()}>
              Назначи
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Committees grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {committees?.map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Комисия {c.romanNumeral}</CardTitle>
                <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600"
                  onClick={() => deleteCommittee.mutate(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant="outline" className="w-fit">{c.members?.length ?? 0} членa</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {c.members?.map((m: any) => (
                <div key={m.id} className={`flex items-center justify-between p-2 rounded-lg ${m.isChairman ? "bg-amber-50 border border-amber-200" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-2">
                    {m.isChairman && <Crown className="h-3 w-3 text-amber-600" />}
                    <div>
                      <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-slate-400">{m.isChairman ? "Председател" : m.role}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 h-7 w-7"
                    onClick={() => removeMember.mutate({ committeeId: c.id, userId: m.id })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <div className="pt-2 space-y-2 border-t">
                <Select onValueChange={v => setSelectedMember(prev => ({ ...prev, [c.id]: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Добави член..." /></SelectTrigger>
                  <SelectContent>
                    {teachers?.map((u: any) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.firstName} {u.lastName} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 bg-[#0a192f] text-white text-xs"
                    disabled={!selectedMember[c.id] || addMember.isPending}
                    onClick={() => addMember.mutate({ committeeId: c.id, userId: Number(selectedMember[c.id]), chairman: false })}>
                    <UserPlus className="h-3 w-3 mr-1" /> Добави член
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-amber-300 text-amber-700"
                    disabled={!selectedMember[c.id] || addMember.isPending}
                    onClick={() => addMember.mutate({ committeeId: c.id, userId: Number(selectedMember[c.id]), chairman: true })}>
                    <Crown className="h-3 w-3 mr-1" /> Председател
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
