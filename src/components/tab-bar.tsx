import Link from "next/link";
import { Bag, Calendar, Flag, Home, Person } from "./icons";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/goals", label: "Goals", Icon: Flag, disabled: true },
  { href: "/week", label: "Week", Icon: Calendar },
  { href: "/shop", label: "Shop", Icon: Bag, disabled: true },
  { href: "/me", label: "Me", Icon: Person },
];

export function TabBar({ active, exp }: { active: string; exp: { fraction: number; into: number; span: number } }) {
  const pct = Math.round(exp.fraction * 100);
  return (
    <div className="fixed inset-x-0 bottom-0 z-20">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="relative flex h-[18px] items-center bg-chrome-4">
          <div className="absolute bottom-0 left-0 h-1 bg-lime" style={{ width: `${pct}%` }} />
          <div className="relative pl-2.5 font-mono text-[10px] font-extrabold text-lime">EXP {pct}%</div>
          <div className="absolute right-2.5 font-mono text-[10px] font-extrabold text-muted">
            {exp.into.toLocaleString()} / {exp.span.toLocaleString()}
          </div>
        </div>
        <nav className="grid h-[66px] grid-cols-5 items-start bg-chrome-3 pt-2 pb-[env(safe-area-inset-bottom)]">
          {TABS.map(({ href, label, Icon, disabled }) => {
            const isActive = active === href;
            const cls = `flex flex-col items-center gap-[3px] text-[10px] font-extrabold ${isActive ? "text-white" : disabled ? "text-[#4a4b52]" : "text-[#8a8b90]"}`;
            const inner = (
              <>
                <Icon />
                <span>{label}</span>
                {isActive && <div className="mt-0.5 h-[3px] w-7 rounded-full bg-cyan" />}
              </>
            );
            return disabled ? (
              <div key={href} className={cls} aria-disabled>{inner}</div>
            ) : (
              <Link key={href} href={href} className={cls}>{inner}</Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
