import { useAuth } from "@/lib/auth";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatStatus, getStatusColor } from "@/lib/utils";
import { BookOpen, Calendar, Clock, FileText, CheckCircle, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey()
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Зареждане на данни...</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">Табло</h1>
        <p className="text-slate-500">Добре дошли отново, {user?.firstName}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общо дипломни работи</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTheses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Предстоящи защити</CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDefenses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Чакащи рецензии</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среден успех</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Последни дипломни работи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTheses?.slice(0, 5).map(thesis => (
                <div key={thesis.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-[#0a192f] truncate max-w-[250px]">{thesis.title}</p>
                    <p className="text-xs text-slate-500">{thesis.student?.firstName} {thesis.student?.lastName}</p>
                  </div>
                  <Badge className={getStatusColor(thesis.status)} variant="outline">
                    {formatStatus(thesis.status)}
                  </Badge>
                </div>
              ))}
              {(!stats.recentTheses || stats.recentTheses.length === 0) && (
                <div className="text-sm text-slate-500 text-center py-4">Няма намерени дипломни работи</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Предстоящи защити</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingDefenseList?.slice(0, 5).map(defense => (
                <div key={defense.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="bg-amber-100 text-amber-800 p-2 rounded-md flex flex-col items-center justify-center min-w-[3rem]">
                    <span className="text-xs font-bold">{new Date(defense.scheduledAt).getDate()}</span>
                    <span className="text-xs uppercase">{new Date(defense.scheduledAt).toLocaleString('bg', { month: 'short' })}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#0a192f]">{defense.title}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(defense.scheduledAt).toLocaleString('bg', { hour: '2-digit', minute: '2-digit' })}
                      {defense.roomOrLink && ` • ${defense.roomOrLink}`}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats.upcomingDefenseList || stats.upcomingDefenseList.length === 0) && (
                <div className="text-sm text-slate-500 text-center py-4">Няма предстоящи защити</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
