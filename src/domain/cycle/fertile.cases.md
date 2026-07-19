# predictFertileWindow — test cases

Rule-based fertile window used by the home screen WeekStrip.
Ovulation is anchored to `nextPeriodDate - 14` (luteal length is the stable one).
Window = `[ovulation - 5, ovulation + 1]` (7 inclusive days = sperm survival + ovulation day + 1-day buffer).

| # | nextPeriodDate | confidence in | expected                                                              | why |
|---|----------------|---------------|-----------------------------------------------------------------------|-----|
| 1 | `null`         | `medium`      | `null`                                                                | no anchor to compute from |
| 2 | `2026-08-15`   | `unknown`     | `null`                                                                | prediction not trustworthy → don't show fertile |
| 3 | `2026-08-15`   | `medium`      | `{ start: '2026-07-27', end: '2026-08-02', confidence: 'medium' }`   | ovulation 08-01, -5/+1 |
| 4 | `2026-08-15`   | `high`        | `.confidence === 'high'`                                              | passthrough |
| 5 | `2026-08-15`   | `low`         | `.confidence === 'low'`                                               | passthrough |
| 6 | `2026-08-15`   | `medium`      | span = 7 days                                                         | window shape invariant |
