# Kajkorbo API documentation

This document describes the HTTP API implemented by Kajkorbo. For step-by-step
Postman setup, environment variables, authentication, and request examples,
see [POSTMAN.md](./POSTMAN.md).

## Base URL

All application routes are prefixed with:

```text
/api/v1
```

The server port is configured with `PORT` and defaults to `3000`, so a local
base URL is usually `http://localhost:3000/api/v1`.

Unless noted otherwise, request and response bodies use `application/json`.

## Authentication

Authenticated routes accept either of the following:

- The `accessToken` HTTP-only cookie set by the login endpoints.
- `Authorization: Bearer <access-token>`.

The login endpoints also return `accessToken` and `refreshToken` in the
response body. Access-token and refresh-token expiration are controlled by
`JWT_ACCESS_EXPIRES_IN` and `JWT_REFRESH_EXPIRES_IN` (defaults: `1d` and
`7d`).

When `NODE_ENV=production`, authentication cookies are `Secure` and use
`SameSite=None`; otherwise they use `SameSite=Lax`.

### Roles

The role names used by the API are:

`SUPER_ADMIN`, `ORG_OWNER`, `ORG_MEMBER`, `TEAM_LEADER`, `TEAM_MEMBER`, and
`USER`.

An endpoint marked **authenticated** requires a valid active account. An
endpoint marked with one or more roles additionally requires one of those
roles.

## Response format

Successful application responses use this envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable result",
  "data": {}
}
```

List endpoints return their collection inside `data`, for example
`data.users`, `data.organizations`, or `data.complaints`.

Errors use this envelope:

```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed"
  },
  "message": "Validation failed",
  "errorDetails": "Validation failed"
}
```

Common status codes are `400` (invalid input), `401` (missing or invalid
authentication), `403` (insufficient permission or inactive account), `404`
(resource or route not found), `409` (conflict), and `500` (unexpected server
error). Uploaded images over 5 MB return `413`.

## Authentication endpoints

### `POST /auth/register`

Public. Creates an unverified user and sends an email verification OTP.

Request body:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `name` | string | Yes | Must not be empty |
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | At least 6 characters |
| `avatar` | string | No | Optional avatar URL |

Returns `201` with `data.user`.

### `POST /auth/verify-email`

Public. Verifies a user's email address.

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

`otp` must be exactly six digits. Returns `200` with `data.user`.

### `POST /auth/login`

Public. Logs in with email and password. Sets authentication cookies and
returns both tokens.

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Returns `200` with `data.user`, `data.accessToken`, and `data.refreshToken`.

### `POST /auth/google`

Public. Logs in or registers using a Google ID token.

```json
{
  "idToken": "<google-id-token>"
}
```

Returns `200` with `data.result`, including access and refresh tokens, and sets
authentication cookies.

### `GET /auth/me`

Authenticated: `SUPER_ADMIN`, `ORG_OWNER`, `ORG_MEMBER`, `TEAM_LEADER`,
`TEAM_MEMBER`, or `USER`.

Returns `200` with the current profile in `data.profile`.

### `PATCH /auth/profile`

Authenticated: all roles. Accepts `multipart/form-data`. The optional text
field is `name`; the optional file field is `avatar`.

Avatar files must be JPEG, PNG, WebP, or GIF and must not exceed 5 MB. Returns
`200` with `data.user`.

### `POST /auth/avatar`

Authenticated: all roles. Accepts `multipart/form-data` with a required `avatar`
image file. The same file type and 5 MB limits as `/auth/profile` apply.
Returns `200` with `data.user`.

### `POST /auth/forgot-password`

Public. Sends a password-reset OTP to a registered email address.

```json
{
  "email": "user@example.com"
}
```

Returns `200` with an empty `data` object.

### `POST /auth/reset-password`

Public. Resets a password using the OTP sent by `/auth/forgot-password`.

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "new-secret123"
}
```

The password must meet the service's password requirements. Returns `200` with
an empty `data` object.

## Organization and team endpoints

### `GET /organizations/public`

Public. Lists active, non-suspended organizations. An optional
`search` query parameter searches organization names and descriptions.

Returns `200` with `data.organizations`.

### `POST /organizations`

Authenticated: `USER`. Creates an organization and makes the caller its owner.

Request body:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `name` | string | Yes | Must not be empty |
| `description` | string | No | Must not be empty when supplied |
| `email` | string | Yes | Valid organization email |
| `phone` | string | No | Must not be empty when supplied |
| `address` | string | No | Must not be empty when supplied |
| `logo` | string | No | Must not be empty when supplied |

Returns `201` with `data.organization`.

### `POST /organizations/:organizationId/members`

Authenticated: `ORG_OWNER`. Creates an invitation for an organization member.

