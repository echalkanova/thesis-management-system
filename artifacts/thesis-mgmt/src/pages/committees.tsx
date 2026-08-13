import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UserPlus, Crown, Users, CheckCircle2, Search, ChevronDown } from "lucide-react";
import { formatRole } from "@/lib/utils";

export default function Committees() {
  const { user } = useAuth();
  useEffect(() => {
    if (user?.role === "student") {
      localStorage.setItem(`committee_seen_${user.id}`, "true");
    }
  }, [user]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDeptHead = user?.role === "department_head";
  const isSupervisor = user?.role === "supervisor";
  const isStudent = user?.role === "student";

  const [newName, setNewName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [addMembersCommitteeId, setAddMembersCommitteeId] = useState<number | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set());
  const [chairmanCommitteeId, setChairmanCommitteeId] = useState<number | null>(null);
  const [chairmanUserId, setChairmanUserId] = useState<number | null>(null);
  const [assignStudentIds, setAssignStudentIds] = useState<Set<number>>(new Set());
  const [assignCommitteeId, setAssignCommitteeId] = useState("");
  const [searchCommittee, setSearchCommittee] = useState("");
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);

  const token = localStorage.getItem("thesis_token");
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

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
    enabled: isStudent,
  });

  const supervisorCommittee = isSupervisor
    ? committees?.find((c: any) => c.members?.some((m: any) => m.id === user?.id))
    : null;

  const { data: teachers } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: async () => {
      const res = await fetch("/api/users", { headers: authHeaders });
      const all = await res.json();
      return all.filter((u: any) => ["supervisor", "reviewer", "department_head"].includes(u.role));
    },
    enabled: isDeptHead,
  });

  const { data: students } = useQuery({
    queryKey: ["students-only"],
    queryFn: async () => {
      const res = await fetch("/api/theses?status=reviewed", { headers: authHeaders });
      const theses = await res.json();
      return theses.map((t: any) => t.student).filter(Boolean);
    },
    enabled: isDeptHead,
  });

  const { data: assignedStudentIds } = useQuery({
    queryKey: ["assigned-students"],
    queryFn: async () => {
      const res = await fetch("/api/committees/assigned-students", { headers: authHeaders });
      return res.json();
    },
    enabled: isDeptHead,
  });

  const createCommittee = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ romanNumeral: newName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Комисията е създадена" });
      queryClient.invalidateQueries({ queryKey: ["committees"] });
      setNewName("");
      setCreateOpen(false);
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const deleteCommittee = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/committees/${id}`, { method: "DELETE", headers: authHeaders });
    },
    onSuccess: () => {
      toast({ title: "Комисията е изтрита" });
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
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
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const removeMember = useMutation({
    mutationFn: async ({ committeeId, userId }: { committeeId: number; userId: number }) => {
      await fetch(`/api/committees/${committeeId}/members/${userId}`, { method: "DELETE", headers: authHeaders });
    },
    onSuccess: () => {
      toast({ title: "Членът е премахнат" });
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
  });

  async function handleAddSelectedMembers() {
    if (!addMembersCommitteeId || selectedMemberIds.size === 0) return;
    const committee = getCommittee(addMembersCommitteeId);
    const currentCount = committee?.members?.length ?? 0;
    const totalAfter = currentCount + selectedMemberIds.size;
    if (totalAfter > 5) {
      toast({ title: "Грешка", description: "Максималният брой членове в комисия е 5.", variant: "destructive" });
      return;
    }
    if (totalAfter < 5) {
      toast({ title: "Внимание", description: `Трябва да изберете задължително 5 члена. Сега имате ${totalAfter}.`, variant: "destructive" });
      return;
    }
    let successCount = 0;
    for (const uid of selectedMemberIds) {
      try {
        await addMember.mutateAsync({ committeeId: addMembersCommitteeId, userId: uid, chairman: false });
        successCount++;
      } catch { /* individual errors shown by mutation */ }
    }
    queryClient.invalidateQueries({ queryKey: ["committees"] });
    toast({ title: `${successCount} члена добавени` });
    setSelectedMemberIds(new Set());
    setAddMembersCommitteeId(null);
  }

  async function handleSetChairman() {
    if (!chairmanCommitteeId || !chairmanUserId) return;
    await addMember.mutateAsync({ committeeId: chairmanCommitteeId, userId: chairmanUserId, chairman: true });
    queryClient.invalidateQueries({ queryKey: ["committees"] });
    toast({ title: "Председателят е зададен" });
    setChairmanUserId(null);
    setChairmanCommitteeId(null);
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;

  // STUDENT VIEW
  if (isStudent) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a192f]">Моята комисия</h1>
        {!myCommittee ? (
          <Card><CardContent className="py-12 text-center text-slate-400">Все още не сте назначени към комисия.</CardContent></Card>
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

  // SUPERVISOR VIEW
  if (isSupervisor) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a192f]">Моята комисия</h1>
        {!supervisorCommittee ? (
          <Card><CardContent className="py-12 text-center text-slate-400">Все още не сте назначени към комисия.</CardContent></Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Комисия {supervisorCommittee.romanNumeral}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supervisorCommittee.chairman && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-semibold text-sm text-amber-800">Председател</p>
                    <p className="text-sm">{supervisorCommittee.chairman.firstName} {supervisorCommittee.chairman.lastName}</p>
                    <p className="text-xs text-slate-400">{supervisorCommittee.chairman.email}</p>
                  </div>
                </div>
              )}
              {supervisorCommittee.members?.filter((m: any) => !m.isChairman).map((m: any) => (
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

  const getCommittee = (id: number | null) => committees?.find((c: any) => c.id === id);

  const availableTeachers = (committeeId: number | null) => {
    if (!committeeId || !teachers) return teachers ?? [];
    const committee = getCommittee(committeeId);
    const memberIds = new Set((committee?.members ?? []).map((m: any) => m.id));
    return teachers.filter((t: any) => !memberIds.has(t.id));
  };

  const filteredCommittees = (committees ?? []).filter((c: any) =>
    !searchCommittee || c.romanNumeral?.toLowerCase().includes(searchCommittee.toLowerCase())
  );

  // DEPARTMENT HEAD / ADMIN VIEW
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f]">{isDeptHead ? "Управление на комисии" : "Комисии"}</h1>
          {isDeptHead && <p className="text-slate-500 text-sm">Създавайте и управлявайте изпитни комисии</p>}
        </div>

        {isDeptHead && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0a192f] text-white"><Plus className="h-4 w-4 mr-2" />Нова комисия</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Създай комисия</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Римска цифра / Наименование</Label>
                  <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Например: I, II, III..."
                    onKeyDown={e => { if (e.key === "Enter" && newName.trim()) createCommittee.mutate(); }}
                  />
                </div>
                <Button
                  className="w-full bg-[#0a192f] text-white"
                  disabled={!newName.trim() || createCommittee.isPending}
                  onClick={() => createCommittee.mutate()}
                >
                  {createCommittee.isPending ? "Създаване..." : "Създай"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Assign students to committee — only dept head */}
      {isDeptHead && (
        <Card>
          <CardHeader><CardTitle>Назначи студенти към комисия</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Комисия</Label>
                <Select value={assignCommitteeId} onValueChange={setAssignCommitteeId}>
                  <SelectTrigger>
                    <SelectValue>
                      <span className="text-slate-400">Изберете комисия</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {committees?.map((c: any) => {
                    const hasChairman = !!c.chairman;
                    const hasMembers = (c.members?.length ?? 0) >= 5;
                    const isReady = hasChairman && hasMembers;
                    return (
                      <SelectItem key={c.id} value={String(c.id)} disabled={!isReady}>
                       {`Комисия ${c.romanNumeral}`}
                        {!isReady && (
                          <span className="text-xs text-red-400 ml-2">
                            {!hasChairman && !hasMembers ? "(липсват членове и председател)" :
                             !hasChairman ? "(липсва председател)" :
                             "(липсват членове)"}
                          </span>
                        )}
                      </SelectItem>
                    );
                  })}
                  </SelectContent>
                </Select>
              </div>
            

            <div className="space-y-2">
              <Label>Студенти</Label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setStudentDropdownOpen(prev => !prev)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                >
                  <span className={assignStudentIds.size > 0 ? "text-slate-800" : "text-slate-400"}>
                    {assignStudentIds.size > 0 ? `Избрани: ${assignStudentIds.size}` : "Изберете студенти..."}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {studentDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStudentDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="max-h-48 overflow-y-auto">
                        {students?.map((s: any) => (
                          <label key={s.id} 
                          onClick={() => {
                            if ((assignedStudentIds ?? []).includes(s.id)) return;
                            setAssignStudentIds(prev => {
                              const next = new Set(prev);
                              next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                              return next;
                            });
                          }}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          (assignedStudentIds ?? []).includes(s.id)
                            ? "opacity-60 cursor-not-allowed bg-slate-50"
                            : `cursor-pointer hover:bg-slate-50 ${assignStudentIds.has(s.id) ? "bg-indigo-50" : ""}`
                        }`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            assignStudentIds.has(s.id) ? "bg-indigo-600 border-indigo-600" :
                            (assignedStudentIds ?? []).includes(s.id) ? "bg-green-100 border-green-400" :
                            "border-slate-300"
                          }`}>
                            {(assignStudentIds.has(s.id) || (assignedStudentIds ?? []).includes(s.id)) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm flex-1">{s.firstName} {s.lastName}</span>
                          {(assignedStudentIds ?? []).includes(s.id) && (
                            <span className="text-xs text-green-600 font-medium">(назначен)</span>
                          )}
                          </label>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 p-2">
                        <Button className="w-full bg-[#0a192f] text-white h-8 text-xs"
                        disabled={assignStudentIds.size === 0}
                        onClick={() => setStudentDropdownOpen(false)}>
                        {assignStudentIds.size > 0 ? `Избери (${assignStudentIds.size})` : "Избери"}
                      </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {assignStudentIds.size > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {students?.filter((s: any) => assignStudentIds.has(s.id)).map((s: any) => (
                    <span key={s.id} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                      {s.firstName} {s.lastName}
                      <button onClick={() => setAssignStudentIds(prev => { const next = new Set(prev); next.delete(s.id); return next; })}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="bg-[#0a192f] text-white"
              disabled={assignStudentIds.size === 0 || !assignCommitteeId}
              onClick={async () => {
                for (const studentId of assignStudentIds) {
                  await fetch("/api/committees/assign-student", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...authHeaders },
                    body: JSON.stringify({ studentId, committeeId: Number(assignCommitteeId) }),
                  });
                }
                toast({ title: `${assignStudentIds.size} студент${assignStudentIds.size === 1 ? "" : "а"} назначен${assignStudentIds.size === 1 ? "" : "и"}` });
                queryClient.invalidateQueries({ queryKey: ["committees"] });
                setAssignStudentIds(new Set());
                setAssignCommitteeId("");
              }}
            >
              {assignStudentIds.size > 0 ? `Назначи (${assignStudentIds.size})` : "Назначи"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add members dialog */}
      <Dialog
        open={addMembersCommitteeId !== null}
        onOpenChange={open => { if (!open) { setAddMembersCommitteeId(null); setSelectedMemberIds(new Set()); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добави членове — Комисия {getCommittee(addMembersCommitteeId)?.romanNumeral}</DialogTitle>
            <p className="text-xs text-slate-400 mt-1">Изберете 5 члена на комисията</p>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {availableTeachers(addMembersCommitteeId).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Няма налични преподаватели за добавяне</p>
            ) : (
              availableTeachers(addMembersCommitteeId).map((t: any) => (
                <label key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMemberIds.has(t.id) ? "bg-indigo-50 border-indigo-300" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}>
                  <Checkbox
                    checked={selectedMemberIds.has(t.id)}
                    onCheckedChange={checked => {
                      setSelectedMemberIds(prev => {
                        const next = new Set(prev);
                        checked ? next.add(t.id) : next.delete(t.id);
                        return next;
                      });
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{t.firstName} {t.lastName}</p>
                    <p className="text-xs text-slate-400">Преподавател</p>
                  </div>
                  {selectedMemberIds.has(t.id) && <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />}
                </label>
              ))
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1"
              onClick={() => { setAddMembersCommitteeId(null); setSelectedMemberIds(new Set()); }}>
              Отказ
            </Button>
            <Button className="flex-1 bg-[#0a192f] text-white"
              disabled={selectedMemberIds.size === 0 || addMember.isPending}
              onClick={handleAddSelectedMembers}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Добави ({selectedMemberIds.size})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chairman dialog */}
      <Dialog
        open={chairmanCommitteeId !== null}
        onOpenChange={open => { if (!open) { setChairmanCommitteeId(null); setChairmanUserId(null); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Избери председател — Комисия {getCommittee(chairmanCommitteeId)?.romanNumeral}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {(teachers ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Няма налични преподаватели</p>
            ) : (
              (teachers ?? []).map((t: any) => (
                <button key={t.id} type="button" onClick={() => setChairmanUserId(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    chairmanUserId === t.id ? "bg-amber-50 border-amber-300" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}>
                  <div className="w-8 h-8 rounded-full bg-[#0a192f] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.firstName[0]}{t.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{t.firstName} {t.lastName}</p>
                    <p className="text-xs text-slate-400">Преподавател</p>
                  </div>
                  {chairmanUserId === t.id && <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1"
              onClick={() => { setChairmanCommitteeId(null); setChairmanUserId(null); }}>
              Отказ
            </Button>
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              disabled={!chairmanUserId || addMember.isPending}
              onClick={handleSetChairman}>
              <Crown className="h-4 w-4 mr-1.5" />
              Задай като председател
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Търсене по комисия..."
          value={searchCommittee}
          onChange={e => setSearchCommittee(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Committees grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommittees.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Няма създадени комисии
          </div>
        ) : (
          filteredCommittees.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Комисия {c.romanNumeral}</CardTitle>
                  {isDeptHead && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Изтриване на комисия</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-slate-600">Сигурни ли сте, че искате да изтриете Комисия {c.romanNumeral}?</p>
                        <div className="flex gap-2 pt-2">
                          <Button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-300"
                            onClick={() => deleteCommittee.mutate(c.id)}>
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
                <Badge variant="outline" className="w-fit">{c.members?.length ?? 0} членa</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {c.members?.map((m: any) => (
                  <div key={m.id} className={`flex items-center justify-between p-2 rounded-lg ${m.isChairman ? "bg-amber-50 border border-amber-200" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-2">
                      {m.isChairman && <Crown className="h-3 w-3 text-amber-600 flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-slate-400">{m.isChairman ? "Председател" : "Член"}</p>
                      </div>
                    </div>
                    {isDeptHead && (
                      <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 h-7 w-7"
                        onClick={() => removeMember.mutate({ committeeId: c.id, userId: m.id })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}

                {isDeptHead && (
                  <div className="pt-2 flex gap-2 border-t">
                    <Button size="sm" className="flex-1 h-8 bg-[#0a192f] text-white text-xs"
                      onClick={() => { setAddMembersCommitteeId(c.id); setSelectedMemberIds(new Set()); }}>
                      <UserPlus className="h-3 w-3 mr-1" /> Добави член
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => { setChairmanCommitteeId(c.id); setChairmanUserId(null); }}>
                      <Crown className="h-3 w-3 mr-1" /> Председател
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
