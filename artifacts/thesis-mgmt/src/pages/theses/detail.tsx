import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetThesis, getGetThesisQueryKey,
  useListThesisFiles, getListThesisFilesQueryKey,
  useListThesisReviews, getListThesisReviewsQueryKey,
  useListThesisGrades, getListThesisGradesQueryKey,
  useListUsers, getListUsersQueryKey,
  useSubmitThesis, useAssignThesis,
  useDeleteFile,
  useCreateReview, useCreateGrade,
  getListThesesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { formatStatus, getStatusColor, formatRole } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, UserCheck, Star, Paperclip, Trash2 } from "lucide-react";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { ThesisTimeline } from "@/components/thesis-timeline";

const gradeLabel = (v: number) => {
  if (v >= 5.5) return "Отличен";
  if (v >= 4.5) return "Много добър";
  if (v >= 3.5) return "Добър";
  if (v >= 2.5) return "Среден";
  return "Слаб";
};

export default function ThesisDetail() {
  const { id } = useParams<{ id: string }>();
  const thesisId = Number(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: thesis, isLoading } = useGetThesis(thesisId, { query: { queryKey: getGetThesisQueryKey(thesisId) } });
  const { data: files } = useListThesisFiles(thesisId, { query: { queryKey: getListThesisFilesQueryKey(thesisId) } });
  const { data: reviews } = useListThesisReviews(thesisId, { query: { queryKey: getListThesisReviewsQueryKey(thesisId) } });
  const { data: grades } = useListThesisGrades(thesisId, { query: { queryKey: getListThesisGradesQueryKey(thesisId) } });
  const { data: users } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });

  const submitThesis = useSubmitThesis();
  const assignThesis = useAssignThesis();
  const deleteFile = useDeleteFile();
  const createReview = useCreateReview();
  const createGrade = useCreateGrade();

  const [reviewContent, setReviewContent] = useState("");
  const [reviewRecommendation, setReviewRecommendation] = useState("approve");
  const [gradeValue, setGradeValue] = useState("");
  const [gradeComment, setGradeComment] = useState("");
  const [assignRole, setAssignRole] = useState<"supervisor" | "reviewer">("supervisor");
  const [assignUserId, setAssignUserId] = useState("");
  const [statusToSet, setStatusToSet] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [actionPending, setActionPending] = useState<string | null>(null);

  const thesisAction = async (action: string, body?: Record<string, unknown>) => {
    setActionPending(action);
    try {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch(`/api/theses/${thesisId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Грешка");
      invalidate();
      return data;
    } finally {
      setActionPending(null);
    }
  };

  const adminStatusChange = async (status: string) => {
    setActionPending("status");
    try {
      const token = localStorage.getItem("thesis_token");
      const res = await fetch(`/api/theses/${thesisId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Грешка");
      invalidate();
    } finally {
      setActionPending(null);
    }
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetThesisQueryKey(thesisId) });
    queryClient.invalidateQueries({ queryKey: getListThesesQueryKey() });
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;
  if (!thesis) return <div className="p-8 text-center text-slate-500">Дипломната работа не е намерена.</div>;

  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";
  const isSupervisor = user?.role === "supervisor";
  const isReviewer = user?.role === "reviewer";
  const isOwner = thesis.studentId === user?.id;
  const isAssignedReviewer = thesis.reviewerId === user?.id;

  const supervisors = users?.filter(u => u.role === "supervisor") ?? [];
  const reviewers = users?.filter(u => u.role === "reviewer") ?? [];

  const avgGrade = grades && grades.length > 0 ? grades.reduce((s, g) => s + g.value, 0) / grades.length : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/theses" data-testid="link-back-theses">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0a192f]">{thesis.title}</h1>
            <Badge className={getStatusColor(thesis.status)} variant="outline" data-testid="status-thesis">
              {formatStatus(thesis.status)}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Студент: <span className="font-medium">{thesis.student?.firstName} {thesis.student?.lastName}</span>
            {thesis.field && <> &bull; Област: <span className="font-medium">{thesis.field}</span></>}
          </p>
        </div>
      </div>

      <ThesisTimeline currentStatus={thesis.status} finalGrade={(thesis as any).finalGrade} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Описание</CardTitle></CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{thesis.description || <span className="text-slate-400 italic">Няма добавено описание</span>}</p>
              {thesis.keywords && <p className="mt-3 text-sm text-slate-500">Ключови думи: <span className="font-medium text-slate-700">{thesis.keywords}</span></p>}
            </CardContent>
          </Card>

          {files && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> Файлове ({files.length})</CardTitle>
                  {(isOwner || isSupervisor || isAdmin) && (
                    <FileUploadDialog thesisId={thesisId} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Няма прикачени файлове</p>
                ) : (
                  <div className="space-y-2">
                    {files.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100" data-testid={`file-item-${f.id}`}>
                        <a href={f.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                          <FileText className="h-4 w-4" />
                          {f.fileName}
                        </a>
                        {(isAdmin || f.uploadedBy === user?.id) && (
                          <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600" data-testid={`button-delete-file-${f.id}`}
                            onClick={() => deleteFile.mutate({ id: f.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListThesisFilesQueryKey(thesisId) }) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Рецензии ({reviews?.length ?? 0})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {reviews?.map(r => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100" data-testid={`review-item-${r.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-[#0a192f]">{r.reviewer?.firstName} {r.reviewer?.lastName}</span>
                    <Badge variant="outline" className={r.recommendation === "approve" ? "bg-green-50 text-green-700 border-green-200" : r.recommendation === "reject" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                      {r.recommendation === "approve" ? "Одобрявам" : r.recommendation === "reject" ? "Не одобрявам" : "Препоръчвам корекции"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{r.content}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(r.createdAt).toLocaleDateString("bg")}</p>
                </div>
              ))}
              {(isAssignedReviewer || isAdmin) && thesis.status === "under_review" && (
                <div className="border-t pt-4 space-y-3">
                  <Label className="font-semibold">Добавяне на рецензия</Label>
                  <Textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)} rows={4} placeholder="Вашата рецензия..." data-testid="input-review-content" />
                  <Select value={reviewRecommendation} onValueChange={setReviewRecommendation}>
                    <SelectTrigger data-testid="select-review-recommendation"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Одобрявам</SelectItem>
                      <SelectItem value="reject">Не одобрявам</SelectItem>
                      <SelectItem value="revise">Препоръчвам корекции</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-[#0a192f] text-white" disabled={createReview.isPending || !reviewContent} data-testid="button-submit-review"
                    onClick={() => createReview.mutate({ id: thesisId, data: { content: reviewContent, recommendation: reviewRecommendation as "approve" | "reject" | "revise", isPublished: true } }, {
                      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListThesisReviewsQueryKey(thesisId) }); setReviewContent(""); toast({ title: "Рецензията е добавена" }); }
                    })}>
                    {createReview.isPending ? "Запазване..." : "Добави рецензия"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Оценки ({grades?.length ?? 0})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {avgGrade !== null && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-2xl font-bold text-amber-700">{avgGrade.toFixed(2)}</span>
                  <span className="text-amber-600 font-medium">{gradeLabel(avgGrade)}</span>
                </div>
              )}
              {grades?.map(g => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100" data-testid={`grade-item-${g.id}`}>
                  <div>
                    <span className="font-medium text-sm text-[#0a192f]">{g.grader?.firstName} {g.grader?.lastName}</span>
                    {g.comment && <p className="text-xs text-slate-500 mt-0.5">{g.comment}</p>}
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-base font-bold px-3">{g.value}</Badge>
                </div>
              ))}
              {(user?.role === "committee_member" || isAdmin) && thesis.status === "defended" && (
                <div className="border-t pt-4 space-y-3">
                  <Label className="font-semibold">Добавяне на оценка</Label>
                  <Input type="number" step="0.25" min="2" max="6" value={gradeValue} onChange={e => setGradeValue(e.target.value)} placeholder="2 - 6" data-testid="input-grade-value" />
                  <Input value={gradeComment} onChange={e => setGradeComment(e.target.value)} placeholder="Коментар (по избор)" data-testid="input-grade-comment" />
                  <Button className="bg-[#0a192f] text-white" disabled={createGrade.isPending || !gradeValue} data-testid="button-submit-grade"
                    onClick={() => createGrade.mutate({ id: thesisId, data: { value: Number(gradeValue), comment: gradeComment || undefined } }, {
                      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListThesisGradesQueryKey(thesisId) }); setGradeValue(""); setGradeComment(""); toast({ title: "Оценката е добавена" }); }
                    })}>
                    {createGrade.isPending ? "Запазване..." : "Добави оценка"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-slate-500">Студент:</span><p className="font-medium text-[#0a192f]">{thesis.student?.firstName} {thesis.student?.lastName}</p></div>
              <div><span className="text-slate-500">Научен ръководител:</span><p className="font-medium text-[#0a192f]">{thesis.supervisor ? `${(thesis.supervisor as any).firstName} ${(thesis.supervisor as any).lastName}` : <span className="text-slate-400 italic">Не е назначен</span>}</p></div>
              <div><span className="text-slate-500">Рецензент:</span><p className="font-medium text-[#0a192f]">{thesis.reviewer ? `${(thesis.reviewer as any).firstName} ${(thesis.reviewer as any).lastName}` : <span className="text-slate-400 italic">Не е назначен</span>}</p></div>
              {thesis.submittedAt && <div><span className="text-slate-500">Подадена на:</span><p className="font-medium text-[#0a192f]">{new Date(thesis.submittedAt).toLocaleDateString("bg")}</p></div>}
              <div><span className="text-slate-500">Създадена:</span><p className="font-medium text-[#0a192f]">{new Date(thesis.createdAt).toLocaleDateString("bg")}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Действия</CardTitle></CardHeader>
            <CardContent className="space-y-2">

              {/* STUDENT: Submit */}
              {isOwner && thesis.status === "draft" && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={submitThesis.isPending} data-testid="button-submit-thesis"
                  onClick={() => submitThesis.mutate({ id: thesisId }, { onSuccess: () => { invalidate(); toast({ title: "Дипломната работа е подадена" }); } })}>
                  {submitThesis.isPending ? "Подаване..." : "Подай за рецензия"}
                </Button>
              )}

              {/* SUPERVISOR: Approve */}
              {isSupervisor && thesis.supervisorId === user?.id && ["submitted", "pending_supervisor_approval", "returned_for_revision"].includes(thesis.status) && (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={actionPending === "approve"} data-testid="button-approve"
                  onClick={() => thesisAction("approve").then(() => toast({ title: "Дипломната работа е одобрена" })).catch(e => toast({ title: "Грешка", description: e.message, variant: "destructive" }))}>
                  {actionPending === "approve" ? "Одобряване..." : "✓ Одобри"}
                </Button>
              )}

              {/* SUPERVISOR: Return for revision */}
              {isSupervisor && thesis.supervisorId === user?.id && ["submitted", "pending_supervisor_approval", "under_review"].includes(thesis.status) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50" data-testid="button-return">
                      ↩ Върни за корекции
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Връщане за корекции</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Label>Коментар (по избор)</Label>
                      <Textarea value={returnComment} onChange={e => setReturnComment(e.target.value)} rows={3} placeholder="Опишете какво трябва да се коригира..." data-testid="input-return-comment" />
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={actionPending === "return"} data-testid="button-confirm-return"
                        onClick={() => thesisAction("return", returnComment ? { comment: returnComment } : undefined)
                          .then(() => { toast({ title: "Работата е върната за корекции" }); setReturnComment(""); })
                          .catch(e => toast({ title: "Грешка", description: e.message, variant: "destructive" }))}>
                        {actionPending === "return" ? "Изпращане..." : "Потвърди"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* ADMIN: Send to review */}
              {isAdmin && thesis.status === "approved_by_supervisor" && (
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={actionPending === "send-to-review"} data-testid="button-send-to-review"
                  onClick={() => thesisAction("send-to-review").then(() => toast({ title: "Изпратена за рецензия" })).catch(e => toast({ title: "Грешка", description: e.message, variant: "destructive" }))}>
                  {actionPending === "send-to-review" ? "Изпращане..." : "Изпрати за рецензия"}
                </Button>
              )}

              {/* ADMIN: Approve for defense */}
              {isAdmin && thesis.status === "reviewed" && (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={actionPending === "approve-for-defense"} data-testid="button-approve-for-defense"
                  onClick={() => thesisAction("approve-for-defense").then(() => toast({ title: "Допусната до защита" })).catch(e => toast({ title: "Грешка", description: e.message, variant: "destructive" }))}>
                  {actionPending === "approve-for-defense" ? "Обработка..." : "Допусни до защита"}
                </Button>
              )}

              {/* COMMISSION / ADMIN: Mark defended */}
              {(user?.role === "committee_member" || isAdmin) && thesis.status === "scheduled_for_defense" && (
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={actionPending === "mark-defended"} data-testid="button-mark-defended"
                  onClick={() => thesisAction("mark-defended").then(() => toast({ title: "Маркирана като защитена" })).catch(e => toast({ title: "Грешка", description: e.message, variant: "destructive" }))}>
                  {actionPending === "mark-defended" ? "Обработка..." : "Маркирай като защитена"}
                </Button>
              )}

              {/* ADMIN: Manual status override */}
              {isAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="button-change-status">Промени статус ръчно</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Ръчна промяна на статус</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Select value={statusToSet} onValueChange={setStatusToSet}>
                        <SelectTrigger data-testid="select-status"><SelectValue placeholder="Изберете статус" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Чернова</SelectItem>
                          <SelectItem value="submitted">Подадена</SelectItem>
                          <SelectItem value="pending_supervisor_approval">Изчаква одобрение</SelectItem>
                          <SelectItem value="returned_for_revision">Върната за корекции</SelectItem>
                          <SelectItem value="approved_by_supervisor">Одобрена от ръководител</SelectItem>
                          <SelectItem value="under_review">В рецензия</SelectItem>
                          <SelectItem value="reviewed">Рецензирана</SelectItem>
                          <SelectItem value="approved_for_defense">Допусната до защита</SelectItem>
                          <SelectItem value="scheduled_for_defense">Насрочена защита</SelectItem>
                          <SelectItem value="defended">Защитена</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full bg-[#0a192f] text-white" disabled={actionPending === "status" || !statusToSet} data-testid="button-confirm-status"
                        onClick={() => adminStatusChange(statusToSet).then(() => { toast({ title: "Статусът е обновен" }); setStatusToSet(""); }).catch(e => toast({ title: "Грешка", description: e.message, variant: "destructive" }))}>
                        {actionPending === "status" ? "Запазване..." : "Потвърди"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* ADMIN / SUPERVISOR: Assign */}
              {(isAdmin || isSupervisor) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center gap-2" data-testid="button-assign">
                      <UserCheck className="h-4 w-4" /> Назначи
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Назначаване</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Select value={assignRole} onValueChange={v => setAssignRole(v as any)}>
                        <SelectTrigger data-testid="select-assign-role"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supervisor">Научен ръководител</SelectItem>
                          <SelectItem value="reviewer">Рецензент</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={assignUserId} onValueChange={setAssignUserId}>
                        <SelectTrigger data-testid="select-assign-user"><SelectValue placeholder="Изберете потребител" /></SelectTrigger>
                        <SelectContent>
                          {(assignRole === "supervisor" ? supervisors : reviewers).map(u => (
                            <SelectItem key={u.id} value={String(u.id)}>{u.firstName} {u.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className="w-full bg-[#0a192f] text-white" disabled={assignThesis.isPending || !assignUserId} data-testid="button-confirm-assign"
                        onClick={() => assignThesis.mutate({ id: thesisId, data: { role: assignRole, userId: Number(assignUserId) } }, {
                          onSuccess: () => { invalidate(); toast({ title: "Назначението е запазено" }); setAssignUserId(""); }
                        })}>
                        {assignThesis.isPending ? "Запазване..." : "Назначи"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
