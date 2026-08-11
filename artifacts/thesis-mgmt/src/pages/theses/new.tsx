import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateThesis, getListThesesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewThesis() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createThesis = useCreateThesis();

  const [form, setForm] = useState({ title: "", description: "", keywords: "", field: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createThesis.mutate(
      { data: { title: form.title, description: form.description, keywords: form.keywords, field: form.field } },
      {
        onSuccess: (thesis) => {
          queryClient.invalidateQueries({ queryKey: getListThesesQueryKey() });
          toast({ title: "Успех", description: "Дипломната работа е създадена." });
          setLocation(`/theses/${thesis.id}`);
        },
        onError: () => {
          toast({ title: "Грешка", description: "Неуспешно създаване.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/theses" data-testid="link-back-theses">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f] tracking-tight">Нова дипломна работа</h1>
          <p className="text-slate-500">Попълнете данните за вашата дипломна работа</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Данни за дипломната работа</CardTitle>
          <CardDescription>Можете да редактирате тези данни по-късно, преди да подадете работата.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Заглавие <span className="text-red-500">*</span></Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required placeholder="Въведете заглавие" data-testid="input-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">Област</Label>
              <Input id="field" name="field" value={form.field} onChange={handleChange} placeholder="напр. Уеб технологии, Изкуствен интелект" data-testid="input-field" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Ключови думи</Label>
              <Input id="keywords" name="keywords" value={form.keywords} onChange={handleChange} placeholder="напр. React, Node.js, ML" data-testid="input-keywords" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Кратко описание на темата и целите на работата" data-testid="input-description" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={createThesis.isPending} className="bg-[#0a192f] hover:bg-[#112240] text-white" data-testid="button-create-thesis">
                {createThesis.isPending ? "Запазване..." : "Създай дипломна работа"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/theses">Отказ</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
