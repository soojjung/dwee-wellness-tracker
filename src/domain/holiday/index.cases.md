# index — Unit test cases

Last run: 2026-09-14 — 13/13 passed

| #   | 설명 (`it` title)                                                                       | 입력                                                               | 기대 결과                                             | 결과 |
| --- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------- | ---- |
| 1   | delegates to krHolidaysInYear for KR                                                    | `holidaysInYear('KR', 2026)`                                       | `=== krHolidaysInYear(2026)` (same contents)          | ✅   |
| 2   | delegates to usHolidaysInYear for US                                                    | `holidaysInYear('US', 2026)`                                       | `=== usHolidaysInYear(2026)` (same contents)          | ✅   |
| 3   | returns holidays across a year boundary, sorted by date then by the given country order | `holidaysInRange(['KR','US'], '2026-12-20', '2027-01-05')`         | `[KR 12-25, US 12-25, KR 01-01, US 01-01]`            | ✅   |
| 4   | orders same-date entries by the countries array order, US first when given first        | `holidaysInRange(['US','KR'], '2026-12-20', '2027-01-05')`         | countries in order `['US','KR','US','KR']`            | ✅   |
| 5   | returns an empty array when countries is empty                                          | `holidaysInRange([], '2026-01-01', '2026-01-02')`                  | `[]`                                                  | ✅   |
| 6   | returns an empty array when start is after end                                          | `holidaysInRange(['KR'], '2026-01-05', '2026-01-01')`              | `[]`                                                  | ✅   |
| 7   | groups multiple holidays that fall on the same date                                     | `holidaysByDate(['KR'], '2025-05-01', '2025-05-10')['2025-05-05']` | `[childrensDay, buddhasBirthday]` (both `2025-05-05`) | ✅   |
| 8   | keys a single holiday under its own date                                                | `holidaysByDate(['KR'], '2025-05-01', '2025-05-10')['2025-05-06']` | `[{ childrensDay, substitute: true }]`                | ✅   |
| 9   | resolves null setting with ko locale to KR                                              | `resolveHolidayCountries(null, 'ko')`                              | `['KR']`                                              | ✅   |
| 10  | resolves null setting with en locale to US                                              | `resolveHolidayCountries(null, 'en')`                              | `['US']`                                              | ✅   |
| 11  | resolves an undefined setting the same as null                                          | `resolveHolidayCountries(undefined, 'ko')`                         | `['KR']`                                              | ✅   |
| 12  | returns an explicit setting as-is regardless of locale                                  | `resolveHolidayCountries(['US'], 'ko')`                            | `['US']`                                              | ✅   |
| 13  | returns a copy of an explicit setting, not the same array reference                     | `resolveHolidayCountries(setting=['US'], 'ko')`                    | `result !== setting`, `result` equals `setting`       | ✅   |
