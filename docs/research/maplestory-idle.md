# MapleStory: Idle RPG — Progression & Daily-Loop Research

Research compiled 2026-09-13 to inform the PRD. Facts marked **[verified]** come from Nexon's official pages/forum, the community wiki, or first-hand reviews. **[inferred]** = reasonable reconstruction where no source states it outright. **[genre]** = conventions from other idle RPGs. Reddit r/MapleStoryIdle was unreachable on every route tried, so community sentiment comes from App Store reviews and two long-form reviews.

Game basics [verified]: Nexon Korea + Able Games, global launch Nov 5–6 2025, iOS/Android plus a PC client since July 2026; 1M+ Google Play installs, 4.7★ on iOS. Sources: [Nexon launch PR](https://www.gamespress.com/MAPLESTORY-IDLE-RPG-LAUNCHES-NOVEMBER-5-ON-MOBILE-PLATFORMS), [App Store](https://apps.apple.com/us/app/maplestory-idle-rpg/id6739616715), [Google Play](https://play.google.com/store/apps/details?id=com.nexon.ma).

---

## 1. Daily loop

**Reset cadence [verified — official FAQ].** Daily reset 00:00 server time; weekly reset Monday 00:00; monthly reset 1st at 00:00. What resets: purchase limits, daily attendance (login bonus), daily/weekly missions, dungeon entry tickets. In-progress missions are wiped at reset ("complete them before reset to receive rewards"). [Nexon FAQ](https://forum.nexon.com/maplestoryidle/board_view?board=6679&thread=3209008)

**The Daily Mission panel [verified + inferred].**
- The panel is a list of missions plus a *final* "Daily Mission Clear" reward that unlocks once you've cleared **8 or more** of them. The Monthly Attendance rules read: "Complete 'Daily Mission Clear 0/8' every day to check in (Clear 8 or more Daily Missions). After completing all Daily Missions, tap the Claim button." [Monthly Attendance notice](https://forum.nexon.com/maplestoryidle/board_view?thread=3513844). The UI shows a counter ("0/8") that fills as missions complete; the capstone reward is a separate tap.
- The capstone reward is large. The Sept 2026 "Daily Mission Boost" event says "the final Daily Mission reward is increased by 100%... +100 Weapon Summoning Tickets, +5,000 Red Diamonds", and adds cumulative rewards at 10/30/50/70 total daily-mission clears. [Boost notice](https://forum.nexon.com/maplestoryidle/board_view?board=6676&thread=3537092). Guides call daily missions "your main source of Red Diamonds" ([MuMu guide](https://www.mumuplayer.com/blog/maplestory-idle-rpg-beginner-guide.html)).
- Task types **[inferred from event daily missions and Guide Quest cycles]**: "Defeat 2,000 monsters", "Summon Elite Monsters 10 times", "Summon Companions 10 times", "Clear Growth Dungeon: X 1 time", enter Arena, fight World Boss, play a Party Quest. ([Pink Bean Daily Mission](https://forum.nexon.com/maplestoryidle/board_view?board=6676&thread=3537082), [wiki: Guide Quest](https://idle.maplestorywiki.net/w/Guide_Quest)). Most are things the game does for you anyway if you log in and tap a few buttons.
- Rewards are claimed by **tapping the reward itself**.

**Other daily-capped resources [verified].** 3 free keys per Growth Dungeon per day, 5 dungeons; Arena: 5 tickets recharge at midnight, cap 20; Quick Hunt: 3/day; a daily "Battle Pass" whose progress resets every day; Daily Ad Booster (20 min); guild help 10×/day. ([wiki: Growth Dungeon](https://idle.maplestorywiki.net/w/Growth_Dungeon), [wiki: Arena](https://idle.maplestorywiki.net/w/Arena), [wiki: Quick Hunt](https://idle.maplestorywiki.net/w/Quick_Hunt), [wiki: Pass](https://idle.maplestorywiki.net/w/Pass))

**Weekly layer [verified].** Weekly Red Diamond shop; Boss Raid entries 2 per boss/week; 5 free Journey Chest keys every Monday; Arena/World Boss weekly settlement Monday; event weekly missions with cumulative rewards. A reviewer: "After a certain point you are waiting on weekly resets to get resources to increase combat power."

**Attendance / check-in calendars [verified].**
- *Monthly Attendance*: **the day's attendance is triggered by claiming the final Daily Mission Clear reward**, then you tap Claim in Event → Monthly Attendance. 28 rewards on *cumulative* days, not calendar dates; Day 28 = Legendary Artifact Summon; missed days recoverable ("Recover Attendance") for 3,000 Blue Diamonds each; unclaimed rewards forfeited at monthly reset; panel disappears once Day 28 is claimed. ([notice](https://forum.nexon.com/maplestoryidle/board_view?thread=3513844), [calendar rendering](https://maplestoryidle.info/guides/monthly-attendance-rewards/))
- *N-Day Attendance boards*: "Log in every day and tap the reward directly to collect it... Each player can participate for up to 20 days from their individual start date" — a 15-day streak with a 5-day grace window. Reward values escalate (Day 1–5 x3 → Day 11–15 x5). ([Growth Dungeon 15-Day](https://forum.nexon.com/maplestoryidle/board_view?board=6676&thread=3521883))
- *Stamp / step-up variants*: daily missions yield stamp tickets → "Stamp" or "Stamp All" draws from a finite pool; cumulative milestones (2/6/10/18/30 stamps). ([Cygnus Stamp](https://forum.nexon.com/maplestoryidle/board_view?board=6676&thread=3521885))
- Patch notes confirm UX details: red dot on Monthly Attendance, an "attendance mission shortcut button", a claim animation, a make-up popup that checks currency balance. ([Aug 13 patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3522342), [Sept 3 patch](https://forum.nexon.com/maplestoryidle/board_view?board=6675&thread=3537355))

---

## 2. Leveling & CP

**Character level [verified].** EXP is "the green bar at the bottom of the screen"; at 100% you level and restart from 0%; cap Lv 140. 3 skill points per level. Level mostly *unlocks* rather than empowers: "Character level increases through combat experience and primarily unlocks new systems rather than providing large direct power increases" ([BlueStacks guide](https://www.bluestacks.com/blog/game-guides/maplestory-idle-rpg/mpsir-beginners-guide-en.html)). Level gates include job advancements (Lv 30/60/100), extra daily boosters at Lv 60/80/100. Late levels are slow: single levels around 95–100 "can require two weeks" ([supersven review](https://reviewsbysupersven.com/maple-idle/)).

**Combat Power [verified — official formula].** `CP = (Attack×3 + MaxHP×0.05 + Defense×0.2) × Π(1 + weighted stat terms)` over ~25 multiplicative terms, with the caveat "CP is an indicator that can be used as a reference when comparing growth progress." ([Nexon guide](https://maplestoryidle.nexon.com/en/guide)) Ranking uses your *highest-ever* CP, not current.

**How CP is used as a gate/lens [verified].**
- Each chapter is 10 stages; XX-1…XX-9 are "Stage Breakthrough" challenges, XX-10 is a boss. "The presence of a Challenge indicator on stages signals moments where additional upgrades are expected before proceeding." Community charts give reference CP per boss but warn "CP can lie" ([stage guide](https://maplestoryidle.info/guides/stage-boss-push/)).
- Diagnostic use: "look at recent CP changes and identify which upgrade caused the biggest increase… When CP increases slowly or stalls, it usually indicates a supporting system has been left behind" ([BlueStacks tips](https://www.bluestacks.com/blog/game-guides/maplestory-idle-rpg/mpsir-tips-tricks-en.html)). **[inferred]** Upgrade screens show a CP delta on each purchase.

**"What to do today to level":** The game doesn't compute a plan; it hands you a linear **Guide Quest** ("the main form of character progression") shown top-left, cycling through breakthrough/defeat/summon/dungeon/arena tasks, plus a **Growth Guide** panel with nudges ("will notify you when you have at least 3 Quick Hunt Tickets").

---

## 3. Growth systems (parallel tracks)

~15 tracks drip-fed over weeks in Guide Quest order: Skills, Weapons, Skill Enhancement, Skill Mastery (timed research), Growth Dungeons, Quick Hunt, Hero Power, Companions, Equipment/Star Force, Guild, Arena, Artifacts, Maple Rank, Hero's Journey, Medals, Costumes. Matches the genre pattern of "progression verticals unlocked slowly over the first 14 real days" ([DoF on Legend of Mushroom](https://www.deconstructoroffun.com/blog/2024/4/15/the-magic-of-legend-of-mushroom)).

Design details [verified]:
- **Inventory effects**: every weapon/companion/medal contributes stats *whether or not equipped*, so nothing collected is wasted; "bulk awaken" buttons exist.
- **Slot-based enhancement persists** across gear swaps.
- **Pity/"Enhancement Points"**: failed attempts fill a per-slot gauge that guarantees success when full; "remaining count until guaranteed" shown.
- **Surfacing what to do next**: Guide Quest (top-left), Special Requests (timed side quests via light-bulb icon), Growth Guide, Hot Deal popups on milestones, Challenge indicator on stages, and context-aware red dots. Nexon fixed cases where a dot showed "when there were no rewards to claim."

---

## 4. Idle / offline mechanic

[verified] "While offline, auto-hunting continues and rewards accumulate for up to 8 hours." Claim flow: popup on login; else Mailbox → Offline Reward; expires in 24h. Minimum 5 minutes to qualify. A **sleep-mode screen** shows local time and a character hitting a slime. An **Auto Hunt Status** popup lists currencies gained while AFK with a "Reset List" button. **Quick Hunt** instantly grants N monsters' worth of rewards. Feel: "claim your idle rewards every day before they hit a cap… schedule logins at least twice a day."

---

## 5. UI/UX

Layout [verified]: top-left currency icon → Currency Info popup; Guide Quest/missions top-left; left edge light-bulb for Special Requests; top-right Event icon; bottom-left Elite Summon, Booster menu, Auto Hunt Status chest; bottom-right Characters and Menu; bottom green EXP bar; center side-scrolling auto-battle. Currencies: Meso, Red Diamonds (earned), Blue Diamonds (paid), plus coins and many tickets — "like 10 different types of currencies." Feedback: tap-to-claim, claim animations, red dots with per-context rules, bulk buttons ("Stamp All", "Quick Clear All"). No source documents a dedicated level-up celebration screen or a streak counter beyond attendance boards.

---

## 6. Why it's sticky (and where it breaks)

- "Early progression is fast enough to feel satisfying… log in, claim rewards, upgrade something, push further, feel like they made progress"; "strangely addictive" ([minireview](https://minireview.io/incremental/maplestory-idle-rpg)). "I logged in at least once daily to make sure I did all of the daily tasks."
- Double-edged: "Once you figure out the few things to do as daily activities there is nothing else to do… Maybe 3 minutes of gameplay"; "Stockholm syndrome with EXP bars."
- Nexon manages *fatigue* deliberately: resisted per-boss tickets because "each new boss update would continuously add to the weekly to-do list… rapidly increasing fatigue"; rejected designs that create "'pausing even briefly means losing out'… fatigue." ([Replies from the Devs](https://maplestoryidle.nexon.com/en/qna))
- Genre [genre]: AFK Journey's daily tasks + idle accrual "give them a reason to regularly check back" ([Naavik](https://naavik.co/digest/lessons-learned-from-afk-journey/)). Legend of Mushroom's comeback incentive works because dailies take "about the same amount of time each day" ([DoF](https://www.deconstructoroffun.com/blog/2024/4/15/the-magic-of-legend-of-mushroom)).

---

## Design primitives worth borrowing for a productivity app

1. **"N/8 then Claim" daily capstone** — small rewards per task; ≥8 unlocks a separate, much larger tap-to-claim reward.
2. **Capstone doubles as the check-in** — attendance is credited only by claiming the daily capstone.
3. **Cumulative-day calendars, not calendar-day streaks** — a missed day delays rather than breaks the chain; costly "Recover" for misses.
4. **Bounded boards with a grace window** — 15 rewards claimable within 20 days; board vanishes when complete.
5. **Escalating tiles with milestone highlights** — show the whole 28-tile grid so the payoff is always in view.
6. **Hard daily reset at a fixed hour** — a clear "close the day" moment; surface the countdown.
7. **Accrual while away, claimed on return** — an "offline reward" popup on open.
8. **Auto Hunt Status ledger** — "here's what accumulated since you last looked."
9. **A single composite score with a published formula** — show the delta on each action.
10. **Challenge indicators instead of hard locks** — mark goals whose required power you haven't met.
11. **Guide Quest: one next step, always** — a linear auto-advancing "do this next" line.
12. **Growth Guide with context-aware red dots** — nudge only when actionable.
13. **Inventory effects: nothing collected is wasted** — every unlocked asset gives passive credit.
14. **Pity gauges for hard goals** — failed attempts fill a bar that guarantees success when full.
15. **Stamp/step-up and cumulative-count rewards** — milestone ladders (2/6/10/18/30).
16. **Bulk actions** — never make the user tap the same thing repeatedly; ideal session is 3–5 minutes.
17. **Timed "Special Requests"** — optional side goals with a countdown.
18. **Weekly shop / weekly-reset scarce rewards** — a slower cadence so the week has its own ritual.