```json
{
  "email": "member@example.com"
}
```

Returns `201` with `data.invitation`.

### `PATCH /organizations/:organizationId`

Authenticated: `ORG_OWNER`. Updates one or more organization fields. At least
one field is required. The accepted fields are `name`, `description`, `email`,
`phone`, `address`, and `logo`; nullable fields may be set to `null`.

Returns `200` with `data.organization`.

### `PATCH /organizations/:organizationId/deactivate`

Authenticated: `ORG_OWNER`. Deactivates an organization. Returns `200` with
`data.organization`.

### `DELETE /organizations/:organizationId`

Authenticated: `ORG_OWNER`. Performs the same deactivation operation as the
`PATCH /:organizationId/deactivate` endpoint. Returns `200` with
`data.organization`.

### `POST /organizations/:organizationId/teams`

Authenticated: `ORG_OWNER`. Creates a team.

```json
{
  "name": "Design",
  "description": "Product design team"
}
```

`name` is required; `description` is optional. Returns `201` with `data.team`.

### `DELETE /organizations/teams/:teamId`

Authenticated: `ORG_OWNER`. Deletes a team. Returns `200` with `data.team`.

### `POST /organizations/teams/:teamId/members`

Authenticated: `ORG_OWNER`. Adds a user to a team.

```json
{
  "userId": "user-id"
}
```

Returns `201` with `data.membership`.

### `DELETE /organizations/teams/:teamId/members/:userId`

Authenticated: `ORG_OWNER`. Removes a user from a team. Returns `200` with
`data.membership`.

### `PATCH /organizations/teams/:teamId/leader`

Authenticated: `ORG_OWNER`. Assigns a team leader.

```json
{
  "userId": "user-id"
}
```

Returns `200` with `data.team`.

## Billing endpoints

### `GET /billing/organizations/:organizationId/team-capacity`

Authenticated: `ORG_OWNER`. Returns the organization's current team-capacity
entitlement in `data.entitlement`.

### `POST /billing/organizations/:organizationId/checkout`

Authenticated: `ORG_OWNER`. Creates a Stripe checkout session. The
`Idempotency-Key` header is required.

```json
{
  "additionalTeamCapacity": 5
}
```

`additionalTeamCapacity` must be an integer from 1 through 100. Returns `200`
with `data.checkout`.

### `GET /billing/organizations/:organizationId/payments`

Authenticated: `ORG_OWNER`. Lists organization payments in `data.payments`.

### `POST /billing/stripe/webhook`

Public Stripe webhook endpoint. Send the exact raw Stripe JSON payload with
`Content-Type: application/json` and the `stripe-signature` header. The
signature is verified using `STRIPE_WEBHOOK_SECRET`.

Returns:

```json
{
  "received": true,
  "duplicate": false
}
```

## Task and subtask endpoints

### `POST /tasks`

Authenticated: `ORG_OWNER`. Creates a task.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `teamId` | string | Yes | Target team |
| `title` | string | Yes | Must not be empty |
| `description` | string | Yes | Must not be empty |
| `priority` | enum | No | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `startAt` | ISO date-time | No | Must be before `dueAt` |
| `dueAt` | ISO date-time | Yes | Task due date |

Returns `201` with `data.task`.

### `POST /tasks/:taskId/accept`

Authenticated: `ORG_OWNER`, `ORG_MEMBER`, `TEAM_LEADER`, or `TEAM_MEMBER`.
Accepts no body. Returns `200` with `data.task`.

### `POST /tasks/:taskId/reject`

Authenticated: `ORG_OWNER`, `ORG_MEMBER`, `TEAM_LEADER`, or `TEAM_MEMBER`.

```json
{
  "reason": "The requirements are incomplete"
}
```

`reason` is required. Returns `200` with `data.task`.

### `POST /tasks/:taskId/complete`

Authenticated: `ORG_MEMBER` or `TEAM_LEADER`. Accepts no body. Returns `200`
with `data.task`.

### `POST /tasks/:taskId/subtasks`

Authenticated: `ORG_OWNER`, `ORG_MEMBER`, `TEAM_LEADER`, or `TEAM_MEMBER`.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `assignedUserId` | string | Yes | Assigned user |
| `title` | string | Yes | Must not be empty |
| `description` | string | Yes | Must not be empty |
| `dueAt` | ISO date-time | Yes | Must be in the future |

Returns `201` with `data.subtask`.

### `POST /tasks/subtasks/:subtaskId/submit`

Authenticated: `ORG_MEMBER`, `TEAM_MEMBER`, or `TEAM_LEADER`.

```json
{
  "description": "Completed implementation and tests"
}
```

Returns `201` with `data.submission`.

