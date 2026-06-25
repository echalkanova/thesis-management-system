import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function useNotificationStream(userId: number | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("thesis_token");
    if (!token) return;

    const url = `/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data) as { title: string; message: string };
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        toast({
          title: notif.title,
          description: notif.message,
        });
      } catch {
        /* ignore malformed events */
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [userId]);
}
