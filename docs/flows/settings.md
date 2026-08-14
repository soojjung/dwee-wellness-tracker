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

## Sub-page stub routes

These routes exist under `(app)/settings/` and render `SubPagePlaceholder` until the next design batch:

| Route | Figma | Status |
|---|---|---|
| `/settings/language` | 015_15 | stub |
| `/settings/notices` | 015_4 | stub |
| `/settings/qna` | 015_5 | stub |
| `/settings/terms` | 015_16 | stub |
| `/settings/privacy` | 015_17 | stub |

All show a back link and the `myPage.subPage.comingSoon` copy.

---

## i18n keys

All copy lives under `myPage.*` in `src/i18n/locales/{en,ko}.ts`. Nickname fallback logic (email local-part) is in `AuthCard.getNickname()` — not a shard i18n key.
