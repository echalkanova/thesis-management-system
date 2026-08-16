import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUpdateUser, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatRole } from "@/lib/utils";
import { User, Lock, Phone, Building2, GraduationCap, Mail, Save, KeyRound } from "lucide-react";

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

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateUser.mutate({ id: user.id, data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Профилът е обновен успешно" });
      },
      onError: () => toast({ title: "Грешка", description: "Неуспешно обновяване.", variant: "destructive" }),
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: "Грешка", description: "Новите пароли не съвпадат.", variant: "destructive" });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast({ title: "Грешка", description: "Паролата трябва да е поне 6 символа.", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    try {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch(`/api/users/${user.id}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Грешка");
      }
      toast({ title: "Паролата е сменена успешно" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast({ title: "Грешка", description: err.message === "Incorrect current password" ? "Текущата парола е грешна." : err.message, variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Профил</h1>
        <p className="text-sm text-slate-400 mt-0.5">Управление на вашите лични данни и настройки за сигурност</p>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm shadow-indigo-200 flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail size={13} className="text-slate-300" />
              {user.email}
            </p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              <GraduationCap size={11} />
              {formatRole(user.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Personal info form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <User size={14} className="text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-800">Лични данни</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Собствено име</Label>
              {user?.role === "student" ? (
                <Input value={form.firstName} readOnly className="border-slate-200 bg-slate-50 text-slate-600" />
              ) : (
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange}
                  className="border-slate-200 focus:ring-indigo-500 focus:border-indigo-400"
                  data-testid="input-first-name" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Фамилно име</Label>
              {user?.role === "student" ? (
                <Input value={form.lastName} readOnly className="border-slate-200 bg-slate-50 text-slate-600" />
              ) : (
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange}
                  className="border-slate-200 focus:ring-indigo-500 focus:border-indigo-400"
                  data-testid="input-last-name" />
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Mail size={11} /> Имейл адрес
            </Label>
            <Input value={user.email} readOnly className="border-slate-200 bg-slate-50 text-slate-600" />
          </div>
          {user?.role === "student" && (user as any).facultyNumber && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Факултетен номер</Label>
              <Input value={(user as any).facultyNumber} readOnly className="border-slate-200 bg-slate-50 text-slate-600" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Building2 size={11} /> Факултет
            </Label>
            {user?.role === "student" ? (
              <Input value={form.faculty ?? "Не е посочен"} readOnly className="border-slate-200 bg-slate-50 text-slate-600" />
            ) : (
              <Input id="faculty" name="faculty" value={form.faculty} onChange={handleChange}
                placeholder="напр. Факултет по математика и информатика"
                className="border-slate-200"
                data-testid="input-faculty" />
            )}
          </div>
          
          {user?.role === "student" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Специалност</Label>
                <Input value={(user as any).specialty ?? "Не е посочена"} readOnly className="border-slate-200 bg-slate-50 text-slate-600" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Степен</Label>
                <Input value={(user as any).degree === "bachelor" ? "Бакалавър" : (user as any).degree === "master" ? "Магистър" : "Не е посочена"} readOnly className="border-slate-200 bg-slate-50 text-slate-600" />
              </div>
            </>
          )}

          {user?.role !== "student" && (
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Phone size={11} /> Телефон
              </Label>
              <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                placeholder="+359 88 888 8888"
                className="border-slate-200"
                data-testid="input-phone" />
            </div>
          )}
          
          {user?.role !== "student" && (
            <div className="pt-1">
              <Button
                type="submit"
                disabled={updateUser.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 flex items-center gap-2"
                data-testid="button-save-profile"
              >
                <Save size={14} />
                {updateUser.isPending ? "Запазване..." : "Запази промените"}
              </Button>
            </div>
          )}
          </form>
      </div>

      {user?.role !== "student" && (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Lock size={14} className="text-amber-600" />
          </div>
          <h3 className="font-semibold text-slate-800">Промяна на парола</h3>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <KeyRound size={11} /> Текуща парола
            </Label>
            <Input id="currentPassword" name="currentPassword" type="password"
              value={pwForm.currentPassword} onChange={handlePwChange}
              className="border-slate-200"
              placeholder="Въведете текущата парола"
              data-testid="input-current-password" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Нова парола</Label>
              <Input id="newPassword" name="newPassword" type="password"
                value={pwForm.newPassword} onChange={handlePwChange}
                className="border-slate-200"
                placeholder="Минимум 6 символа"
                data-testid="input-new-password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Потвърди паролата</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password"
                value={pwForm.confirmPassword} onChange={handlePwChange}
                className={`border-slate-200 ${pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? "border-red-300 focus:border-red-400" : ""}`}
                placeholder="Повторете новата парола"
                data-testid="input-confirm-password" />
              {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                <p className="text-xs text-red-500">Паролите не съвпадат</p>
              )}
            </div>
          </div>
          <div className="pt-1">
            <Button
              type="submit"
              disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword}
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-2"
              data-testid="button-change-password"
            >
              <Lock size={14} />
              {pwLoading ? "Сменяне..." : "Смени паролата"}
            </Button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}