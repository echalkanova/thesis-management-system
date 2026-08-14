import { useParams, Link } from "wouter";
import { useGetDefense, getGetDefenseQueryKey, useListUsers, getListUsersQueryKey, useDeleteDefense, getListDefensesQueryKey, useListTheses, getListThesesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Trash2, Calendar, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function DefenseDetail() {
  const { id } = useParams<{ id: string }>();
  const defenseId = Number(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: defense, isLoading } = useGetDefense(defenseId, { query: { queryKey: getGetDefenseQueryKey(defenseId) } });
  const { data: users } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });
  const { data: theses } = useListTheses({}, { query: { queryKey: getListThesesQueryKey({}) } });
  const deleteDefense = useDeleteDefense();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;
  if (!defense) return <div className="p-8 text-center text-slate-500">Защитата не е намерена.</div>;

  const date = new Date(defense.scheduledAt);
  const isPast = date < new Date();
  const committeeMembers = (defense as any).committee?.members ?? [];
  const defenseStudents = (defense as any).students ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/defenses" data-testid="link-back-defenses">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0a192f]">{defense.title}</h1>
            <Badge variant="outline" className={isPast ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-green-50 text-green-700 border-green-200"}>
              {isPast ? "Проведена" : "Предстояща"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{date.toLocaleDateString("bg", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{(defense as any).startTime ?? date.toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" })}</span>
            {defense.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{defense.location}</span>}
          </div>
        </div>
        {user?.role === "department_head" && (
          <Button variant="destructive" size="sm" disabled={deleteDefense.isPending} data-testid="button-delete-defense"
            onClick={() => deleteDefense.mutate({ id: defenseId }, {
              onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListDefensesQueryKey({}) }); toast({ title: "Защитата е изтрита" }); setLocation("/defenses"); }
            })}>
            <Trash2 className="h-4 w-4 mr-1" /> Изтрий
          </Button>
        )}
      </div>

      {defense.notes && (
        <Card>
          <CardHeader><CardTitle>Бележки</CardTitle></CardHeader>
          <CardContent><p className="text-slate-700">{defense.notes}</p></CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Комисия ({committeeMembers.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {committeeMembers.length === 0 ? <p className="text-slate-400 text-sm italic">Няма членове на комисия</p> : [...committeeMembers].sort((a: any, b: any) => (b.isChairman ? 1 : 0) - (a.isChairman ? 1 : 0)).map((u: any) => (
              <div key={u.id} className={`flex items-center justify-between p-3 rounded-lg border ${u.isChairman ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                <div className="flex items-center gap-3">
                  {u.isChairman && <Crown className="h-3 w-3 text-amber-600 flex-shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-[#0a192f]">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-slate-500">{u.isChairman ? "Председател" : "Член"}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Студенти ({defenseStudents.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {defenseStudents.length === 0 ? <p className="text-slate-400 text-sm italic">Няма добавени студенти</p> : defenseStudents.map((s: any) => (
              <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="font-medium text-sm text-[#0a192f]">{s.firstName} {s.lastName}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
