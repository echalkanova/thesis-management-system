import { useListDefenses, getListDefensesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";

export default function DefensesList() {
  const { user } = useAuth();
  const { data: defenses, isLoading } = useListDefenses({}, { query: { queryKey: getListDefensesQueryKey({}) } });

  const now = new Date();
  const upcoming = defenses?.filter(d => new Date(d.scheduledAt) >= now).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()) ?? [];
  const past = defenses?.filter(d => new Date(d.scheduledAt) < now).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()) ?? [];

  const DefenseCard = ({ defense }: { defense: typeof defenses extends undefined ? never : NonNullable<typeof defenses>[0] }) => {
    const date = new Date(defense.scheduledAt);
    const isPast = date < now;
    return (
      <Link href={`/defenses/${defense.id}`} data-testid={`link-defense-${defense.id}`}>
        <Card className={`hover:border-slate-300 transition-colors cursor-pointer ${isPast ? 'opacity-60' : ''}`}>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="flex gap-4">
                <div className={`flex flex-col items-center justify-center min-w-[3.5rem] h-14 rounded-lg font-bold text-sm ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-800'}`}>
                  <span className="text-xl leading-none">{date.getDate()}</span>
                  <span className="text-xs uppercase">{date.toLocaleString("bg", { month: "short" })}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-[#0a192f]">{defense.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{date.toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" })}</span>
                    {defense.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{defense.location}</span>}
                    {defense.roomOrLink && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{defense.roomOrLink}</span>}
                  </div>
                  <p className="text-xs text-slate-400">{defense.thesisIds.length} дипломн{defense.thesisIds.length === 1 ? "а работа" : "и работи"} &bull; {defense.committeeIds.length} члена на комисия</p>
                </div>
              </div>
              <Badge variant="outline" className={isPast ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-green-50 text-green-700 border-green-200"}>
                {isPast ? "Проведена" : "Предстояща"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f] tracking-tight">График за защити</h1>
          <p className="text-slate-500">Всички насрочени и проведени защити на дипломни работи</p>
        </div>
        {(user?.role === "admin" || user?.role === "department_head") && (
          <Button asChild className="bg-[#0a192f] hover:bg-[#112240] text-white">
            <Link href="/defenses/new" data-testid="link-new-defense">
              <Plus className="mr-2 h-4 w-4" /> Насрочи защита
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-slate-500">Зареждане...</div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#0a192f]">Предстоящи ({upcoming.length})</h2>
              {upcoming.map(d => <DefenseCard key={d.id} defense={d} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-500">Проведени ({past.length})</h2>
              {past.map(d => <DefenseCard key={d.id} defense={d} />)}
            </div>
          )}
          {defenses?.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
              Няма насрочени защити
            </div>
          )}
        </>
      )}
    </div>
  );
}
