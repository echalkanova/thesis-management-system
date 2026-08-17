import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { FileText, User, Calendar, BookOpen, CheckCircle, XCircle, AlertCircle } from "lucide-react";

function apiHeaders(): Record<string, string> {
  const token = localStorage.getItem("thesis_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const recommendationConfig = {
  approve: { label: "Одобрявам", icon: CheckCircle, className: "bg-green-50 text-green-700 border-green-200" },
  reject: { label: "Не одобрявам", icon: XCircle, className: "bg-red-50 text-red-700 border-red-200" },
  revise: { label: "Препоръчвам корекции", icon: AlertCircle, className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function Reviews() {
  const { user } = useAuth();
  const urlTab = new URLSearchParams(window.location.search).get("tab") as "unreviewed" | "reviewed" | null;
  const [activeTab, setActiveTab] = useState<"unreviewed" | "reviewed">(urlTab ?? "unreviewed");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["my-reviews", user?.id],
    queryFn: async () => {
      const endpoint = user?.role === "admin" ? "/api/reviews" : "/api/reviews/my-reviews";
      const res = await fetch(endpoint, { headers: apiHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0a192f] tracking-tight">Рецензии</h1>
        <p className="text-slate-500 text-sm mt-1">Всички изготвени рецензии</p>
      </div>
      <div className="flex gap-0 border-b border-slate-200">
        {(["unreviewed", "reviewed"] as const).map(tab => {
          const labels = { unreviewed: "Нерецензирани", reviewed: "Рецензирани" };
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

      {isLoading ? (
        <div className="py-8 text-center text-slate-500">Зареждане...</div>
      ) : !reviews?.length ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
          <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Няма изготвени рецензии</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.filter((review: any) => {
            if (activeTab === "reviewed") return review.isPublished;
            if (activeTab === "unreviewed") return !review.isPublished;
            return true;
          }).map((review: any) => {
            const rec = recommendationConfig[review.recommendation as keyof typeof recommendationConfig] ?? recommendationConfig.revise;
            const RecIcon = rec.icon;
            return (
              <Link key={review.id} href={`/theses/${review.thesisId}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        {/* Заглавие */}
                        <h3 className="font-bold text-[#0a192f] text-base group-hover:text-indigo-700 transition-colors">
                          {review.thesis?.title ?? "Дипломна работа"}
                        </h3>

                        {/* Информация */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          {review.thesis?.student && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>{review.thesis.student.firstName} {review.thesis.student.lastName}</span>
                            </div>
                          )}
                          {review.thesis?.field && (
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                              <span>{review.thesis.field}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{new Date(review.createdAt).toLocaleDateString("bg", { day: "2-digit", month: "long", year: "numeric" })}</span>
                          </div>
                        </div>

                        {/* Съдържание */}
                        {review.content && (
                          <p className="text-sm text-slate-600 line-clamp-2 bg-slate-50 rounded-lg px-3 py-2">
                            {review.content}
                          </p>
                        )}
                      </div>

                      {/* Препоръка */}
                      <div className="flex sm:flex-col items-start sm:items-end gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`flex items-center gap-1.5 ${rec.className}`}>
                          <RecIcon className="h-3.5 w-3.5" />
                          {rec.label}
                        </Badge>
                        <span className="text-xs text-slate-400">Виж дипломната работа →</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
