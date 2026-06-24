import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCreateDefense, useListTheses, useListUsers, getListDefensesQueryKey, getListThesesQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function NewDefense() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createDefense = useCreateDefense();

  const { data: theses } = useListTheses({ status: "approved" }, { query: { queryKey: getListThesesQueryKey({ status: "approved" }) } });
  const { data: users } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });

  const [form, setForm] = useState({ title: "", scheduledAt: "", location: "", roomOrLink: "", notes: "" });
  const [selectedTheses, setSelectedTheses] = useState<number[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<number[]>([]);

  const committeeMembers = users?.filter(u => u.role === "committee_member" || u.role === "supervisor") ?? [];

  const toggleThesis = (id: number) => setSelectedTheses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleMember = (id: number) => setSelectedCommittee(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createDefense.mutate(
      { data: { ...form, thesisIds: selectedTheses, committeeIds: selectedCommittee } },
      {
        onSuccess: (defense) => {
          queryClient.invalidateQueries({ queryKey: getListDefensesQueryKey({}) });
          toast({ title: "Защитата е насрочена" });
          setLocation(`/defenses/${defense.id}`);
        },
        onError: () => toast({ title: "Грешка", description: "Неуспешно насрочване.", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/defenses" data-testid="link-back-defenses">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">Насрочване на защита</h1>
          <p className="text-slate-500">Попълнете данните за сесията по защита</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Основна информация</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заглавие <span className="text-red-500">*</span></Label>
              <Input id="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="напр. Сесия за защита - Юни 2026" data-testid="input-defense-title" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Дата и час <span className="text-red-500">*</span></Label>
                <Input id="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} required data-testid="input-defense-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Местоположение</Label>
                <Input id="location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="напр. Сграда А" data-testid="input-defense-location" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomOrLink">Зала / Линк</Label>
              <Input id="roomOrLink" value={form.roomOrLink} onChange={e => setForm(p => ({ ...p, roomOrLink: e.target.value }))} placeholder="напр. Зала 101 или https://zoom.us/..." data-testid="input-defense-room" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Бележки</Label>
              <Textarea id="notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} data-testid="input-defense-notes" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Дипломни работи</CardTitle></CardHeader>
          <CardContent>
            {!theses?.length ? <p className="text-slate-400 text-sm italic">Няма одобрени дипломни работи</p> : (
              <div className="space-y-2">
                {theses.map(t => (
                  <label key={t.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer" data-testid={`checkbox-thesis-${t.id}`}>
                    <Checkbox checked={selectedTheses.includes(t.id)} onCheckedChange={() => toggleThesis(t.id)} />
                    <div>
                      <p className="text-sm font-medium text-[#0a192f]">{t.title}</p>
                      <p className="text-xs text-slate-400">{t.student?.firstName} {t.student?.lastName}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Комисия</CardTitle></CardHeader>
          <CardContent>
            {!committeeMembers.length ? <p className="text-slate-400 text-sm italic">Няма налични членове на комисия</p> : (
              <div className="space-y-2">
                {committeeMembers.map(u => (
                  <label key={u.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer" data-testid={`checkbox-member-${u.id}`}>
                    <Checkbox checked={selectedCommittee.includes(u.id)} onCheckedChange={() => toggleMember(u.id)} />
                    <div>
                      <p className="text-sm font-medium text-[#0a192f]">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400">{u.department}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={createDefense.isPending} className="bg-[#0a192f] hover:bg-[#112240] text-white" data-testid="button-create-defense">
            {createDefense.isPending ? "Запазване..." : "Насрочи защита"}
          </Button>
          <Button type="button" variant="outline" asChild><Link href="/defenses">Отказ</Link></Button>
        </div>
      </form>
    </div>
  );
}
