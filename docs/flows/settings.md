# MyPage (Settings) Flow

Route: `(app)/settings` — rendered by `MyPageScreen` via the thin `settings/page.tsx` wrapper.
Figma refs: 015_1 (signed-out), 015_2 (signed-in), 015_3 (account edit).

---

## Card composition

MyPage renders a fixed stack of cards, some conditionally visible:

| Card | Always visible | Condition |
|---|---|---|
| `AuthCard` | yes | signed-out → login CTA row; signed-in → dark profile card |
| `CycleSummaryCard` | yes | shows status chip when data sufficient; "not enough data" copy otherwise |
| `PreferencesCard` | yes | notification toggle + language row |
| `SupportCard` | yes | notices / Q&A / terms / privacy rows (stub routes) |
| `AccountManagementCard` | signed-in only | sign-out + account deletion rows |

---

## Auth-state variants

```mermaid
flowchart TD
    MP([MyPage\n/settings])
    AnonCard[AuthCard — signed-out\nloggedOutCta → /login]
    AuthCard[AuthCard — signed-in\nnickname + email → /settings/account]
    AccountMgmt[AccountManagementCard\nsign-out · delete account]

    MP -->|user is anonymous or null| AnonCard
    MP -->|user is authenticated| AuthCard
    MP -->|user is authenticated| AccountMgmt

    classDef ui fill:#FDE8EF,stroke:#E5A8BD,color:#5C3A4A;
    classDef card fill:#E8F0FD,stroke:#A8BDE5,color:#3A4A5C;
    class MP ui;
    class AnonCard,AuthCard,AccountMgmt card;
```

---

## Account edit screen (015_3)

Route: `(fullscreen)/settings/account` — rendered by `AccountEditScreen`.

Anonymous users are bounced back to `/settings` via a `useEffect` guard. Only non-anonymous authenticated users can reach the form.

```mermaid
flowchart TD
    Tap[Tap profile card\nAuthCard signed-in]
    Guard{user.is_anonymous?}
    Bounce[redirect → /settings]
    Form[AccountEditScreen\nemail read-only\nnickname editable]
    Save{nickname non-empty\nAND changed?}
    Update[supabase.auth.updateUser\ndata: nickname]
    Back[router.push /settings]

    Tap --> Guard
    Guard -->|yes| Bounce
    Guard -->|no| Form
    Form --> Save
    Save -->|no| Form
    Save -->|yes — tap ✓| Update
    Update -->|success| Back
    Update -->|error| Form

    classDef ui fill:#FDE8EF,stroke:#E5A8BD,color:#5C3A4A;
    classDef logic fill:#E8F0FD,stroke:#A8BDE5,color:#3A4A5C;
    classDef storage fill:#F0E8FD,stroke:#BDA8E5,color:#4A3A5C;
    class Tap,Form,Bounce,Back ui;
    class Guard,Save logic;
    class Update storage;
```

The auth store's `onAuthStateChange` listener refreshes `user_metadata` automatically after a successful update — no manual store mutation needed.

---

## Sign-out flow

Tapping "로그아웃" in `AccountManagementCard` opens `LogoutConfirmDialog` (replaces the old `window.confirm`). On confirm:

1. `queueAppToast('myPage.signOutToast')` — queues a cross-route confirmation message.
2. `router.push('/login')` — navigates immediately (no blank-screen wait).
3. `void signOut()` — fires in the background; wipes local cache and resets the auth store.

`HomeScreen` and `LoginScreen` each call `consumeAppToast()` on mount and render a **top-confirm** Toast (dark rounded card, check icon, `animate-slideDownFade`) if a message is queued. This pattern is reusable for any future cross-route confirmation.

```mermaid
flowchart TD
    Tap[Tap 로그아웃]
    Dialog[LogoutConfirmDialog\n핑크 배지 + 취소·로그아웃]
    Cancel[dismiss]
    Queue[queueAppToast]
    Nav[router.push /login]
    SignOut[signOut — background]
    Toast([top-confirm Toast\non LoginScreen mount])

    Tap --> Dialog
    Dialog -->|취소| Cancel
    Dialog -->|로그아웃| Queue
    Queue --> Nav
    Nav --> SignOut
    Nav --> Toast

    classDef ui fill:#FDE8EF,stroke:#E5A8BD,color:#5C3A4A;
    classDef logic fill:#E8F0FD,stroke:#A8BDE5,color:#3A4A5C;
    class Tap,Dialog,Cancel,Toast ui;
    class Queue,Nav,SignOut logic;
```

---

## Language settings screen (015_7)

Route: `(app)/settings/language` — rendered by `LanguageSettingsScreen`.

Two radio-style rows (English / 한국어). Tapping a row immediately calls `settings.setLocale(locale)` — no save button. The store persists the selection and the app re-renders in the chosen language on next `useT()` evaluation.

---

## Sub-page routes

| Route | Figma | Status |
|---|---|---|
| `/settings/language` | 015_15 | live — `LanguageSettingsScreen` |
| `/settings/notices` | 015_4 | stub |
| `/settings/qna` | 015_5 | stub |
| `/settings/terms` | 015_16 | stub |
| `/settings/privacy` | 015_17 | stub |

Stub routes render `SubPagePlaceholder` with a back link and `myPage.subPage.comingSoon` copy.

---

## i18n keys

All copy lives under `myPage.*` in `src/i18n/locales/{en,ko}.ts`. New keys from this batch:

- `myPage.signOutDialog.*` — logout confirm dialog title, body, confirm button
- `myPage.signOutToast` — post-logout confirmation message shown on `/login`
- `myPage.language.*` — language settings screen title and locale labels

Nickname fallback logic (email local-part) is in `AuthCard.getNickname()` — not an i18n key.
