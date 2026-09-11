import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, GraduationCap, Plus, Pencil, Trash2, X, Layers } from "lucide-react";

interface Department {
  id: number;
  name: string;
  faculty: string;
  specialties: string[];
  facultyNumberPrefix: string | null;
  facultyNumberPrefixMaster: string | null;
}

export default function Faculties() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("thesis_token");
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const jsonHeaders: Record<string, string> = { "Content-Type": "application/json", ...authHeaders };

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments", { headers: authHeaders });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка при зареждане на факултетите");
      return Array.isArray(json) ? json : [];
    },
  });

  const faculties = [...new Set((departments ?? []).map((d) => d.faculty))].sort((a, b) => a.localeCompare(b, "bg"));

  // Create faculty (= first department under a new faculty name)
  const [createFacultyOpen, setCreateFacultyOpen] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptPrefix, setNewDeptPrefix] = useState("");
  const [newDeptPrefixMaster, setNewDeptPrefixMaster] = useState("");

  const createFaculty = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/departments", {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({
          name: newDeptName, faculty: newFacultyName,
          facultyNumberPrefix: newDeptPrefix || undefined,
          facultyNumberPrefixMaster: newDeptPrefixMaster || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Факултетът е създаден" });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setCreateFacultyOpen(false);
      setNewFacultyName(""); setNewDeptName(""); setNewDeptPrefix(""); setNewDeptPrefixMaster("");
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  // Rename faculty
  const [renameFacultyTarget, setRenameFacultyTarget] = useState<string | null>(null);
  const [renameFacultyValue, setRenameFacultyValue] = useState("");

  const renameFaculty = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/departments/faculty/${encodeURIComponent(renameFacultyTarget!)}`, {
        method: "PATCH", headers: jsonHeaders,
        body: JSON.stringify({ newName: renameFacultyValue }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Факултетът е преименуван" });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setRenameFacultyTarget(null);
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  // Delete faculty
  const [deleteFacultyTarget, setDeleteFacultyTarget] = useState<string | null>(null);

  const deleteFaculty = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/departments/faculty/${encodeURIComponent(name)}`, {
        method: "DELETE", headers: authHeaders,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Факултетът е изтрит" });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setDeleteFacultyTarget(null);
    },
    onError: (e: Error) => { toast({ title: "Грешка", description: e.message, variant: "destructive" }); setDeleteFacultyTarget(null); },
  });

  // Create department under an existing faculty
  const [addDeptFaculty, setAddDeptFaculty] = useState<string | null>(null);
  const [addDeptName, setAddDeptName] = useState("");
  const [addDeptPrefix, setAddDeptPrefix] = useState("");
  const [addDeptPrefixMaster, setAddDeptPrefixMaster] = useState("");

  const createDepartment = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/departments", {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({
          name: addDeptName, faculty: addDeptFaculty,
          facultyNumberPrefix: addDeptPrefix || undefined,
          facultyNumberPrefixMaster: addDeptPrefixMaster || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Катедрата е добавена" });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setAddDeptFaculty(null);
      setAddDeptName(""); setAddDeptPrefix(""); setAddDeptPrefixMaster("");
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  // Edit department
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptPrefix, setEditDeptPrefix] = useState("");
  const [editDeptPrefixMaster, setEditDeptPrefixMaster] = useState("");

  const updateDepartment = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/departments/${editDept!.id}`, {
        method: "PATCH", headers: jsonHeaders,
        body: JSON.stringify({
          name: editDeptName,
          facultyNumberPrefix: editDeptPrefix || null,
          facultyNumberPrefixMaster: editDeptPrefixMaster || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Катедрата е обновена" });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setEditDept(null);
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });
  
  // Delete department
  const [deleteDeptTarget, setDeleteDeptTarget] = useState<Department | null>(null);

  const deleteDepartment = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE", headers: authHeaders });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Катедрата е изтрита" });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setDeleteDeptTarget(null);
    },
    onError: (e: Error) => { toast({ title: "Грешка", description: e.message, variant: "destructive" }); setDeleteDeptTarget(null); },
  });

  // Add / remove specialty
  const [newSpecialty, setNewSpecialty] = useState<Record<number, string>>({});

  const addSpecialty = useMutation({
    mutationFn: async ({ deptId, specialty }: { deptId: number; specialty: string }) => {
      const res = await fetch(`/api/departments/${deptId}/specialties`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify({ specialty }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setNewSpecialty((prev) => ({ ...prev, [vars.deptId]: "" }));
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const removeSpecialty = useMutation({
    mutationFn: async ({ deptId, specialty }: { deptId: number; specialty: string }) => {
      const res = await fetch(`/api/departments/${deptId}/specialties/${encodeURIComponent(specialty)}`, {
        method: "DELETE", headers: authHeaders,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f]">Факултети</h1>
          <p className="text-slate-500 text-sm mt-1">Управление на факултети, катедри и специалности</p>
        </div>
        <Dialog open={createFacultyOpen} onOpenChange={setCreateFacultyOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0a192f] text-white">
              <Plus className="h-4 w-4 mr-2" /> Добави факултет
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Нов факултет</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-500">Факултетът се създава заедно с първата си катедра.</p>
              <div className="space-y-2">
                <Label>Име на факултета *</Label>
                <Input value={newFacultyName} onChange={(e) => setNewFacultyName(e.target.value)} placeholder='Факултет „..." (...)' />
              </div>
              <div className="space-y-2">
                <Label>Първа катедра *</Label>
                <Input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Име на катедрата" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Префикс (бакалавър)</Label>
                  <Input value={newDeptPrefix} onChange={(e) => setNewDeptPrefix(e.target.value)} placeholder="напр. 121222" />
                </div>
              </div>
              <Button
                className="w-full bg-[#0a192f] text-white"
                disabled={createFaculty.isPending || !newFacultyName || !newDeptName}
                onClick={() => createFaculty.mutate()}>
                {createFaculty.isPending ? "Създаване..." : "Създай факултет"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {faculties.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Няма създадени факултети</div>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {faculties.map((faculty) => {
            const deptsInFaculty = (departments ?? []).filter((d) => d.faculty === faculty)
              .sort((a, b) => a.name.localeCompare(b.name, "bg"));
            return (
              <Card key={faculty} className="overflow-hidden">
                <AccordionItem value={faculty} className="border-b-0">
                  <div className="flex items-center justify-between px-4">
                    <AccordionTrigger className="items-start hover:no-underline py-4 flex-1">
                      <div className="flex items-center gap-3 text-left">
                        <Building2 className="h-5 w-5 text-[#0a192f] flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-[#0a192f]">{faculty}</div>
                          <div className="text-xs text-slate-500">{deptsInFaculty.length} катедри</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1 pl-2">
                      <Button size="icon" variant="ghost" className="text-slate-400 hover:text-slate-700"
                        onClick={() => { setRenameFacultyTarget(faculty); setRenameFacultyValue(faculty); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600"
                        onClick={() => setDeleteFacultyTarget(faculty)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent className="px-4">
                    <div className="space-y-3">
                      {deptsInFaculty.map((dept) => (
                        <Card key={dept.id} className="bg-slate-50 border-slate-200">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-sm font-semibold text-[#0a192f] flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-slate-400" /> {dept.name}
                              </CardTitle>
                              <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-slate-700"
                                  onClick={() => { setEditDept(dept); setEditDeptName(dept.name); setEditDeptPrefix(dept.facultyNumberPrefix ?? ""); setEditDeptPrefixMaster(dept.facultyNumberPrefixMaster ?? ""); }}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600"
                                  onClick={() => setDeleteDeptTarget(dept)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {(dept.facultyNumberPrefix || dept.facultyNumberPrefixMaster) && (
                              <div className="text-xs text-slate-500">
                                Префикс: {dept.facultyNumberPrefix ?? "—"}                              </div>
                            )}
                            <div className="space-y-2">
                              <Label className="text-xs text-slate-500 flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5" /> Специалности
                              </Label>
                                                            <div className="flex flex-wrap gap-2">
                                {dept.specialties.length === 0 && (
                                  <span className="text-xs text-slate-400">Няма добавени специалности</span>
                                )}
                                {dept.specialties.map((s) => (
                                  <Badge key={s} variant="outline" className="bg-white text-slate-700 border-slate-300 pr-1 gap-1">
                                    {s}
                                    <button
                                      className="hover:text-red-600 ml-1"
                                      disabled={removeSpecialty.isPending}
                                      onClick={() => removeSpecialty.mutate({ deptId: dept.id, specialty: s })}>
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2 pt-1">
                                <Input
                                  className="h-8 text-sm"
                                  placeholder="Нова специалност..."
                                  value={newSpecialty[dept.id] ?? ""}
                                  onChange={(e) => setNewSpecialty((prev) => ({ ...prev, [dept.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && newSpecialty[dept.id]?.trim()) {
                                      addSpecialty.mutate({ deptId: dept.id, specialty: newSpecialty[dept.id].trim() });
                                    }
                                  }}
                                />
                                <Button
                                  size="sm" variant="outline"
                                  disabled={!newSpecialty[dept.id]?.trim() || addSpecialty.isPending}
                                  onClick={() => addSpecialty.mutate({ deptId: dept.id, specialty: newSpecialty[dept.id].trim() })}>
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Dialog open={addDeptFaculty === faculty} onOpenChange={(open) => setAddDeptFaculty(open ? faculty : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full border-dashed">
                            <Plus className="h-4 w-4 mr-2" /> Добави катедра
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader><DialogTitle>Нова катедра в {faculty}</DialogTitle></DialogHeader>
                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <Label>Име на катедрата *</Label>
                              <Input value={addDeptName} onChange={(e) => setAddDeptName(e.target.value)} placeholder="Име на катедрата" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Префикс (бакалавър)</Label>
                                <Input value={addDeptPrefix} onChange={(e) => setAddDeptPrefix(e.target.value)} placeholder="напр. 121222" />
                              </div>
                            </div>
                            <Button
                              className="w-full bg-[#0a192f] text-white"
                              disabled={createDepartment.isPending || !addDeptName}
                              onClick={() => createDepartment.mutate()}>
                              {createDepartment.isPending ? "Добавяне..." : "Добави катедра"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            );
          })}
        </Accordion>
      )}

      {/* Rename faculty dialog */}
      <Dialog open={!!renameFacultyTarget} onOpenChange={(open) => !open && setRenameFacultyTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Преименуване на факултет</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Ново име</Label>
              <Input value={renameFacultyValue} onChange={(e) => setRenameFacultyValue(e.target.value)} />
            </div>
            <Button
              className="w-full bg-[#0a192f] text-white"
              disabled={renameFaculty.isPending || !renameFacultyValue}
              onClick={() => renameFaculty.mutate()}>
              {renameFaculty.isPending ? "Запазване..." : "Запази"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete faculty confirm */}
      <Dialog open={!!deleteFacultyTarget} onOpenChange={(open) => !open && setDeleteFacultyTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Изтриване на факултет</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">
            Сигурни ли сте, че искате да изтриете „{deleteFacultyTarget}" заедно с всичките му катедри? Действието е необратимо.
          </p>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-300"
              disabled={deleteFaculty.isPending}
              onClick={() => deleteFaculty.mutate(deleteFacultyTarget!)}>
              Да, изтрий
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeleteFacultyTarget(null)}>Отказ</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit department dialog */}
      <Dialog open={!!editDept} onOpenChange={(open) => !open && setEditDept(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Редактиране на катедра</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Име на катедрата</Label>
              <Input value={editDeptName} onChange={(e) => setEditDeptName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Префикс (бакалавър)</Label>
                <Input value={editDeptPrefix} onChange={(e) => setEditDeptPrefix(e.target.value)} />
              </div>
            </div>
            <Button
              className="w-full bg-[#0a192f] text-white"
              disabled={updateDepartment.isPending || !editDeptName}
              onClick={() => updateDepartment.mutate()}>
              {updateDepartment.isPending ? "Запазване..." : "Запази"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete department confirm */}
      <Dialog open={!!deleteDeptTarget} onOpenChange={(open) => !open && setDeleteDeptTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Изтриване на катедра</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">
            Сигурни ли сте, че искате да изтриете катедра „{deleteDeptTarget?.name}"?
          </p>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-300"
              disabled={deleteDepartment.isPending}
              onClick={() => deleteDepartment.mutate(deleteDeptTarget!.id)}>
              Да, изтрий
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeleteDeptTarget(null)}>Отказ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}