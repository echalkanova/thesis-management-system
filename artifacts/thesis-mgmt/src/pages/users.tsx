import { useState } from "react";
import { useListUsers, getListUsersQueryKey, useUpdateUser, useDeleteUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Search, Trash2, Edit } from "lucide-react";
import { formatRole } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const roleColors: Record<string, string> = {
  student: "bg-blue-50 text-blue-700 border-blue-200",
  supervisor: "bg-purple-50 text-purple-700 border-purple-200",
  reviewer: "bg-amber-50 text-amber-700 border-amber-200",
  committee_member: "bg-green-50 text-green-700 border-green-200",
  admin: "bg-red-50 text-red-700 border-red-200",
};

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("");

  const activeRole = roleFilter === "all" ? undefined : roleFilter;
  const { data: users, isLoading } = useListUsers(
    { search: search || undefined, role: activeRole },
    { query: { queryKey: getListUsersQueryKey({ search: search || undefined, role: activeRole }) } }
  );

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

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
    deleteUser.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
        toast({ title: "Потребителят е изтрит" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">Управление на потребители</h1>
        <p className="text-slate-500">Всички регистрирани потребители в системата</p>
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
            <SelectItem value="supervisor">Научен ръководител</SelectItem>
            <SelectItem value="reviewer">Рецензент</SelectItem>
            <SelectItem value="committee_member">Член на комисия</SelectItem>
            <SelectItem value="admin">Администратор</SelectItem>
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
                              <p className="text-sm text-slate-600">{editUser?.firstName} {editUser?.lastName}</p>
                              <div className="space-y-2">
                                <Label>Роля</Label>
                                <Select value={editRole} onValueChange={setEditRole}>
                                  <SelectTrigger data-testid="select-edit-role"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="student">Студент</SelectItem>
                                    <SelectItem value="supervisor">Научен ръководител</SelectItem>
                                    <SelectItem value="reviewer">Рецензент</SelectItem>
                                    <SelectItem value="committee_member">Член на комисия</SelectItem>
                                    <SelectItem value="admin">Администратор</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button className="w-full bg-[#0a192f] text-white" onClick={handleSaveRole} disabled={updateUser.isPending} data-testid="button-save-role">
                                {updateUser.isPending ? "Запазване..." : "Запази"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600" onClick={() => handleDelete(u.id)} disabled={deleteUser.isPending} data-testid={`button-delete-user-${u.id}`}>
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
