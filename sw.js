// J3 Industries Service Worker
const CACHE = 'j3-v1';
const SHELL = ['/'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network first for Firebase/EmailJS, cache fallback for app shell
  if (e.request.url.includes('firebaseio.com') || e.request.url.includes('emailjs')) {
    return; // Let these go through normally
  }
  e.respondWith(
    fetch(e.request).catch(function(){
      return caches.match(e.request).then(function(r){ return r || caches.match('/'); });
    })
  );
});
