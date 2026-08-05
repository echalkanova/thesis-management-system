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
import { Plus, Trash2, UserPlus, Users } from "lucide-react";

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default function Committees() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDeptHead = user?.role === "department_head" || user?.role === "admin";

  const [newRoman, setNewRoman] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedMember, setSelectedMember] = useState<Record<number, string>>({});
  const [assignStudent, setAssignStudent] = useState<Record<string, string>>({});

  const token = localStorage.getItem("thesis_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const { data: committees, isLoading } = useQuery({
    queryKey: ["committees"],
    queryFn: async () => {
      const res = await fetch("/api/committees", { headers });
      return res.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { headers });
      return res.json();
    },
    enabled: isDeptHead,
  });

  const { data: students } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=student", { headers });
      return res.json();
    },
    enabled: isDeptHead,
  });

  const { data: myCommittee } = useQuery({
    queryKey: ["my-committee"],
    queryFn: async () => {
      const res = await fetch("/api/committees/my-committee", { headers });
      return res.json();
    },
    enabled: user?.role === "student",
  });

  const createCommittee = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ romanNumeral: newRoman, description: newDesc }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Комисията е създадена" });
      queryClient.invalidateQueries({ queryKey: ["committees"] });
      setNewRoman("");
      setNewDesc("");
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const deleteCommittee = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/committees/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Грешка при изтриване");
    },
    onSuccess: () => {
      toast({ title: "Комисията е изтрита" });
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const addMember = useMutation({
    mutationFn: async ({ committeeId, userId }: { committeeId: number; userId: number }) => {
      const res = await fetch(`/api/committees/${committeeId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Членът е добавен" });
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const removeMember = useMutation({
    mutationFn: async ({ committeeId, userId }: { committeeId: number; userId: number }) => {
      const res = await fetch(`/api/committees/${committeeId}/members/${userId}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Грешка");
    },
    onSuccess: () => {
      toast({ title: "Членът е премахнат" });
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
  });

  const assignStudentToCommittee = useMutation({
    mutationFn: async ({ studentId, committeeId }: { studentId: number; committeeId: number }) => {
      const res = await fetch("/api/committees/assign-student", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ studentId, committeeId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Студентът е назначен към комисията" });
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;

  // SUPERVISOR READ-ONLY VIEW
  if (user?.role === "supervisor") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Комисии</h1>
          <p className="text-sm text-slate-400 mt-1">Преглед на всички изпитни комисии</p>
        </div>
        {!committees || committees.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-400">
              Няма създадени комисии
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {committees.map((c: any) => (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-slate-500" />
                    Комисия {c.romanNumeral}
                  </CardTitle>
                  {c.description && <p className="text-xs text-slate-400">{c.description}</p>}
                  <Badge variant="outline" className="w-fit">{c.members?.length ?? 0} членa</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {c.members?.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-3">Няма членове</p>
                  )}
                  {c.members?.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                        {m.firstName?.[0]}{m.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // STUDENT VIEW
  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a192f]">Моята комисия</h1>
        {!myCommittee ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-400">
              Все още не сте назначени към комисия
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Комисия {myCommittee.romanNumeral}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myCommittee.members?.map((m: any) => (
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
          <p className="text-slate-500 text-sm mt-1">Създавайте и управлявайте комисии</p>
        </div>
        {isDeptHead && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#0a192f] text-white">
                <Plus className="h-4 w-4 mr-2" />Нова комисия
              </Button>
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
                <Button
                  className="w-full bg-[#0a192f] text-white"
                  disabled={!newRoman || createCommittee.isPending}
                  onClick={() => createCommittee.mutate()}
                >
                  {createCommittee.isPending ? "Създаване..." : "Създай"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Assign student to committee */}
      {isDeptHead && (
        <Card>
          <CardHeader><CardTitle>Назначи студент към комисия</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Студент</Label>
                <Select onValueChange={v => setAssignStudent(prev => ({ ...prev, student: v }))}>
                  <SelectTrigger><SelectValue placeholder="Изберете студент" /></SelectTrigger>
                  <SelectContent>
                    {students?.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Комисия</Label>
                <Select onValueChange={v => setAssignStudent(prev => ({ ...prev, committee: v }))}>
                  <SelectTrigger><SelectValue placeholder="Изберете комисия" /></SelectTrigger>
                  <SelectContent>
                    {committees?.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        Комисия {c.romanNumeral}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="bg-[#0a192f] text-white"
              disabled={!assignStudent.student || !assignStudent.committee || assignStudentToCommittee.isPending}
              onClick={() => assignStudentToCommittee.mutate({
                studentId: Number(assignStudent.student),
                committeeId: Number(assignStudent.committee)
              })}
            >
              Назначи
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Committees list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {committees?.map((c: any) => (
          <Card key={c.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Комисия {c.romanNumeral}</CardTitle>
                {isDeptHead && (
                  <Button
                    size="icon" variant="ghost" className="text-red-400 hover:text-red-600"
                    onClick={() => deleteCommittee.mutate(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Badge variant="outline" className="w-fit">{c.members?.length ?? 0} членa</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {c.members?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-slate-400">{m.role}</p>
                  </div>
                  {isDeptHead && (
                    <Button
                      size="icon" variant="ghost" className="text-red-400 hover:text-red-600 h-7 w-7"
                      onClick={() => removeMember.mutate({ committeeId: c.id, userId: m.id })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}

              {isDeptHead && (
                <div className="flex gap-2 pt-2">
                  <Select onValueChange={v => setSelectedMember(prev => ({ ...prev, [c.id]: v }))}>
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder="Добави член..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        ?.filter((u: any) => ["supervisor", "reviewer", "committee_member", "department_head"].includes(u.role))
                        .map((u: any) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.firstName} {u.lastName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm" className="h-8 bg-[#0a192f] text-white px-2"
                    disabled={!selectedMember[c.id] || addMember.isPending}
                    onClick={() => addMember.mutate({ committeeId: c.id, userId: Number(selectedMember[c.id]) })}
                  >
                    <UserPlus className="h-3 w-3" />
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
