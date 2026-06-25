import type { Response } from "express";

const connections = new Map<number, Set<Response>>();

export function addSseClient(userId: number, res: Response): void {
  if (!connections.has(userId)) connections.set(userId, new Set());
  connections.get(userId)!.add(res);
}

export function removeSseClient(userId: number, res: Response): void {
  const set = connections.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) connections.delete(userId);
}

export function pushNotification(userId: number, notification: Record<string, unknown>): void {
  const set = connections.get(userId);
  if (!set || set.size === 0) return;
  const data = `data: ${JSON.stringify(notification)}\n\n`;
  for (const res of set) {
    try {
      res.write(data);
    } catch {
      set.delete(res);
    }
  }
}
