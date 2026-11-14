const CACHE = "next-station-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 네트워크 우선, 실패하면 캐시. 지하 구간에서도 화면이 열리게 한다.
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit ?? caches.match("/"))),
  );
});

self.addEventListener("push", (e) => {
  const d = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(d.title ?? "다음역", {
      body: d.body ?? "",
      icon: "/icon-192.png",
      tag: d.tag,
      data: { url: d.type === "TEST" ? "/" : "/session" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? "/";
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      const open = list[0];
      return open ? open.focus().then(() => open.navigate(url)) : clients.openWindow(url);
    }),
  );
});
