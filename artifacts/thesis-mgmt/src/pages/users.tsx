import { useState } from "react";
import { useListUsers, getListUsersQueryKey, useUpdateUser, useDeleteUser } from "@workspace/api-client-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Search, Trash2, Edit, UserPlus } from "lucide-react";
import { formatRole } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function apiHeaders() {
  const token = localStorage.getItem("thesis_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

const ROLES = [
  { value: "student", label: "Студент" },
  { value: "supervisor", label: "Преподавател" },
  { value: "department_head", label: "Ръководител-катедра" },
  { value: "admin", label: "Администратор" },
];

const roleColors: Record<string, string> = {
  student: "bg-blue-50 text-blue-700 border-blue-200",
  supervisor: "bg-purple-50 text-purple-700 border-purple-200",
  reviewer: "bg-purple-50 text-purple-700 border-purple-200",
  department_head: "bg-purple-50 text-purple-700 border-purple-200",
  admin: "bg-red-50 text-red-700 border-red-200",
};

const emptyForm = {
  firstName: "", lastName: "", email: "", password: "",
  role: "student", facultyNumber: "", faculty: "",
  department: "", specialty: "", degree: "", subjectTaught: "", maxStudents: "10",
};

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", email: "", role: "student",
    facultyNumber: "", faculty: "", department: "", specialty: "",
    degree: "", subjectTaught: "", maxStudents: "10", newPassword: "",
  });
  const ef = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditForm(prev => ({ ...prev, [k]: e.target.value }));

  const activeRole = (roleFilter === "all" || roleFilter === "teachers") ? undefined : roleFilter;
  const { data: users, isLoading } = useListUsers(
    { search: search || undefined, role: activeRole },
    { query: { queryKey: getListUsersQueryKey({ search: search || undefined, role: activeRole }) } }
  );

  const filteredUsers = roleFilter === "teachers"
    ? users?.filter(u => ["supervisor", "reviewer", "department_head"].includes(u.role))
    : users;

    const sortedUsers = lastEditedId
      ? [(filteredUsers ?? []).find(u => u.id === lastEditedId), ...(filteredUsers ?? []).filter(u => u.id !== lastEditedId)].filter((u): u is typeof u & {} => !!u)
      : filteredUsers;

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/departments", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const body: any = {
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, password: data.password, role: data.role,
      };
      if (data.role === "student") {
        if (data.facultyNumber) body.facultyNumber = data.facultyNumber;
        if (data.specialty) body.specialty = data.specialty;
        if (data.degree) body.degree = data.degree;
      }
      if (data.faculty) body.faculty = data.faculty;
      if (data.department) body.department = data.department;
      if (data.subjectTaught) body.subjectTaught = data.subjectTaught;
      if (data.role !== "student" && data.role !== "admin") {
        body.maxStudents = Number(data.maxStudents) || 10;
      }

      const res = await fetch("/api/users", { method: "POST", headers: apiHeaders(), body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Грешка при създаване");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
      toast({ title: "Потребителят е създаден успешно" });
      setForm(emptyForm);
      setCreateOpen(false);
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const handleEdit = (u: any) => {
    setEditUser(u);
    setEditRole(u.role);
    setEditForm({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email ?? "",
      role: u.role ?? "student",
      facultyNumber: u.facultyNumber ?? "",
      faculty: u.faculty ?? "",
      department: u.department ?? "",
      specialty: (u as any).specialty ?? "",
      degree: (u as any).degree ?? "",
      subjectTaught: (u as any).subjectTaught ?? "",
      maxStudents: String((u as any).maxStudents ?? "10"),
      newPassword: "",
    });
  };

  const handleSaveRole = () => {
    if (!editUser) return;
    const body: any = {
      role: editForm.role,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      faculty: editForm.faculty || undefined,
      department: editForm.department || undefined,
    };
    if (editForm.role === "student") {
      body.facultyNumber = editForm.facultyNumber || undefined;
      body.specialty = editForm.specialty || null;
      body.degree = editForm.degree || null;
    }
    console.log("newPassword:", editForm.newPassword);
    if (editForm.newPassword) body.password = editForm.newPassword;
    if (["supervisor", "reviewer", "department_head"].includes(editForm.role)) {
      body.subjectTaught = editForm.subjectTaught || undefined;
      body.maxStudents = Number(editForm.maxStudents) || 10;
    }
    updateUser.mutate({ id: editUser.id, data: body as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
        toast({ title: "Профилът е обновен" });
        setLastEditedId(editUser?.id ?? null);
        setEditUser(null);
      }
    });
  };

  const handleDelete = (u: any) => {
    setDeleteUserId(u.id);
    setDeleteUserName(`${u.firstName} ${u.lastName}`);
  };

  const confirmDelete = () => {
    if (!deleteUserId) return;
    deleteUser.mutate({ id: deleteUserId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
        toast({ title: "Потребителят е изтрит" });
        setDeleteUserId(null);
      }
    });
  };

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const isStudent = form.role === "student";
  const isTeacher = ["supervisor", "department_head"].includes(form.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f] tracking-tight">Управление на потребители</h1>
          <p className="text-slate-500 mt-1">Всички регистрирани потребители в системата</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Добави потребител
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Създаване на нов потребител</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Име <span className="text-red-500">*</span></Label>
                  <Input value={form.firstName} onChange={f("firstName")} placeholder="Иван" />
                </div>
                <div className="space-y-1.5">
                  <Label>Фамилия <span className="text-red-500">*</span></Label>
                  <Input value={form.lastName} onChange={f("lastName")} placeholder="Петров" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Имейл <span className="text-red-500">*</span></Label>
                <Input type="email" value={form.email} onChange={f("email")} placeholder="gtodorov@uni.bg" />
              </div>

              <div className="space-y-1.5">
                <Label>Парола <span className="text-red-500">*</span></Label>
                <Input type="password" value={form.password} onChange={f("password")} placeholder="Минимум 6 символа" />
              </div>

              <div className="space-y-1.5">
                <Label>Роля <span className="text-red-500">*</span></Label>
                <Select value={form.role} onValueChange={v => setForm(prev => ({ ...prev, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Факултет и катедра за преподаватели */}
              {isTeacher && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Факултет <span className="text-red-500">*</span></Label>
                    {form.role === "department_head" ? (
                      <Input value={departments?.find((d: any) => d.name === form.department)?.faculty ?? ""} readOnly className="bg-slate-50 text-slate-600" placeholder="Автоматично от катедрата" />
                    ) : (
                      <Select value={form.faculty} onValueChange={v => setForm(prev => ({ ...prev, faculty: v, department: "" }))}>
                        <SelectTrigger><SelectValue placeholder="Изберете факултет" /></SelectTrigger>
                        <SelectContent>
                          {[...new Set(departments?.map((d: any) => d.faculty))].map((fac: any) => (
                            <SelectItem key={fac} value={fac}>{fac}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Катедра <span className="text-red-500">*</span></Label>
                    {form.role === "department_head" ? (
                      <Select value={form.department} onValueChange={v => setForm(prev => ({ ...prev, department: v, faculty: departments?.find((d: any) => d.name === v)?.faculty ?? prev.faculty }))}>
                        <SelectTrigger><SelectValue placeholder="Изберете катедра" /></SelectTrigger>
                        <SelectContent>
                          {departments?.map((d: any) => (
                            <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={form.department} onValueChange={v => setForm(prev => ({ ...prev, department: v }))}>
                        <SelectTrigger><SelectValue placeholder="Изберете катедра" /></SelectTrigger>
                        <SelectContent>
                          {departments?.filter((d: any) => !form.faculty || d.faculty === form.faculty).map((d: any) => (
                            <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              )}

              {/* Студентски полета */}
              {isStudent && (
                <>
                  <div className="space-y-1.5">
                    <Label>Факултетен номер <span className="text-red-500">*</span></Label>
                    <Input value={form.facultyNumber} onChange={f("facultyNumber")} placeholder="121222001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Факултет <span className="text-red-500">*</span></Label>
                    <Select value={form.faculty} onValueChange={v => setForm(prev => ({ ...prev, faculty: v, specialty: "" }))}>
                      <SelectTrigger><SelectValue placeholder="Изберете факултет" /></SelectTrigger>
                      <SelectContent>
                        {[...new Set(departments?.map((d: any) => d.faculty))].map((f: any) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Специалност <span className="text-red-500">*</span></Label>
                    <Select value={form.specialty} onValueChange={v => setForm(prev => ({ ...prev, specialty: v }))} disabled={!form.faculty}>
                      <SelectTrigger className={!form.faculty ? "border-red-300" : ""}>
                        <SelectValue placeholder={!form.faculty ? "Изберете факултет!" : "Изберете специалност"} />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.filter((d: any) => d.faculty === form.faculty).flatMap((d: any) => d.specialties).map((s: string) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!form.faculty && <p className="text-xs text-red-500">Изберете първо факултет</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Степен <span className="text-red-500">*</span></Label>
                    <Select value={(form as any).degree ?? ""} onValueChange={v => setForm(prev => ({ ...prev, degree: v }))}>
                      <SelectTrigger><SelectValue placeholder="Изберете степен" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Бакалавър</SelectItem>
                        <SelectItem value="master">Магистър</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={
                    !form.firstName || !form.lastName || !form.email || !form.password ||
                    (isTeacher && (!form.faculty || !form.department)) ||
                    (isStudent && !form.facultyNumber) ||
                    createUser.isPending
                  }
                  onClick={() => createUser.mutate(form)}>
                  {createUser.isPending ? "Създаване..." : "Създай потребител"}
                </Button>
                <Button variant="outline" onClick={() => { setCreateOpen(false); setForm(emptyForm); }}>
                  Отказ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Търсене по име или имейл..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-users" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48" data-testid="select-role-filter">
              <SelectValue placeholder="Всички роли" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">Всички роли</SelectItem>
            <SelectItem value="student">Студент</SelectItem>
            <SelectItem value="admin">Администратор</SelectItem>
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-t mt-1 pt-2">
              Преподаватели
            </div>
            <SelectItem value="teachers">Всички преподаватели</SelectItem>
            <SelectItem value="department_head">— Ръководител-катедра</SelectItem>
            <SelectItem value="supervisor">— Научен ръководител</SelectItem>
            <SelectItem value="reviewer">— Рецензент</SelectItem>
          </SelectContent>
          </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Зареждане...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Потребител</TableHead>
                  <TableHead>Имейл</TableHead>
                  <TableHead>Роля</TableHead>
                  <TableHead>Факултет</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers?.map(u => (
                  <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                    <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[u.role] ?? ""}>
                        {u.role === "student" ? "Студент" : u.role === "admin" ? "Администратор" : "Преподавател"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{u.faculty ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={editUser?.id === u.id} onOpenChange={open => !open && setEditUser(null)}>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(u)} data-testid={`button-edit-user-${u.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Редактиране на профил</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <Label>Име</Label>
                                  <Input value={editForm.firstName} onChange={ef("firstName")} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Фамилия</Label>
                                  <Input value={editForm.lastName} onChange={ef("lastName")} />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label>Нова парола (незадължително)</Label>
                                <Input type="password" value={editForm.newPassword} onChange={ef("newPassword")} placeholder="Оставете празно, ако не искате да смените" />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Роля</Label>
                                <Select value={editForm.role} onValueChange={v => setEditForm(prev => ({ ...prev, role: v }))}>
                                  <SelectTrigger data-testid="select-edit-role"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>

                              {editForm.role === "student" && (
                                <>
                                  <div className="space-y-1.5">
                                    <Label>Факултетен номер</Label>
                                    <Input value={editForm.facultyNumber} onChange={ef("facultyNumber")} />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Специалност</Label>
                                    <Select value={editForm.specialty} onValueChange={v => setEditForm(prev => ({ ...prev, specialty: v, faculty: departments?.find((d: any) => d.specialties.includes(v))?.faculty ?? prev.faculty }))}>
                                      <SelectTrigger><SelectValue placeholder="Изберете специалност" /></SelectTrigger>
                                      <SelectContent>
                                        {departments?.flatMap((d: any) => d.specialties).map((s: string) => (
                                          <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Факултет</Label>
                                    <Input value={editForm.faculty} onChange={ef("faculty")} />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Степен</Label>
                                    <Select value={editForm.degree} onValueChange={v => setEditForm(prev => ({ ...prev, degree: v }))}>
                                      <SelectTrigger><SelectValue placeholder="Изберете степен" /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bachelor">Бакалавър</SelectItem>
                                        <SelectItem value="master">Магистър</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </>
                              )}

                              {["supervisor", "reviewer", "department_head"].includes(editForm.role) && (
                                <>
                                  <div className="space-y-1.5">
                                    <Label>Факултет</Label>
                                    {editForm.role === "department_head" ? (
                                      <Input value={departments?.find((d: any) => d.name === editForm.department)?.faculty ?? ""} readOnly className="bg-slate-50 text-slate-600" />
                                    ) : (
                                      <Select value={editForm.faculty} onValueChange={v => setEditForm(prev => ({ ...prev, faculty: v, department: "" }))}>
                                        <SelectTrigger><SelectValue placeholder="Изберете факултет" /></SelectTrigger>
                                        <SelectContent>
                                          {[...new Set(departments?.map((d: any) => d.faculty))].map((fac: any) => (
                                            <SelectItem key={fac} value={fac}>{fac}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Катедра</Label>
                                    {editForm.role === "department_head" ? (
                                      <Select value={editForm.department} onValueChange={v => setEditForm(prev => ({ ...prev, department: v, faculty: departments?.find((d: any) => d.name === v)?.faculty ?? prev.faculty }))}>
                                        <SelectTrigger><SelectValue placeholder="Изберете катедра" /></SelectTrigger>
                                        <SelectContent>
                                          {departments?.map((d: any) => (
                                            <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Select value={editForm.department} onValueChange={v => setEditForm(prev => ({ ...prev, department: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Изберете катедра" /></SelectTrigger>
                                        <SelectContent>
                                          {departments?.filter((d: any) => !editForm.faculty || d.faculty === editForm.faculty).map((d: any) => (
                                            <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                </>
                              )}

                              <div className="flex gap-2 pt-1">
                                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveRole} disabled={updateUser.isPending} data-testid="button-save-role">
                                  {updateUser.isPending ? "Запазване..." : "Запази"}
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => setEditUser(null)}>
                                  Отмени
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(u)} disabled={deleteUser.isPending} data-testid={`button-delete-user-${u.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedUsers?.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">Няма намерени потребители</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteUserId !== null} onOpenChange={open => !open && setDeleteUserId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Изтриване на потребител</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">Сигурни ли сте, че искате да изтриете <span className="font-medium">{deleteUserName}</span>?</p>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-300"
              onClick={confirmDelete} disabled={deleteUser.isPending}>
              Да, изтрий
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeleteUserId(null)}>
              Отказ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
