import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, User, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";

function apiHeaders(): Record<string, string> {
  const token = localStorage.getItem("thesis_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SupervisorRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedReviewer, setSelectedReviewer] = useState<Record<number, string>>({});
  const [msgText, setMsgText] = useState<Record<number, string>>({});
  const [msgOpen, setMsgOpen] = useState<Record<number, boolean>>({});

  const { data: requests, isLoading } = useQuery({
    queryKey: ["supervisor-requests"],
    queryFn: async () => {
      const res = await fetch("/api/supervisor-requests", { headers: apiHeaders() });
      return res.json();
    },
  });

  const { data: reviewers } = useQuery({
    queryKey: ["reviewers-list"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=reviewer", { headers: apiHeaders() });
      return res.json();
    },
  });

  const accept = useMutation({
    mutationFn: async ({ id, reviewerId }: { id: number; reviewerId: number }) => {
      const res = await fetch(`/api/supervisor-requests/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiHeaders() },
        body: JSON.stringify({ reviewerId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => { toast({ title: "Запитването е одобрено" }); queryClient.invalidateQueries({ queryKey: ["supervisor-requests"] }); },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const reject = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/supervisor-requests/${id}/reject`, {
        method: "POST",
        headers: apiHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: () => { toast({ title: "Запитването е отхвърлено" }); queryClient.invalidateQueries({ queryKey: ["supervisor-requests"] }); },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: number; content: string }) => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiHeaders() },
        body: JSON.stringify({ receiverId, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Грешка");
      return json;
    },
    onSuccess: (_, vars) => {
      toast({ title: "Съобщението е изпратено" });
      setMsgText(prev => ({ ...prev }));
      setMsgOpen(prev => ({ ...prev }));
      setLocation(`/messages/${vars.receiverId}`);
    },
    onError: (e: Error) => toast({ title: "Грешка", description: e.message, variant: "destructive" }),
  });

  const statusLabel = (s: string) => ({ pending: "Изчаква", accepted: "Одобрено", rejected: "Отхвърлено" }[s] ?? s);
  const statusColor = (s: string) => ({
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  }[s] ?? "");

  if (user?.role !== "supervisor" && user?.role !== "admin") {
    return <div className="p-8 text-center text-slate-500">Нямате достъп до тази страница.</div>;
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0a192f]">Запитвания от студенти</h1>
        {user?.role !== "supervisor" && (
          <p className="text-slate-500 text-sm mt-1">Управлявайте запитванията</p>
        )}
      </div>

      {!requests?.length && (
        <Card><CardContent className="py-12 text-center text-slate-400">Няма запитвания</CardContent></Card>
      )}

      <div className="space-y-4">
        {requests?.map((r: any) => (
          <Card key={r.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{r.thesisTitle}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    {r.student?.firstName} {r.student?.lastName}
                    {r.student?.email && <span className="text-slate-400">· {r.student.email}</span>}
                  </p>
                </div>
                <Badge variant="outline" className={statusColor(r.status)}>{statusLabel(r.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium tracking-wide">Технологии</p>
                <p className="text-sm text-slate-700">{r.technologies}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-medium tracking-wide">Описание</p>
                <p className="text-sm text-slate-700">{r.description}</p>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(r.createdAt).toLocaleDateString("bg", { day: "2-digit", month: "long", year: "numeric" })}
              </p>

              <div className="flex gap-2 pt-1 flex-wrap">
                {/* Send message — always available */}
                <Dialog
                  open={!!msgOpen[r.id]}
                  onOpenChange={open => setMsgOpen(prev => ({ ...prev, [r.id]: open }))}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> Изпрати съобщение
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Съобщение до {r.student?.firstName} {r.student?.lastName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Textarea
                        value={msgText[r.id] ?? ""}
                        onChange={e => setMsgText(prev => ({ ...prev, [r.id]: e.target.value }))}
                        placeholder="Напишете съобщение..."
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          disabled={!msgText[r.id]?.trim() || sendMessage.isPending}
                          onClick={() => sendMessage.mutate({ receiverId: r.student.id, content: msgText[r.id] })}>
                          {sendMessage.isPending ? "Изпращане..." : "Изпрати"}
                        </Button>
                        <Button variant="outline" onClick={() => setMsgOpen(prev => ({ ...prev, [r.id]: false }))}>
                          Отказ
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {r.status === "pending" && user?.role === "supervisor" && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Одобри
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Изберете рецензент</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-2">
                          <Label>Рецензент *</Label>
                          <Select
                            value={selectedReviewer[r.id] ?? ""}
                            onValueChange={v => setSelectedReviewer(prev => ({ ...prev, [r.id]: v }))}>
                            <SelectTrigger><SelectValue placeholder="Изберете рецензент" /></SelectTrigger>
                            <SelectContent>
                              {reviewers?.map((rev: any) => (
                                <SelectItem key={rev.id} value={String(rev.id)}>
                                  {rev.firstName} {rev.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            disabled={!selectedReviewer[r.id] || accept.isPending}
                            onClick={() => accept.mutate({ id: r.id, reviewerId: Number(selectedReviewer[r.id]) })}>
                            Потвърди одобрението
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-1"
                      disabled={reject.isPending}
                      onClick={() => reject.mutate(r.id)}>
                      <XCircle className="h-4 w-4" /> Откажи
                    </Button>
                  </>
                )}
              </div>

              {r.status === "accepted" && r.reviewer && (
                <p className="text-xs text-slate-500 pt-1">
                  Рецензент: <span className="font-medium">{r.reviewer.firstName} {r.reviewer.lastName}</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
