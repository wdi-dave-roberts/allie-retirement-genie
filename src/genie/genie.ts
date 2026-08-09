/**
 * The Genie — inline SVG, one function, three poses. Colors come from the
 * design tokens so the Genie always matches the night-sky look.
 */

export type GeniePose = "idle" | "point" | "celebrate";

const BODY = `
  <defs>
    <linearGradient id="genie-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--lamp-gold-soft)" />
      <stop offset="1" stop-color="var(--lamp-gold)" />
    </linearGradient>
  </defs>
  <!-- wisp tail rising from the lamp -->
  <path d="M60 96 C 52 88, 68 82, 60 72" stroke="var(--lamp-gold)" stroke-width="4"
    fill="none" stroke-linecap="round" opacity="0.7" />
  <!-- lamp -->
  <path d="M38 104 q 22 12 44 0 q -6 10 -22 10 q -16 0 -22 -10 Z" fill="var(--lamp-gold)" />
  <ellipse cx="60" cy="103" rx="24" ry="5" fill="var(--lamp-gold-soft)" />
  <!-- torso -->
  <path d="M60 72 C 44 66, 42 44, 60 40 C 78 44, 76 66, 60 72 Z" fill="url(#genie-body)" />
  <!-- head -->
  <circle cx="60" cy="28" r="14" fill="var(--lamp-gold-soft)" />
  <!-- topknot -->
  <path d="M60 14 q 2 -8 8 -10 q -2 8 -8 10" fill="var(--lamp-gold)" />
`;

const FACES: Record<GeniePose, string> = {
  idle: `
    <circle cx="55" cy="26" r="1.8" fill="var(--night-900)" />
    <circle cx="65" cy="26" r="1.8" fill="var(--night-900)" />
    <path d="M55 33 q 5 4 10 0" stroke="var(--night-900)" stroke-width="1.8"
      fill="none" stroke-linecap="round" />
  `,
  point: `
    <circle cx="55" cy="26" r="1.8" fill="var(--night-900)" />
    <circle cx="65" cy="26" r="1.8" fill="var(--night-900)" />
    <path d="M55 33 q 5 3 10 1" stroke="var(--night-900)" stroke-width="1.8"
      fill="none" stroke-linecap="round" />
    <!-- pointing arm -->
    <path d="M74 50 Q 90 44, 98 34" stroke="var(--lamp-gold-soft)" stroke-width="6"
      fill="none" stroke-linecap="round" />
    <circle cx="99" cy="33" r="4" fill="var(--lamp-gold-soft)" />
  `,
  celebrate: `
    <path d="M52 26 q 3 -3 6 0" stroke="var(--night-900)" stroke-width="1.8"
      fill="none" stroke-linecap="round" />
    <path d="M62 26 q 3 -3 6 0" stroke="var(--night-900)" stroke-width="1.8"
      fill="none" stroke-linecap="round" />
    <path d="M54 32 q 6 6 12 0" stroke="var(--night-900)" stroke-width="1.8"
      fill="none" stroke-linecap="round" />
    <!-- both arms up -->
    <path d="M46 50 Q 34 40, 32 28" stroke="var(--lamp-gold-soft)" stroke-width="6"
      fill="none" stroke-linecap="round" />
    <path d="M74 50 Q 86 40, 88 28" stroke="var(--lamp-gold-soft)" stroke-width="6"
      fill="none" stroke-linecap="round" />
    <!-- sparkles -->
    <path d="M30 18 l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 Z" fill="var(--star)" />
    <path d="M92 16 l 1.5 3 l 3 1.5 l -3 1.5 l -1.5 3 l -1.5 -3 l -3 -1.5 l 3 -1.5 Z" fill="var(--star)" />
  `,
};

export function genieSVG(pose: GeniePose = "idle"): string {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="The Genie">${BODY}${FACES[pose]}</svg>`;
}
