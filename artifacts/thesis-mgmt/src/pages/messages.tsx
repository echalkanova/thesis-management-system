import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Search } from "lucide-react";
import { formatRole, cn } from "@/lib/utils";

function apiHeaders() : Record<string, string> {
  const token = localStorage.getItem("thesis_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("bg", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("bg", { day: "2-digit", month: "short" });
}

export default function Messages() {
  const { user } = useAuth();
  const [, params] = useRoute("/messages/:userId");
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState<number | null>(params?.userId ? Number(params.userId) : null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ["messages-conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages", { headers: apiHeaders() });
      return res.json();
    },
    refetchInterval: 4000,
  });

  const { data: selectedUser } = useQuery({
    queryKey: ["user-info", selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${selectedId}`, { headers: apiHeaders() });
      return res.json();
    },
    enabled: !!selectedId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages-chat", selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${selectedId}`, { headers: apiHeaders() });
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["messages-unread"] });
      queryClient.invalidateQueries({ queryKey: ["messages-conversations"] });
      return data;
    },
    enabled: !!selectedId,
    refetchInterval: 4000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...apiHeaders() },
        body: JSON.stringify({ receiverId: selectedId, content: input }),
      });
      return res.json();
    },
    onSuccess: () => {
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["messages-chat", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["messages-conversations"] });
    },
  });

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setLocation(`/messages/${id}`);
  };

  const conv = conversations.find((c: any) => c.user?.id === selectedId);
  const partnerUser = conv?.user ?? selectedUser;

  const { data: allUsers = [] } = useQuery({
    queryKey: ["all-users-search", search],
    queryFn: async () => {
      if (!search || search.length < 2) return [];
      const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`, { headers: apiHeaders() });
      const data = await res.json();
      return data.filter((u: any) => {
        if (u.id === user?.id) return false;
        if (user?.role === "student" && u.role === "admin") return false;
        return true;
      });
    },
    enabled: search.length >= 2,
  });

  const filteredConvs = search
    ? conversations.filter((c: any) =>
        `${c.user?.firstName} ${c.user?.lastName}`.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  const newContacts = search.length >= 2
    ? allUsers.filter((u: any) => !conversations.some((c: any) => c.user?.id === u.id))
    : [];

  return (
    <div className="h-[calc(100vh-3.5rem-3rem)] -m-6 flex">
      {/* Conversation list */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-3">Съобщения</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Търси..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Existing conversations */}
          {filteredConvs.map((c: any) => (
            <button
              key={c.user.id}
              onClick={() => handleSelect(c.user.id)}
              className={cn(
                "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50",
                selectedId === c.user.id && "bg-indigo-50 border-indigo-100"
              )}>
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
                {c.user.firstName[0]}{c.user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800 truncate">{c.user.firstName} {c.user.lastName}</span>
                  <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">{timeLabel(c.lastMessage.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-slate-400 truncate max-w-[150px]">{c.lastMessage.content}</span>
                  {c.unreadCount > 0 && (
                    <Badge className="h-4 min-w-4 px-1 text-[9px] bg-indigo-600 text-white ml-1">{c.unreadCount}</Badge>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* New contacts from search */}
          {newContacts.map((u: any) => (
            <button
              key={u.id}
              onClick={() => handleSelect(u.id)}
              className={cn(
                "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50",
                selectedId === u.id && "bg-indigo-50 border-indigo-100"
              )}>
              <div className="w-9 h-9 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
                {u.firstName[0]}{u.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{u.firstName} {u.lastName}</div>
                <div className="text-xs text-slate-400">{formatRole(u.role)}</div>
              </div>
            </button>
          ))}

          {/* Empty state — shown only when no results at all */}
          {filteredConvs.length === 0 && newContacts.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">Няма разговори</div>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={40} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium">Изберете разговор</p>
            <p className="text-xs mt-1">или напишете ново съобщение</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {partnerUser?.firstName?.[0]}{partnerUser?.lastName?.[0]}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{partnerUser?.firstName} {partnerUser?.lastName}</div>
                {partnerUser?.role && <div className="text-xs text-slate-400">{formatRole(partnerUser.role)}</div>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {(messages as any[]).length === 0 && (
                <div className="text-center text-slate-400 text-sm py-8">Изпратете първото съобщение!</div>
              )}
              {(messages as any[]).map((m: any) => {
                const isMine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      isMine
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-sm"
                    )}>
                      <p>{m.content}</p>
                      <p className={cn("text-[10px] mt-1 text-right", isMine ? "text-indigo-200" : "text-slate-400")}>
                        {timeLabel(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-100 px-5 py-3 flex gap-2 flex-shrink-0">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Напишете съобщение..."
                className="flex-1"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && input.trim()) { e.preventDefault(); send.mutate(); } }}
              />
              <Button
                onClick={() => send.mutate()}
                disabled={!input.trim() || send.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4">
                <Send size={15} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
