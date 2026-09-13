# Nightly nutrition sync from MacroFactor via Apple Health

MacroFactor has no public API, but it writes your daily calories, protein, carbs, fat, and weight to Apple Health. An iOS Shortcut can read those and post them to Life OS every night. After the one-time setup, logging food in MacroFactor is the only thing you do.

## 1. MacroFactor → Apple Health

In MacroFactor: **More → Integrations → Apple Health**. Turn on writing for Nutrition (calories and macros) and Weight. Confirm in the Health app that "Dietary Energy" and "Protein" show MacroFactor as a source.

## 2. Build the Shortcut (once)

Open **Shortcuts → + → name it "Life OS nutrition"**, then add these actions in order:

1. **Find Health Samples** — type *Dietary Energy*, where *Start Date is today*. Set **Sort by** none, **Limit** off.
2. **Calculate Statistics** — *Sum* of the samples from step 1. Rename the result variable to `calories` (tap the variable, rename).
3. Repeat steps 1–2 for **Protein** → `protein`, **Carbohydrates** → `carbs`, **Total Fat** → `fat`.
4. **Find Health Samples** — type *Weight*, *Start Date is today*, Limit 1, sorted by latest. **Get Numeric Value** → `weight_lb` (if your Health unit is lb) or `weight_kg`. If there is no sample, the value is empty, which is fine.
5. **Get Contents of URL**
   - URL: `https://dennis-idle.vercel.app/api/ingest/health`
   - Method: **POST**
   - Headers: `Authorization` = `Bearer <INGEST_TOKEN>` (the token from your Vercel env)
   - Request Body: **JSON** with keys `calories`, `protein`, `carbs`, `fat`, `weight_lb` mapped to the variables above.
6. Optional: **Show Notification** with the response so you can see "foodLogged: true".

Run it once by hand to check it works. The app's Diet tab will show today's numbers marked "from Apple Health", and the daily "Log food" mission completes itself.

## 3. Automate it

**Shortcuts → Automation → + → Time of Day → 11:30 PM, Daily → Run Immediately** (turn off "Ask Before Running") → pick the "Life OS nutrition" shortcut.

Because Life OS counts a day until 4:00 AM, an 11:30 PM run lands on the right day. If you eat after 11:30, run the shortcut again by hand or add a second automation at 3:30 AM.

## Manual fallback

The Diet tab still has the form. A manual entry for a day is never overwritten by the Shortcut unless the Shortcut sends calories greater than zero.

## Weekly export instead?

MacroFactor can also export a CSV (More → Data → Export). That works but means a weekly chore; the Shortcut path is zero-touch.
