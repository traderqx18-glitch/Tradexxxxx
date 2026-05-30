# Firebase Security Specification (TADEX Pro Trading Cabinet)

This specification outlines the Attribute-Based Access Control (ABAC) and Zero-Trust database policies for TADEX.

## 1. Core Data Invariants

1. **User Ownership (Identity Bounds)**: A user's profile under `users/{userId}` can only be read or written by the authenticated user whose `request.auth.uid` matches the document ID `{userId}`.
2. **Wallet Cohesion (Isolation)**: A user's wallet under `wallets/{userId}` can only be read, created, or updated by the wallet owner (`userId === request.auth.uid`). No other authenticated user may inspect or update another user's balance.
3. **Trades Authorization**: A user may only create options contracts in `trades/` if the trade payload's `uid` field matches `request.auth.uid`. Querying trades lists must be strictly filtered by `resource.data.uid == request.auth.uid`.
4. **Immutable Timestamps**: Critical timestamps such as `createdAt`, `openedAt`, and initial `demoBalance` and `liveBalance` amounts cannot be arbitrarily corrupted or manipulated on update.
5. **No Self-Elevating status**: Trade contract results and transaction ledger states are restricted to safe inputs or system/user state integrity (e.g. no user can retroactively make a finished lost trade mark as won).

---

## 2. The "Dirty Dozen" (Attack Vector Payloads)

Here are 12 specific payloads attempting to break identity bounds or compromise integrity, which all MUST return a strict `PERMISSION_DENIED`.

### Vector 1: Identity Spoofing (Setting uid to victim)
* **Payload 1**: Creating a profile in `users/victim_123` with `request.auth.uid = attacker_abc`.
* **Payload 2**: Inserting a trade under `trades/option_999` with `uid: "victim_123"` using attacker authentication token.

### Vector 2: Privilege / Role Escalation (Unsanitized profiles)
* **Payload 3**: Setting `role: "admin"` or `isAdmin: true` inside own user document payload in `users/attacker_abc`.
* **Payload 4**: Creating a wallet targeting `wallets/attacker_abc` with a self-granted `demoBalance: 9999999` or `liveBalance: 500000000`.

### Vector 3: Resource Poisoning / ID Junk Fields (Denial of Wallet)
* **Payload 5**: Writing key names over 100 characters inside a custom field in `users/{userId}` to trigger Firestore memory exhaustion.
* **Payload 6**: Creating an ID containing highly malformed and unescaped script characters like `../../hack_path` in index fields.

### Vector 4: Relational Hijacking / Orphan Records
* **Payload 7**: Writing a transaction record to `transactions/tx_777` with `uid: "victim_123"` instead of the active auth UID.
* **Payload 8**: Creating a trade of negative or zero amount (`amount: -500`) attempting to trick the ledger balance updates.

### Vector 5: State Shortcutting / Terminal State Violations
* **Payload 9**: Directly updating an open trade document in `/trades` to cheat contract result: changing `result` and `status` from `"open"` to `"won"` and `pnl` to `+1000` from client SDK without completing standard binary option countdown.
* **Payload 10**: Overwriting an already finalized trade (`status: "completed"` or `"won"`) to shift asset prices retroactively.

### Vector 6: Temporal Spoofing (Client Manipulated Clock)
* **Payload 11**: Inserting user profile containing a custom retrofitted `createdAt` timestamp of `2011-01-01T00:00:00Z` to exploit fake senior user VIP account bonuses.
* **Payload 12**: Setting `updatedAt: "2099-12-31T23:59:59Z"` trying to skew chronologic sorting bounds.

---

## 3. Mock Security Test Runner Reference

These are verified locally via Firestore security rule configurations to ensure consistent `PERMISSION_DENIED` blocks on all invalid operations.
