# `domain/notification/schedule` 테스트 케이스

Last run: 2026-09-22 (`pnpm test:unit`)

기준 데이터: 28일 주기 3회(마지막 시작 2026-06-01) → 다음 생리 예상 2026-06-29, 가임기 추정 06-10~06-16. 알림 시각 09:00, 지연 여유 2일.

| #   | 설명 (`it` title)                                                  | 입력                            | 기대 결과                                           | 결과 |
| --- | ------------------------------------------------------------------ | ------------------------------- | --------------------------------------------------- | ---- |
| 1   | returns nothing when the master toggle is off                      | `notificationsEnabled: false`   | `[]`                                                | ✅   |
| 2   | returns nothing without records (no prediction)                    | `periods: []`                   | `[]`                                                | ✅   |
| 3   | plans all three kinds from the prediction when everything is on    | 06-02, lead 5일                 | periodDue 06-24 · periodDelay 07-01 · fertile 06-10 | ✅   |
| 4   | uses the grace constant for the delay reminder                     | 06-02                           | 예상일 + `PERIOD_DELAY_GRACE_DAYS`                  | ✅   |
| 5   | respects each sub-toggle independently                             | delay·fertile off               | `['periodDue']`                                     | ✅   |
| 6   | lead time 0 fires on the expected day itself                       | lead 0                          | periodDue 06-29, `leadDays: 0`                      | ✅   |
| 7   | drops reminders whose day has already passed                       | now 06-26                       | periodDelay 만 남음                                 | ✅   |
| 8   | keeps a same-day reminder only before the firing hour              | now 06-24 08:00 vs 09:00        | 08:00 포함 / 09:00 제외                             | ✅   |
| 9   | schedules the fertile reminder even at low confidence (one record) | 기록 1건(06-01), 설정 주기 28일 | fertile 06-10 (unknown 일 때만 제외)                | ✅   |
| 10  | re-plans from the new prediction once the period is logged         | 06-29 기록 추가, now 06-30      | periodDue 07-22 · periodDelay 07-29                 | ✅   |
