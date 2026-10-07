# OODA of six design sites (2026-10-07, researched from the cloud; the six domains were blocked by the proxy, so facts come from search results and GitHub sources; items marked [unverified] need a check from the PC)

Target constraints: hand-written HTML/CSS/vanilla JS; pages serve their own assets; strict CSP with pinned inline-script hashes and no inline styles; no emoji (inline SVG icons); light/dark/sun/large-text modes; 375 px first to 1920 px; reduced motion respected; no npm/React build; Python stdlib server.

## 1. ui.aceternity.com - ADAPT (idea catalogue only)
200+ animated React components (Tailwind + motion). Licence is NOT MIT despite third-party claims: "You can create unlimited end products for yourself or your clients ... You cannot re-distribute the Item as a stock image or its source files regardless of modifications." Internal app use is fine; never redistribute ported source. Re-implement effects, do not copy files. Relevant effects: Text Generate (word stagger), Sticky Scroll Reveal, Card Stack (timer-based, not scroll), Moving Border, Spotlight, 3D card. Takeaways: stagger with animation-delay keyed off nth-child (no inline style); pointer-tracked spotlight via JS setting --x/--y custom properties (CSSOM is allowed under strict style-src) and radial-gradient; @property --angle + conic-gradient for a moving border, no JS. Risks: auto-rotation breaks WCAG 2.2.2 unless pausable; most components ignore prefers-reduced-motion; blur and big transforms drop frames on mid-range phones; the demo loads external fonts/images.

## 2. hype4.academy glassmorphism generator - ADAPT, sparingly
Outputs a CSS block (background rgba 0.25, box-shadow, backdrop-filter blur, border 1px rgba). No licence found; output is trivial CSS. Rules: wrap in @supports (backdrop-filter) with an opaque fallback; turn glass off in sun theme, large-text mode, prefers-reduced-transparency and forced-colors; keep tint alpha 0.75-0.85 and check 4.5:1 against the lightest and darkest content that can scroll behind. Risks: contrast cannot be guaranteed; backdrop-filter re-blurs every scroll frame (expensive on low-end Android). Use only on small sticky chrome (Helm bar, sticky headers, bottom sheets); never behind body text.

## 3. css-loaders.com - ADOPT the technique
Temani Afif's 600+ single-div CSS loaders (gradients, masks, keyframes). Licence not found [check the footer before copying]. Pick by: one element; colours via currentColor or a variable (follows all modes); no url(data:) (would need img-src data:); reads as "working" at small size. A conic-gradient ring masked with radial-gradient and rotated covers most needs. Accessibility: role="status" aria-label="Loading" or visible text ("Loading jobs..."); under reduced motion slow it (animation-duration 2.5s) or swap for text, never freeze (a frozen spinner looks like a hang); stop the animation when done (display:none).

## 4. jsoncrack.com - SKIP
Open source (Apache-2.0, Aykut Sarac) JSON/YAML/XML/CSV graph viewer; README claims "All data processing is local; nothing is stored on our servers" (unverifiable against the deployed bundle). Self-host needs Docker/Node; npm package jsoncrack-react; VS Code extension. None fit "plain files copied to a folder". Never paste company JSON into a hosted tool. Build Helm's own: recursive <details><summary> tree, textContent only, colour-by-type with a text marker too (WCAG 1.4.1). Graph canvases are unusable at 375 px and opaque to screen readers.

