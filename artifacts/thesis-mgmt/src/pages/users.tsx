import { useState } from "react";
import { useListUsers, getListUsersQueryKey, useUpdateUser, useDeleteUser } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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
  { value: "supervisor", label: "Научен ръководител" },
  { value: "reviewer", label: "Рецензент" },
  { value: "committee_member", label: "Член на комисия" },
  { value: "admin", label: "Администратор" },
];

const roleColors: Record<string, string> = {
  student: "bg-blue-50 text-blue-700 border-blue-200",
  supervisor: "bg-purple-50 text-purple-700 border-purple-200",
  reviewer: "bg-amber-50 text-amber-700 border-amber-200",
  committee_member: "bg-green-50 text-green-700 border-green-200",
  admin: "bg-red-50 text-red-700 border-red-200",
};

const emptyForm = {
  firstName: "", lastName: "", email: "", password: "",
  role: "student", facultyNumber: "", faculty: "",
  department: "", phoneNumber: "", subjectTaught: "", maxStudents: "40",
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

  const activeRole = roleFilter === "all" ? undefined : roleFilter;
  const { data: users, isLoading } = useListUsers(
    { search: search || undefined, role: activeRole },
    { query: { queryKey: getListUsersQueryKey({ search: search || undefined, role: activeRole }) } }
  );

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const createUser = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const body: any = {
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, password: data.password, role: data.role,
      };
      if (data.facultyNumber) body.facultyNumber = data.facultyNumber;
      if (data.faculty) body.faculty = data.faculty;
      if (data.department) body.department = data.department;
      if (data.phoneNumber) body.phoneNumber = data.phoneNumber;
      if (data.subjectTaught) body.subjectTaught = data.subjectTaught;
      if (data.role === "supervisor") body.maxStudents = Number(data.maxStudents) || 40;

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

  const handleEdit = (u: any) => { setEditUser(u); setEditRole(u.role); };

  const handleSaveRole = () => {
    if (!editUser) return;
    updateUser.mutate({ id: editUser.id, data: { role: editRole as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
        toast({ title: "Ролята е обновена" });
        setEditUser(null);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този потребител?")) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
        toast({ title: "Потребителят е изтрит" });
      }
    });
  };

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const needsFacultyNumber = form.role === "student" || form.role === "supervisor";
  const isSupervisor = form.role === "supervisor";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">Управление на потребители</h1>
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
                <Input type="email" value={form.email} onChange={f("email")} placeholder="ivan@uni.bg" />
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

              {needsFacultyNumber && (
                <div className="space-y-1.5">
                  <Label>
                    Факултетен номер <span className="text-red-500">*</span>
                    <span className="text-xs text-slate-400 ml-2 font-normal">
                      {form.role === "student" ? "121222XXX" : "001212XXX"}
                    </span>
                  </Label>
                  <Input value={form.facultyNumber} onChange={f("facultyNumber")}
                    placeholder={form.role === "student" ? "121222001" : "001212001"} />
                </div>
              )}

              {isSupervisor && (
                <>
                  <div className="space-y-1.5">
                    <Label>Дисциплина</Label>
                    <Input value={form.subjectTaught} onChange={f("subjectTaught")} placeholder="Информационни технологии" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Макс. студенти</Label>
                    <Input type="number" value={form.maxStudents} onChange={f("maxStudents")} min={1} max={100} />
                  </div>
                </>
              )}

              <div className="border-t pt-3 space-y-3">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Допълнителна информация (незадължително)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Факултет</Label>
                    <Input value={form.faculty} onChange={f("faculty")} placeholder="ФМИ" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Катедра</Label>
                    <Input value={form.department} onChange={f("department")} placeholder="ИС" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Телефон</Label>
                  <Input value={form.phoneNumber} onChange={f("phoneNumber")} placeholder="+359 88 888 8888" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!form.firstName || !form.lastName || !form.email || !form.password || createUser.isPending}
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
            {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
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
                {users?.map(u => (
                  <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                    <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[u.role] ?? ""}>{formatRole(u.role)}</Badge>
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
                          <DialogContent>
                            <DialogHeader><DialogTitle>Редактиране на роля</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                              <p className="text-sm text-slate-600 font-medium">{editUser?.firstName} {editUser?.lastName}</p>
                              <p className="text-xs text-slate-400">{editUser?.email}</p>
                              <div className="space-y-2">
                                <Label>Роля</Label>
                                <Select value={editRole} onValueChange={setEditRole}>
                                  <SelectTrigger data-testid="select-edit-role"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSaveRole} disabled={updateUser.isPending} data-testid="button-save-role">
                                {updateUser.isPending ? "Запазване..." : "Запази промяната"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(u.id)} disabled={deleteUser.isPending} data-testid={`button-delete-user-${u.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users?.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">Няма намерени потребители</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
