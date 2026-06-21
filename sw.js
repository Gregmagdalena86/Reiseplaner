const CACHE="creova-ultimate-v6-final-cache-v1";
const ASSETS=["./","./index.html","./styles.css?v=6","./app.js?v=6","./data.js?v=6","./api-config.js?v=6","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{let copy=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,copy));return r})));
  }
});
