import { useListTheses, getListThesesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { formatStatus, getStatusColor } from "@/lib/utils";

export default function ThesesList() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  
    const roleFilter = 
    (user?.role === "supervisor" || user?.role === "department_head") ? { supervisorId: user?.id } :
    user?.role === "reviewer" ? { reviewerId: user?.id } : {};
  const { data: theses, isLoading } = useListTheses({ search: search || undefined, ...roleFilter } as any, {
    query: {
      queryKey: getListThesesQueryKey({ search: search || undefined, ...roleFilter } as any)
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f] tracking-tight">Дипломни работи</h1>
          {!["department_head", "admin"].includes(user?.role ?? "") && (
            <p className="text-slate-500"></p>
          )}
        </div>
        
        {user?.role === "student" && (() => {
          const hasApproved = theses?.some(t =>
            !["draft", "returned_for_revision"].includes(t.status)
          );
          return hasApproved ? (
            <Button disabled className="bg-slate-300 text-slate-500 cursor-not-allowed">
              <Plus className="mr-2 h-4 w-4" /> Създай нова
            </Button>
          ) : (
            <Button asChild className="bg-[#0a192f] hover:bg-[#112240] text-white">
              <Link href="/theses/new" data-testid="link-new-thesis">
                <Plus className="mr-2 h-4 w-4" /> Създай нова
              </Link>
            </Button>
          );
        })()}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Търсене по заглавие или ключови думи..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-theses"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-slate-500">Зареждане...</div>
      ) : (
        <div className="grid gap-4">
          {theses?.map((thesis) => (
            <Link key={thesis.id} href={`/theses/${thesis.id}`} data-testid={`link-thesis-${thesis.id}`}>
              <Card className="hover:border-slate-300 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#0a192f]">{thesis.title}</h3>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        Студент: <span className="font-medium text-slate-700">{thesis.student?.firstName} {thesis.student?.lastName}</span>
                        {thesis.field && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>{thesis.field}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <Badge className={getStatusColor(thesis.status)} variant="outline">
                        {formatStatus(thesis.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {theses?.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
              Няма намерени дипломни работи
            </div>
          )}
        </div>
      )}
    </div>
  );
}
