import { useSyncExternalStore } from "react";
import { api, ApiError } from "./api";

export type PushState = "unsupported" | "needs-install" | "default" | "denied" | "granted";

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function pushState(): PushState {
  if (isIos() && !isStandalone()) return "needs-install";
  if (!("Notification" in window) || !("PushManager" in window)) return "unsupported";
  return Notification.permission;
}

const urlBase64ToBytes = (b64: string) => {
  const raw = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

export async function enablePush() {
  if ((await Notification.requestPermission()) !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || (await api.vapidKey()).publicKey;
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToBytes(key),
    });
  }

  const { endpoint, keys } = sub.toJSON();
  try {
    await api.subscribe(endpoint!, keys as { p256dh: string; auth: string });
  } catch (e) {
    if (!(e instanceof ApiError && e.code === "SUBSCRIPTION_ALREADY_REGISTERED")) throw e;
  }
  return true;
}

const noopSubscribe = () => () => {};

/** 서버 렌더링 중에는 undefined */
export const usePushState = () =>
  useSyncExternalStore<PushState | undefined>(noopSubscribe, pushState, () => undefined);
