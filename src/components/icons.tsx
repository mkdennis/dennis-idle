import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, p: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const Sword = ({ size = 12, ...p }: P) => (
  <svg {...base(size, p)}><path d="M14 4l6 6-9 9-6-6z" /><path d="M5 19l-2 2" /><path d="M9 13l2 2" /></svg>
);
export const Coin = ({ size = 12, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#f2c21b" stroke="#b58900" strokeWidth={1.5} {...p}><circle cx="12" cy="12" r="9" /></svg>
);
export const Clock = ({ size = 12, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const Check = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={3.2}><path d="M5 13l4 4L19 7" /></svg>
);
export const Chevrons = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={3}><path d="M6 6l6 6-6 6" /><path d="M13 6l6 6-6 6" /></svg>
);
export const Close = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={3}><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>
);
export const Home = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={2.2}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" /></svg>
);
export const Flag = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={2.2}><path d="M5 21V4h11l-2 4 2 4H5" /></svg>
);
export const Calendar = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={2.2}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></svg>
);
export const Bag = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={2.2}><path d="M6 8h12l1 13H5z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const Person = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={2.2}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const Refresh = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></svg>
);
export const Dumbbell = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={2.2}><path d="M6 8v8" /><path d="M18 8v8" /><path d="M3 10v4" /><path d="M21 10v4" /><path d="M6 12h12" /></svg>
);
export const Bowl = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)} strokeWidth={2.2}><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M8 11c0-3 2-5 4-6" /><path d="M14 11c0-2 1-4 3-5" /></svg>
);
