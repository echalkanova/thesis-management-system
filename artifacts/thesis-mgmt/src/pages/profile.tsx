import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUpdateUser, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatRole } from "@/lib/utils";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    faculty: user?.faculty ?? "",
    department: user?.department ?? "",
    phoneNumber: user?.phoneNumber ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateUser.mutate({ id: user.id, data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Профилът е обновен" });
      },
      onError: () => toast({ title: "Грешка", description: "Неуспешно обновяване.", variant: "destructive" }),
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">Профил</h1>
        <p className="text-slate-500">Управление на вашите лични данни</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-[#0a192f] rounded-full flex items-center justify-center text-amber-400 font-bold text-2xl">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <CardTitle>{user.firstName} {user.lastName}</CardTitle>
              <p className="text-slate-500 text-sm mt-1">{user.email}</p>
              <Badge variant="outline" className="mt-1">{formatRole(user.role)}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Собствено име</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} data-testid="input-first-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилно име</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} data-testid="input-last-name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faculty">Факултет</Label>
              <Input id="faculty" name="faculty" value={form.faculty} onChange={handleChange} data-testid="input-faculty" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Катедра</Label>
              <Input id="department" name="department" value={form.department} onChange={handleChange} data-testid="input-department" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Телефон</Label>
              <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} data-testid="input-phone" />
            </div>
            <div className="space-y-2">
              <Label>Имейл (не може да се промени)</Label>
              <Input value={user.email} disabled className="text-slate-400" />
            </div>
            <Button type="submit" disabled={updateUser.isPending} className="bg-[#0a192f] hover:bg-[#112240] text-white" data-testid="button-save-profile">
              {updateUser.isPending ? "Запазване..." : "Запази промените"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
