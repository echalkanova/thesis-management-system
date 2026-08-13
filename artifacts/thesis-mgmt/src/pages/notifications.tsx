import { useListNotifications, getListNotificationsQueryKey, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Bell, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeColors: Record<string, string> = {
  info: "border-l-blue-400",
  success: "border-l-green-400",
  warning: "border-l-amber-400",
  error: "border-l-red-400",
};

export default function Notifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useListNotifications({ query: { queryKey: getListNotificationsQueryKey() } });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  useEffect(() => {
    if (unreadCount > 0) {
      markAll.mutate(undefined as any, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        }
      });
    }
  }, []);

  const handleMarkAll = () => {
    markAll.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        toast({ title: "Всички известия са прочетени" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a192f] tracking-tight">Известия</h1>
          <p className="text-slate-500">{unreadCount > 0 ? `${unreadCount} непрочетени известия` : "Всички известия са прочетени"}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAll} disabled={markAll.isPending} className="flex items-center gap-2" data-testid="button-mark-all-read">
            <CheckCheck className="h-4 w-4" />
            {markAll.isPending ? "..." : "Маркирай всички"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-slate-500">Зареждане...</div>
      ) : notifications?.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-white rounded-lg border border-slate-200">
          <Bell className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="font-medium">Нямате известия</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(n => (
            <Card key={n.id} className={`border-l-4 transition-opacity ${typeColors[n.type] ?? "border-l-slate-300"} ${n.isRead ? "opacity-60" : ""}`} data-testid={`notification-${n.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-[#0a192f]">{n.title}</p>
                      {!n.isRead && <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">Ново</Badge>}
                    </div>
                    <p className="text-sm text-slate-600">{n.message}</p>
                    <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString("bg")}</p>
                    {n.relatedThesisId && (
                      <Link href={`/theses/${n.relatedThesisId}`} className="text-xs text-blue-600 hover:underline" data-testid={`link-notification-thesis-${n.id}`}>
                        Виж дипломната работа
                      </Link>
                    )}
                  </div>
                  {!n.isRead && (
                    <Button size="sm" variant="ghost" onClick={() => markRead.mutate({ id: n.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }) })} data-testid={`button-read-${n.id}`}>
                      <CheckCheck className="h-4 w-4 text-slate-400" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