## 5. undraw.co - ADOPT
Open-licence flat SVG illustrations (Katerina Limpitsouni). Licence (search snippet; read the full page before bulk use): "nonexclusive, worldwide copyright license to download, copy, modify, distribute, perform, and use the assets ... for free, including for commercial purposes, without permission from or attributing the creator"; not for compiling a competing service or distributing packs; a possible ML/AI-use restriction [unverified]. Self-host under /static/illus/ (or theme/illustrations/); inline <svg> for theming: replace the accent hex (#6c63ff default) with currentColor, and map the hard-coded greys (#3f3d56, #2f2e41, #e6e6e6) to --ink/--line so dark and sun modes work; CSS variables only work on inline SVG, not <img>. Files mostly use fill="" presentation attributes (not blocked by style-src); any style="" inside would be. Roughly 10-60 KB each [unverified]: limit to empty states and onboarding; decorative ones aria-hidden="true" or alt="".

## 6. devdocs.io - SKIP for Helm and its builders
freeCodeCamp's offline-capable API docs browser, MPL-2.0 (plus per-doc-set upstream licences, e.g. MDN CC-BY-SA [unverified]). Offline mode downloads into browser storage; self-host needs Docker or Ruby plus a multi-GB docs download: both break "install nothing, download nothing" for builder agents. Fine as a human bookmark. UI patterns worth copying for Helm's own docs pages: one search box filtering an in-page index as you type, keyboard shortcuts, system-following dark theme.

## The three requested effects (vanilla, CSP-safe; snippets at most 15 lines; see the plan's P-25 for the Helm-specific rules)

### (a) Headline lines rise one at a time, then an underline draws
```html
<h1 class="rise"><span class="ln"><span>Every job,</span></span><span class="ln"><span>one <em class="key">clear view</em></span></span></h1>
```
```css
.rise .ln{display:block;overflow:clip}
.rise .ln>span{display:block;animation:rise .6s cubic-bezier(.2,.7,.2,1) both}
.rise .ln:nth-child(2)>span{animation-delay:.12s}
.rise .ln:nth-child(3)>span{animation-delay:.24s}
@keyframes rise{from{translate:0 105%;opacity:0}}
.rise .key{font-style:normal;background:linear-gradient(var(--accent),var(--accent)) 0 100%/0% .1em no-repeat;box-decoration-break:clone;animation:draw .5s .55s ease-out forwards}
@keyframes draw{to{background-size:100% .1em}}
@media (prefers-reduced-motion:reduce){.rise *{animation:none!important}.rise .key{background-size:100% .1em}}
```
Split by line, never by letter (screen readers spell letter spans). Underline via background, not text-decoration, so it animates and survives wrapping. Check --accent contrast in the sun theme.

### (b) Cards stack on scroll (position: sticky)
```css
.stack{display:grid;gap:1.5rem;--top:4.5rem;--peek:.75rem}
.stack>.card{position:sticky;top:calc(var(--top) + var(--i,0) * var(--peek));background:var(--surface);border:1px solid var(--line);box-shadow:0 -6px 16px rgb(0 0 0/.12)}
.stack>.card:nth-child(2){--i:1} .stack>.card:nth-child(3){--i:2} .stack>.card:nth-child(4){--i:3}
@media (max-height:600px){.stack>.card{position:static}}
:root.large-text .stack>.card{position:static}
@supports (animation-timeline:view()){@media (prefers-reduced-motion:no-preference){.stack>.card{animation:sink linear both;animation-timeline:view();animation-range:exit 0% exit 100%}}}
@keyframes sink{to{scale:.95;filter:brightness(.92)}}
```
Sticky fails silently under any ancestor with overflow hidden/auto. Opaque cards only. A card taller than the viewport minus --top can never be fully read while stuck. Tab order = DOM order; add scroll-margin-top so a focused card is not hidden under the next.

### (c) Magnetic button that becomes a confirm
```js
const off=matchMedia('(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)'); let raf=0;
addEventListener('pointermove',e=>{ if(off.matches||e.pointerType!=='mouse'||raf)return;
  raf=requestAnimationFrame(()=>{ raf=0; for(const b of document.querySelectorAll('.magnet')){ const r=b.getBoundingClientRect();
    const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2), near=Math.hypot(dx,dy)<r.width;
    b.style.setProperty('--mx',near?dx*.25+'px':'0px'); b.style.setProperty('--my',near?dy*.25+'px':'0px'); }});},{passive:true});
document.addEventListener('click',e=>{ const b=e.target.closest('.magnet'); if(!b||b.dataset.state==='confirm')return;
  e.preventDefault(); b.dataset.state='confirm'; b.querySelector('.lbl').textContent='Confirm delete?';
  document.getElementById('live').textContent='Press again to confirm';},true);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ const b=document.querySelector('.magnet[data-state=confirm]'); if(b){b.dataset.state='';b.querySelector('.lbl').textContent=b.dataset.label;} }});
```
```css
.magnet{translate:var(--mx,0) var(--my,0);transition:translate .2s ease-out,background-color .15s;min-block-size:44px}
.magnet[data-state=confirm]{background:var(--danger);color:var(--on-danger)}
@media (prefers-reduced-motion:reduce){.magnet{translate:none;transition:none}}
```
Keyboard: pull is mouse-only; Enter/Space do the same two-step; Escape cancels; announce via an aria-live region. Touch: hover:none / pointer:coarse disable the magnet; two-tap confirm still works; 44 px targets. No auto-revert timer (WCAG 2.2.1); revert on Escape, blur or click elsewhere. Show the confirm state with text or icon, not colour alone (1.4.1). Keep the pull at 25% so the button never escapes the cursor (2.3.3). style.setProperty goes through the CSSOM and is allowed under strict style-src; only style="" markup is blocked.