### `POST /tasks/subtasks/:subtaskId/approve`

Authenticated: `ORG_MEMBER` or `TEAM_LEADER`. The optional `feedback` field may
be included. Returns `200` with `data.subtask`.

### `POST /tasks/subtasks/:subtaskId/request-revision`

Authenticated: `ORG_MEMBER` or `TEAM_LEADER`.

```json
{
  "feedback": "Please include test coverage"
}
```

`feedback` is required. Returns `200` with `data.subtask`.

### `POST /tasks/subtasks/:subtaskId/reassign`

Authenticated: `ORG_MEMBER` or `TEAM_LEADER`.

```json
{
  "assignedUserId": "user-id"
}
```

Returns `200` with `data.subtask`.

## Complaint endpoints

### `POST /complaints`

Authenticated: all roles.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `organizationId` | string | Yes | Organization involved |
| `reportedUserId` | string | Yes | User being reported |
| `teamId` | string | No | Related team |
| `taskId` | string | No | Related task |
| `subtaskId` | string | No | Related subtask |
| `category` | string | Yes | Must not be empty |
| `description` | string | Yes | Must not be empty |
| `evidenceUrl` | URL | No | Must be a valid URL |

Returns `201` with `data.complaint`.

### `GET /complaints`

Authenticated: all roles. An optional `organizationId` query parameter filters
complaints. Returns `200` with `data.complaints`.

### `GET /complaints/:complaintId`

Authenticated: all roles. Returns `200` with `data.complaint`.

### `PATCH /complaints/:complaintId/status`

Authenticated: `SUPER_ADMIN` or `ORG_OWNER`.

```json
{
  "status": "UNDER_REVIEW",
  "resolutionNotes": "The complaint is being investigated"
}
```

`status` is one of `OPEN`, `UNDER_REVIEW`, `RESOLVED`, or `DISMISSED`.
`resolutionNotes` is optional. Returns `200` with `data.complaint`.

### `POST /complaints/:complaintId/resolve`

Authenticated: `SUPER_ADMIN` or `ORG_OWNER`.

```json
{
  "status": "RESOLVED",
  "resolutionNotes": "Issue confirmed and addressed"
}
```

`status` must be `RESOLVED` or `DISMISSED`, and `resolutionNotes` is required.
Returns `200` with `data.complaint`.

## Super-admin endpoints

All endpoints in this section require the `SUPER_ADMIN` role.

### `GET /super-admin/dashboard`

Returns dashboard aggregates and recent records in `data.dashboard`.

### `GET /super-admin/users`

Lists users in `data.users`. Optional query parameters:

- `search`: case-insensitive name or email search.
- `status`: `ACTIVE`, `BANNED`, or `DEACTIVATED`.

### `GET /super-admin/users/:userId`

Returns a user and related organization information in `data.user`.

### `PATCH /super-admin/users/:userId/status`

```json
{
  "status": "BANNED",
  "bannedReason": "Repeated policy violations"
}
```

`status` is `ACTIVE`, `BANNED`, or `DEACTIVATED`. `bannedReason` is required
when setting `BANNED`. Returns `200` with `data.user`.

### `GET /super-admin/organizations`

Lists organizations in `data.organizations`. Optional query parameters:

- `search`: case-insensitive name or email search.
- `status`: `ACTIVE`, `SUSPENDED`, or `DEACTIVATED`.

### `GET /super-admin/organizations/:organizationId`

Returns an organization, entitlement, owner, and counts in
`data.organization`.

### `PATCH /super-admin/organizations/:organizationId/status`

```json
{
  "status": "SUSPENDED"
}
```

`status` is `ACTIVE`, `SUSPENDED`, or `DEACTIVATED`. Returns `200` with
`data.organization`.

### `GET /super-admin/complaints`

Lists all complaints in `data.complaints`. An optional `organizationId` query
parameter filters the results.

### `GET /super-admin/complaints/:complaintId`

Returns a complaint with related records in `data.complaint`.

### `PATCH /super-admin/complaints/:complaintId/status`

Uses the same request body and status values as
`PATCH /complaints/:complaintId/status`. Returns `200` with `data.complaint`.

### `GET /super-admin/payments`

Lists payments in `data.payments`. An optional `organizationId` query parameter
filters the results.

### `GET /super-admin/payments/:paymentId`

Returns a payment and its organization in `data.payment`.

## Operational notes

- The API does not expose a separate refresh-token route. Clients should use
  the access token returned by login while it is valid.
- `POST /billing/stripe/webhook` must not be sent through a JSON body parser
  before signature verification; the server already configures this route to
  receive Stripe's raw request body.
- Query-list responses currently return collections directly and do not include
  pagination metadata.
