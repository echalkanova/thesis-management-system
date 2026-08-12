import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Mail, BookOpen, Send, Crown, Timer } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Supervisors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isStudent = user?.role === "student";

  const [thesisTitle, setThesisTitle] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminViewSupervisor, setAdminViewSupervisor] = useState<any | null>(null);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  const { data: supervisors, isLoading } = useQuery({
    queryKey: ["supervisors-list"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/users/supervisors/list", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка при зареждане на ръководителите");
      return Array.isArray(json) ? json : [];
    },
  });

  const { data: myRequests } = useQuery({
    queryKey: ["my-supervisor-requests"],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/supervisor-requests", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка при зареждане на запитванията");
      return Array.isArray(json) ? json : [];
    },
    enabled: isStudent,
  });

  useEffect(() => {
    if (user?.role === "student" && myRequests) {
      const latestResponse = myRequests.find((r: any) => ["accepted", "rejected"].includes(r.status));
      if (latestResponse) {
        localStorage.setItem(`supervisor_response_seen_${user.id}`, latestResponse.id.toString());
      }
    }
  }, [myRequests, user]);

  const sendRequest = useMutation({
    mutationFn: async (data: { supervisorId: number; thesisTitle: string; technologies: string; description: string }) => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch("/api/supervisor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Запитването е изпратено успешно!" });
      queryClient.invalidateQueries({ queryKey: ["my-supervisor-requests"] });
      queryClient.invalidateQueries({ queryKey: ["supervisors-list"] });
      setDialogOpen(false);
      setThesisTitle(""); setTechnologies(""); setDescription("");
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const { data: supervisorStudents } = useQuery({
    queryKey: ["supervisor-students", adminViewSupervisor?.id],
    queryFn: async () => {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch(`/api/theses?supervisorId=${adminViewSupervisor?.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    enabled: !!adminViewSupervisor?.id,
  });

  const hasActiveRequest = myRequests?.some((r: any) => ["pending", "accepted"].includes(r.status));
  const acceptedRequest = myRequests?.find((r: any) => r.status === "accepted");

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0a192f]">Научни ръководители</h1>
        {user?.role === "admin" 
          ? <p className="text-slate-500 text-sm mt-1">Преглед на наличните ръководители, техните дипломанти и свободните места</p>
          : <p className="text-slate-500 text-sm mt-1">Преглед на наличните ръководители и свободните места</p>
        }
      </div>

      {isStudent && acceptedRequest && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 font-medium">✓ {acceptedRequest.supervisor?.firstName} {acceptedRequest.supervisor?.lastName} одобри вашето запитване.</p>
        </div>
      )}

      {isStudent && myRequests?.find((r: any) => r.status === "pending") && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 font-medium">⏳ Имате изчакващо запитване</p>
          <p className="text-amber-700 text-sm mt-1">Очаквате отговор от ръководителя.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(supervisors ?? []).slice().sort((a: any, b: any) => {
          const aIsAccepted = acceptedRequest?.supervisor?.id === a.id;
          const bIsAccepted = acceptedRequest?.supervisor?.id === b.id;
          if (aIsAccepted) return -1;
          if (bIsAccepted) return 1;
          return 0;
        }).map((s: any) => (
          <Card
            key={s.id}
            className={`hover:shadow-md transition-shadow ${user?.role === "admin" ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (user?.role === "admin") {
                setAdminViewSupervisor(s);
                setAdminDialogOpen(true);
              }
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold text-[#0a192f] flex items-center gap-2">
                  {acceptedRequest?.supervisor?.id === s.id && (
                    <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                  {myRequests?.some((r: any) => r.supervisorId === s.id && r.status === "pending") && (
                    <Timer className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  )}
                  {s.firstName} {s.lastName}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={s.freeSlots > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                  {s.freeSlots > 0 ? `${s.freeSlots} свободни` : "Пълен"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                {s.email}
              </div>
              {s.subjectTaught && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  {s.subjectTaught}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4 text-slate-400" />
                {s.acceptedStudents} / {s.maxStudents} места 
              </div>

              {isStudent && !hasActiveRequest && s.freeSlots > 0 && (
                <Dialog
                  open={dialogOpen && selectedSupervisorId === s.id}
                  onOpenChange={(open) => { setDialogOpen(open); if (open) setSelectedSupervisorId(s.id); }}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[#0a192f] text-white mt-2" size="sm">
                      <Send className="h-4 w-4 mr-2" /> Изпрати запитване
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Запитване до {s.firstName} {s.lastName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Тема на проекта *</Label>
                        <Input value={thesisTitle} onChange={e => setThesisTitle(e.target.value)} placeholder="Въведете тема..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Технологии *</Label>
                        <Input value={technologies} onChange={e => setTechnologies(e.target.value)} placeholder="React, Node.js, PostgreSQL..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Кратко описание *</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Опишете накратко вашия проект..." />
                      </div>
                      <Button
                        className="w-full bg-[#0a192f] text-white"
                        disabled={sendRequest.isPending || !thesisTitle || !technologies || !description}
                        onClick={() => sendRequest.mutate({ supervisorId: s.id, thesisTitle, technologies, description })}>
                        {sendRequest.isPending ? "Изпращане..." : "Изпрати запитване"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}
        {/* Admin dialog — списък студенти */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Студенти на {adminViewSupervisor?.firstName} {adminViewSupervisor?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {!supervisorStudents || supervisorStudents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Няма назначени студенти</p>
            ) : (
              supervisorStudents.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {t.student?.firstName?.[0]}{t.student?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.student?.firstName} {t.student?.lastName}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{t.title}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{t.status}</Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
        {(!supervisors || supervisors.length === 0) && (
          <div className="col-span-3 text-center py-12 text-slate-400">Няма регистрирани ръководители</div>
        )}
      </div>
    </div>
  );
}
