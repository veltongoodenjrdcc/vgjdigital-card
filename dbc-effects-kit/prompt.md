# Prompt — Apply VGJ Digital Hero Effects to a Digital Business Card Page

Use this prompt verbatim (or adapt it) when working with Claude Code or any AI assistant to add these two effects to a Digital Business Card (DBC) page.

---

## The prompt

> I have a Digital Business Card HTML page and I want to add two visual effects from my main website:
>
> **Effect 1 — Animated cursor icon (`click-mark`)**
> A CSS-only animated mouse-cursor shape that does a subtle click loop. No JS needed.
> Add this CSS:
>
> ```css
> .click-mark {
>   position: relative;
>   display: inline-grid;
>   width: 0.88em;
>   height: 1.08em;
>   flex: 0 0 auto;
>   place-items: center;
>   transform-origin: 65% 72%;
>   will-change: transform;
> }
> .click-mark::before {
>   width: 0.82em;
>   height: 1em;
>   background: currentColor;
>   clip-path: polygon(0 0, 0 88%, 28% 65%, 42% 100%, 58% 93%, 44% 60%, 78% 60%);
>   content: "";
> }
> @media (prefers-reduced-motion: no-preference) {
>   .click-mark {
>     animation: cursorClickLoop 3s cubic-bezier(0.35, 0, 0.18, 1) infinite;
>   }
>   @keyframes cursorClickLoop {
>     0%, 46%, 100% { transform: translate3d(1.5px, 1.8px, 0) scale(1); }
>     64%, 72%       { transform: translate3d(0, -1.4px, 0) scale(1); }
>     78%            { transform: translate3d(0, -1.4px, 0) scale(0.92); }
>     86%            { transform: translate3d(0, -1.4px, 0) scale(1); }
>   }
> }
> ```
>
> Add this HTML where you want the cursor icon to appear (typically before a tagline):
> ```html
> <span class="click-mark" aria-hidden="true"></span>
> ```
>
> The cursor color inherits from `currentColor`. To change the color, set `color` on the `.click-mark` element or its parent.
>
> ---
>
> **Effect 2 — Gradient clip text (`.gradient-text`)**
> A vertical gradient applied to text using `background-clip: text`. Works on any inline text element.
> Add this CSS:
>
> ```css
> .gradient-text {
>   background: linear-gradient(180deg, #1aa7ec 0%, #19a0da 48%, #188eaf 100%);
>   background-clip: text;
>   -webkit-background-clip: text;
>   color: transparent;
> }
> ```
>
> Wrap any text you want gradient-colored:
> ```html
> <span class="gradient-text">Your tagline here.</span>
> ```
>
> ---
>
> **Combined tagline row**
> To place the cursor icon and gradient text side by side (as they appear in the VGJ Digital nav bar):
>
> ```css
> .tagline-row {
>   display: inline-flex;
>   align-items: center;
>   gap: 0.42rem;
>   font-weight: 850;
>   line-height: 1.15;
>   white-space: nowrap;
> }
> ```
>
> ```html
> <span class="tagline-row">
>   <span class="click-mark" aria-hidden="true"></span>
>   <span class="gradient-text">Your tagline here.</span>
> </span>
> ```
>
> Please add these effects to my DBC page. Insert the CSS into the existing `<style>` block (or a linked stylesheet). Place the HTML in the hero/header section of the card, near the name or tagline. Do not change any other layout or styles.

---

## Customisation notes

| What to change | How |
|---|---|
| Cursor colour | Set `color: #yourColor` on `.click-mark` |
| Gradient colours | Edit the three `#hex` values in `.gradient-text` |
| Gradient direction | Change `180deg` (top-to-bottom) to `90deg` (left-to-right) etc. |
| Animation speed | Change `3s` on `.click-mark` — lower = faster |
| Text size | Set `font-size` on `.tagline-row` |

## Files in this kit

- `snippets.css` — standalone CSS file with all three classes, ready to paste
- `demo.html` — open in a browser to preview both effects live
- `prompt.md` — this file; the copy-paste prompt for Claude
