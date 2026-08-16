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
  const urlStatus = new URLSearchParams(window.location.search).get("status");
  const [search, setSearch] = useState("");
  const urlTab = new URLSearchParams(window.location.search).get("tab");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "defended">(
    urlTab === "defended" ? "defended" : "all"
  );
  
    const roleFilter = 
    user?.role === "supervisor" ? { supervisorId: user?.id } :
    user?.role === "reviewer" ? { reviewerId: user?.id } : {};
  const combinedFilter = { ...roleFilter };
  const { data: theses, isLoading } = useListTheses({ search: search || undefined, ...combinedFilter } as any, {
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
      {!["student"].includes(user?.role ?? "") && (
        <div className="flex gap-0 border-b border-slate-200">
          {(["all", "active", "defended"] as const).map(tab => {
            const labels = { all: "Всички", active: "В процес", defended: "Защитени" };
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#0a192f] text-[#0a192f]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                {labels[tab]}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-4 items-center">
        <div className="relative w-full md:w-[500px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Търсене по заглавие, факултетен номер или ръководител..." 
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
          {(theses ?? []).filter(t => {
            if (activeTab === "defended") return ["defended", "graded"].includes(t.status as string);
            if (activeTab === "active") return !["defended", "graded", "draft"].includes(t.status as string);
            return true;
          }).map((thesis) => (
            <Link key={thesis.id} href={`/theses/${thesis.id}`}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${user?.role === "department_head" && (thesis.status as string) === "approved_for_defense" ? "opacity-60" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#0a192f]">{thesis.title}</h3>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        Студент: <span className="font-medium text-slate-700">{thesis.student?.firstName} {thesis.student?.lastName}</span>
                        {thesis.field && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>Технология: <span className="font-medium text-slate-700">{thesis.field}</span></span>
                          </>
                        )}
                        {["department_head", "admin", "reviewer"].includes(user?.role ?? "") && (thesis as any).supervisor && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>Ръководител: <span className="font-medium text-slate-700">{(thesis as any).supervisor?.firstName} {(thesis as any).supervisor?.lastName}</span></span>
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
