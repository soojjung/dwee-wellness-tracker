# App Store metadata (en-US) — 2026-09-14 draft

> English counterpart of `app-store-metadata.ko.md`. en-US is the primary market, so this is the copy to submit first; the Korean file is the source it was adapted from, not a literal translation target. Re-check the length limits before submitting (name 30 · subtitle 30 · keywords 100 · promotional text 170 · description 4,000).

## 👩🏻‍💻 App Store metadata

#### 0. Preview screenshots & icon

- Source bundle from the designer (2026-09-22). The 7 previews live in `public/preview/app-preview-{1..7}.jpg`, the favicon in `public/favicon.png`.
- iPhone set: 7 × **1290 × 2796 (6.7″)**. iPad set: `public/preview/ipad/app-preview-ipad-{1..7}.jpg` (**2048 × 2732**, generated 2026-09-22 — iPhone art at full height, sides extended with the original background color). App icon: `public/app-icon-1024.png` (same wordmark/background as the favicon, rendered at 1024, no alpha).

| Target | Required? | Size (px, portrait) | Status |
|---|---|---|---|
| iPhone 6.9″ / 6.7″ | one of the two (smaller iPhones are scaled down) | 1320 × 2868 or 1290 × 2796 | 7 × 1290 × 2796 ✓ |
| iPhone 6.5″ | optional | 1284 × 2778 or 1242 × 2688 | none (covered by 6.7″) |
| iPad 13″ / 12.9″ | required when iPad is supported | 2064 × 2752 or 2048 × 2732 | 7 × 2048 × 2732 ✓ (`preview/ipad/`) |
| App icon | required | 1024 × 1024, no alpha, square corners | `public/app-icon-1024.png` ✓ (favicon artwork) |

- 1–10 images per target, JPG or PNG, no alpha. Re-check the current table in App Store Connect before submitting (Apple changes the reference devices yearly).

#### 1. App name (30 characters max)

- dwee

#### 2. Subtitle (30 characters max)

- Period, mood & diary in one

#### 3. Category

- Primary: Lifestyle
- Secondary: Health & Fitness

#### 4. Description

The gentlest way to keep track of you — dwee

Your period isn't a one-off event.
It's part of a rhythm that runs through every day.

So don't stop at logging your period.
Note how you feel, what your body's telling you, and how your appetite shifts,
and start to see how your body and mood change over time.

Small notes add up.
Over time, you'll spot patterns you never knew you had.

dwee shares women's health information in plain, comfortable language,
and uses what you've logged to surface what's relevant to you right now.

Before managing yourself, get to know yourself.

From your period to your everyday, start a wellness habit built on small daily notes — with dwee.

🌷 Your cycle at a glance

Log when your period starts and ends, and see your cycle and its rhythm on the calendar.

As your history builds, it becomes easier to look back on your cycle, notice how your body shifts, and make sense of how you feel today.

🫧 Quick daily check-ins

Jot down your mood, symptoms, appetite, and more in a few taps.

No pressure to be thorough every day — a light note about today is enough.

🔎 Discover your own patterns

Keep your cycle and your everyday notes side by side.

Over time, you can look back on the changes that tend to repeat and understand how your mood and energy move with your cycle.

🌿 Content that helps you know your body

From useful reads on your cycle and women's health to tests like the body-type reading that show what makes you you — explore content that helps you understand yourself more deeply.

✨ The care you need right now

See at a glance how your body shifts with your cycle and how you're feeling, and get suggestions that fit this phase — food, movement, rest — as everyday routines you can actually keep.

🎀 A diary that looks like you

Capture today's mood, how you're feeling, and the moments worth keeping, in your own style.

Decorate with photos from your library or with the images and stickers dwee provides — it's entirely up to you.

No streaks to maintain. Just leave today's you somewhere calm and pretty.

💗 dwee is for you if you…

- Want to track more than period dates — how your body and mind feel day to day
- Wonder how your mood and energy change across your cycle
- Want to record and understand the changes that keep coming back
- Prefer women's health information that's easy to follow
- Want to build healthy everyday habits that suit you
- Like your notes to look and feel like your own

Start getting to know yourself, with dwee.

※ Content and AI-generated analysis in dwee are for general wellness reference only and are not a substitute for medical diagnosis or treatment. If symptoms persist or feel severe, please consult a healthcare professional.

ℹ️ Permissions
dwee asks only for the permissions it needs to work smoothly.
Optional permissions can be declined — everything except the features that depend on them keeps working.

[Optional permissions]

1. Notifications: receive updates and reminders related to the service.

2. Camera: take photos for your diary, home screen decoration, and tests.

3. Photos: pick images for your diary, home screen decoration, and tests.

Questions or feedback? Reach us through Contact in the app or at sojjung3@gmail.com.

#### 5. Keywords (100 characters max, comma-separated, no spaces)

cycle,menstrual,tracker,calendar,mood,symptoms,wellness,women,health,journal,PMS,ovulation,selfcare

#### 6. Promotional text (170 characters max)

Don't stop at logging your period. 🌷
Keep your cycle, mood, symptoms, and everyday moments in one place — and start noticing the patterns that make you, you.

#### 7. Required URLs

- Privacy Policy URL: `https://dwee-neon.vercel.app/legal/privacy/?lang=en`
- Support URL: `https://dwee-neon.vercel.app/legal/support/?lang=en`
- Both are public pages in the `(legal)` route group (no session needed). Re-check after the Vercel deploy.
