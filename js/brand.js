// Original Coach Bron mascot: a floating cartoon head with a lime headband, beard and shaved dark hair.
// It is an original illustration and is not a likeness of any real person.
export function mascotSVG({ size = 96, mood = 'smile', float = true } = {}) {
  const eyes = mood === 'wink'
    ? `<ellipse cx="47" cy="63" rx="4.2" ry="4.6" fill="#fff"/><circle cx="47.6" cy="63.4" r="2.4" fill="#10141C"/>
       <path d="M67 63.5c2-2.4 6-2.4 8 0" stroke="#10141C" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : mood === 'think'
      ? `<ellipse cx="47" cy="63" rx="4.2" ry="4.6" fill="#fff"/><circle cx="49" cy="61.5" r="2.4" fill="#10141C"/>
         <ellipse cx="71" cy="63" rx="4.2" ry="4.6" fill="#fff"/><circle cx="73" cy="61.5" r="2.4" fill="#10141C"/>`
      : `<ellipse cx="47" cy="63" rx="4.2" ry="4.6" fill="#fff"/><circle cx="47.6" cy="63.4" r="2.4" fill="#10141C"/>
         <ellipse cx="71" cy="63" rx="4.2" ry="4.6" fill="#fff"/><circle cx="71.6" cy="63.4" r="2.4" fill="#10141C"/>`;
  const mouth = mood === 'think'
    ? `<path d="M52 83c4-2 10-2 14 0" stroke="#F4F5F7" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    : `<path d="M50 80c5 6.5 13 6.5 18 0" stroke="#F4F5F7" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
  return `<svg class="mascot ${float ? 'bob' : ''}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="Coach Bron mascot">
  <ellipse cx="60" cy="112" rx="24" ry="4" fill="#000" opacity=".35"/>
  <ellipse cx="25" cy="66" rx="6" ry="9" fill="#7a4d33"/><ellipse cx="95" cy="66" rx="6" ry="9" fill="#7a4d33"/>
  <ellipse cx="60" cy="62" rx="35" ry="40" fill="#8b5a3c"/>
  <path d="M25.5 52C26 28 42 17 60 17s34 11 34.500 35c-8-9-20-13-34.500-13S33.500 43 25.500 52z" fill="#0d0f13"/>
  <path d="M30 50c10-8 22-11 30-11s20 3 30 11" stroke="#1d2129" stroke-width="2" fill="none" opacity=".7"/>
  <rect x="24" y="40" width="72" height="12" rx="5" fill="#A6F36A"/><rect x="24" y="44" width="72" height="3" fill="#7fd04a" opacity=".55"/>
  <path d="M26 70c1 26 15 42 34 42s33-16 34-42c-4 8-10 12-14 13-4-5-11-8-20-8s-16 3-20 8c-4-1-10-5-14-13z" fill="#0d0f13"/>
  <path d="M43 84c4-5 10-7 17-7s13 2 17 7c-3 12-9 19-17 19s-14-7-17-19z" fill="#101319"/>
  <path d="M54 74c4 2 8 2 12 0" stroke="#7a4d33" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  ${eyes}
  <path d="M40 57c3-3 8-3 11-1.5M68 55.500c3-1.500 8-1.500 11 1.500" stroke="#0d0f13" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${mouth}
</svg>`;
}

export const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="112" fill="#090B10"/>
<ellipse cx="256" cy="262" rx="150" ry="170" fill="#8b5a3c"/>
<path d="M106 224C108 118 176 74 256 74s148 44 150 150c-34-38-86-56-150-56s-116 18-150 56z" fill="#0d0f13"/>
<rect x="100" y="172" width="312" height="52" rx="22" fill="#A6F36A"/>
<path d="M112 300c4 112 64 180 144 180s140-68 144-180c-18 34-44 52-60 56-18-22-46-34-84-34s-66 12-84 34c-16-4-42-22-60-56z" fill="#0d0f13"/>
<circle cx="200" cy="268" r="17" fill="#fff"/><circle cx="312" cy="268" r="17" fill="#fff"/>
<circle cx="204" cy="271" r="9" fill="#10141C"/><circle cx="316" cy="271" r="9" fill="#10141C"/>
<path d="M214 352c22 28 62 28 84 0" stroke="#F4F5F7" stroke-width="12" fill="none" stroke-linecap="round"/>
</svg>`;
