import { useListTheses, getListThesesQueryKey, useListThesisReviews, getListThesisReviewsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatStatus, getStatusColor } from "@/lib/utils";

export default function Reviews() {
  const { user } = useAuth();
  const { data: theses, isLoading } = useListTheses({}, { query: { queryKey: getListThesesQueryKey({}) } });

  const myTheses = theses?.filter(t => user?.role === "reviewer" ? t.reviewerId === user.id : true) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">Рецензии</h1>
        <p className="text-slate-500">Дипломни работи, назначени за рецензиране</p>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-slate-500">Зареждане...</div>
      ) : (
        <div className="space-y-4">
          {myTheses.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
              Няма назначени дипломни работи за рецензия
            </div>
          )}
          {myTheses.map(thesis => (
            <Link key={thesis.id} href={`/theses/${thesis.id}`} data-testid={`link-review-thesis-${thesis.id}`}>
              <Card className="hover:border-slate-300 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-[#0a192f]">{thesis.title}</h3>
                      <p className="text-sm text-slate-500">Студент: {thesis.student?.firstName} {thesis.student?.lastName}</p>
                      {thesis.field && <p className="text-xs text-slate-400">Област: {thesis.field}</p>}
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <Badge className={getStatusColor(thesis.status)} variant="outline">{formatStatus(thesis.status)}</Badge>
                      {thesis.submittedAt && <p className="text-xs text-slate-400">Подадена: {new Date(thesis.submittedAt).toLocaleDateString("bg")}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
