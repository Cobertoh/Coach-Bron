// YouTube embed with a lightweight facade: only the thumbnail loads until the user taps play.
import { h } from './util.js';
export function videoCard(v) {
  const box = h('div', { class: 'yt' });
  const thumb = h('button', { class: 'yt-facade', 'aria-label': `Play video: ${v.title}`, style: { backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/hqdefault.jpg)` }, onclick: () => {
    if (!navigator.onLine) { thumb.querySelector('.yt-off').style.display = 'block'; return; }
    box.replaceChildren(h('iframe', { src: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`, title: v.title, allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, loading: 'lazy', referrerpolicy: 'strict-origin-when-cross-origin' }));
  } }, h('span', { class: 'yt-play', 'aria-hidden': 'true' }), h('span', { class: 'yt-off' }, 'You are offline. Connect to watch.'));
  box.append(thumb);
  return h('div', { class: 'ytcard' }, box, h('div', { class: 'ytmeta' }, h('b', {}, v.title), h('span', { class: 'tiny muted' }, (v.by ? v.by + ' · ' : '') + 'YouTube'), h('a', { class: 'tiny', href: `https://www.youtube.com/watch?v=${v.id}`, target: '_blank', rel: 'noopener' }, 'Open in YouTube ↗')));
}
export function videoSection(list, title = 'Watch a coach') {
  if (!list?.length) return null;
  return h('div', {}, h('h2', {}, title), h('div', { class: 'ytlist' }, ...list.map(videoCard)));
}
