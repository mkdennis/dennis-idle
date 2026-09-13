import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { TabBar } from "@/components/tab-bar";
import { TreasureChest } from "@/components/art";
import { RewardCard } from "@/components/reward-card";
import { RewardForm } from "@/components/reward-form";
import { loadGameState } from "@/lib/services/game-state";
import { currentDayKey } from "@/lib/services/missions";
import { CONDITIONS, loadRewards } from "@/lib/services/rewards";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const dayKey = await currentDayKey();
  const [state, rewards, areas] = await Promise.all([
    loadGameState(dayKey),
    loadRewards(dayKey),
    db.query.areas.findMany({ where: eq(schema.areas.enabled, true), orderBy: (a, { asc }) => asc(a.sortOrder) }),
  ]);
  const areaName = new Map(areas.map((a) => [a.id, a.name]));
  const unlocked = rewards.filter((r) => r.progress.unlocked && !r.claimedAt).length;

  return (
    <main className="pb-28">
      <div className="panel mx-3.5 mt-3.5">
        <div className="relative flex items-center overflow-hidden px-4 pt-3 pb-4" style={{ background: "linear-gradient(180deg, #5b3a8f 0%, #2b1a33 100%)" }}>
          <div className="relative flex grow flex-col gap-1.5">
            <div className="text-[26px] font-black leading-none text-white" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.25)" }}>Rewards</div>
            <div className="text-[11px] font-bold text-[#e9d5ff]">Set a treat behind a milestone. Hit it, claim it, enjoy it.</div>
            <div className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[11px] font-extrabold text-[#ffd27a]">
              {unlocked} ready to claim · {rewards.filter((r) => r.claimedAt).length} enjoyed
            </div>
          </div>
          <div className="relative -mr-1 shrink-0"><TreasureChest size={104} open={unlocked > 0} /></div>
        </div>
        <div className="panel-body gap-2 p-2.5">
          {rewards.map((r) => <RewardCard key={r.id} r={r} areaName={r.param ? areaName.get(r.param) : undefined} />)}
          {rewards.length === 0 && <div className="px-2 py-3 text-center text-xs font-bold text-ink-2">No rewards yet. Add one and pick what unlocks it.</div>}
          <RewardForm conditions={CONDITIONS.map((c) => ({ id: c.id, label: c.label, unit: c.unit, needsArea: c.needsArea }))} areas={areas.map((a) => ({ id: a.id, name: a.name }))} />
        </div>
      </div>
      <TabBar active="/rewards" exp={state.character} />
    </main>
  );
}
