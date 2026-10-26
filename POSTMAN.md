# Kajkorbo API - Postman guide

This guide explains how to test the Kajkorbo API in Postman. The complete
endpoint reference is available in [API.md](./API.md).

## 1. Create a Postman environment

Create an environment named `Kajkorbo Local` with these variables:

| Variable | Initial value | Current value |
|---|---|---|
| `baseUrl` | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `accessToken` | empty | empty |
| `refreshToken` | empty | empty |
| `userEmail` | empty | empty |
| `organizationId` | empty | empty |
| `teamId` | empty | empty |
| `taskId` | empty | empty |
| `subtaskId` | empty | empty |
| `complaintId` | empty | empty |
| `userId` | empty | empty |
| `paymentId` | empty | empty |

Select this environment before sending requests. Change `baseUrl` if the
server is running on another host or port.

## 1.1 Frontend CORS configuration

The backend reads a comma-separated `FRONTEND_URLS` environment variable. Add
the exact frontend origin in Render, without a trailing slash:

```text
FRONTEND_URLS=https://your-frontend.example.com
```

Multiple frontend origins can be separated with commas:

```text
FRONTEND_URLS=https://your-frontend.example.com,https://admin.example.com
```

The local default allows `http://localhost:3000` and
`http://localhost:5173`. Credentials are enabled, so browser requests that
use authentication cookies must send `credentials: "include"`.

## 2. Create a collection

Create a collection named `Kajkorbo API`. Add these folders:

- Authentication
- Organizations
- Billing
- Tasks
- Complaints
- Super Admin

Use `{{baseUrl}}` at the beginning of every request URL. For example:

```text
{{baseUrl}}/auth/login
```

The endpoint list and required roles are documented in [API.md](./API.md).

## 3. Configure authentication

For protected requests, open the collection's **Authorization** tab and set:

```text
Type: Bearer Token
Token: {{accessToken}}
```

Individual requests can inherit this collection-level authorization.

The API also sets an HTTP-only `accessToken` cookie after login. Postman
usually stores and sends this cookie automatically for the same host. The
Bearer-token setup is recommended because it makes the active credential
explicit and also works when cookie persistence is disabled.

## 4. Login request

Create `Authentication > Login`:

```text
POST {{baseUrl}}/auth/login
```

Headers:

```text
Content-Type: application/json
```

Body: **raw > JSON**

```json
{
  "email": "{{userEmail}}",
  "password": "your-password"
}
```

After sending the request, copy `data.accessToken` from the response into the
environment's `accessToken` variable. Copy `data.refreshToken` into
`refreshToken` if it is needed for local inspection. There is currently no
refresh-token endpoint.

For a new account, send these requests first:

1. `POST {{baseUrl}}/auth/register`
2. `POST {{baseUrl}}/auth/verify-email`
3. `POST {{baseUrl}}/auth/login`

Example registration body:

```json
{
  "name": "Test User",
  "email": "{{userEmail}}",
  "password": "your-password"
}
```

Example email verification body:

```json
{
  "email": "{{userEmail}}",
  "otp": "123456"
}
```

The OTP is delivered through the configured email service.

## 5. JSON request setup

For JSON requests, use:

```text
Body > raw > JSON
```

Postman adds the following header automatically, but verify it is present:

```text
Content-Type: application/json
```

Common request examples:

### Create an organization

```text
POST {{baseUrl}}/organizations
```

```json
{
  "name": "Kajkorbo Test Organization",
  "description": "Organization created from Postman",
  "email": "organization@example.com",
  "phone": "+8801700000000",
  "address": "Dhaka, Bangladesh"
}
```

This request requires a `USER` account. On success, save
`data.organization.id` as `organizationId`.

### Create a team

```text
POST {{baseUrl}}/organizations/{{organizationId}}/teams
```

```json
{
  "name": "Test Team",
  "description": "Team created from Postman"
}
```

Save `data.team.id` as `teamId`.

### Create a task

```text
POST {{baseUrl}}/tasks
```

```json
{
  "teamId": "{{teamId}}",
  "title": "Test task",
  "description": "Task created from Postman",
  "priority": "MEDIUM",
  "startAt": "2026-10-27T09:00:00.000Z",
  "dueAt": "2026-10-30T17:00:00.000Z"
}
```

Save `data.task.id` as `taskId`.

### Submit a complaint

```text
POST {{baseUrl}}/complaints
```

```json
{
  "organizationId": "{{organizationId}}",
  "reportedUserId": "{{userId}}",
  "category": "Workplace conduct",
  "description": "Complaint created from Postman",
  "evidenceUrl": "https://example.com/evidence"
}
```

Save `data.complaint.id` as `complaintId`.

## 6. Query parameters

Add query parameters through Postman's **Params** tab. Supported examples:

| Request | Key | Example value |
|---|---|---|
| `GET /organizations/public` | `search` | `design` |
| `GET /complaints` | `organizationId` | `{{organizationId}}` |
| `GET /super-admin/users` | `search` | `test` |
| `GET /super-admin/users` | `status` | `ACTIVE` |
| `GET /super-admin/organizations` | `search` | `kajkorbo` |
| `GET /super-admin/organizations` | `status` | `ACTIVE` |
| `GET /super-admin/complaints` | `organizationId` | `{{organizationId}}` |
| `GET /super-admin/payments` | `organizationId` | `{{organizationId}}` |

## 7. Multipart avatar requests

For `PATCH {{baseUrl}}/auth/profile` or
`POST {{baseUrl}}/auth/avatar`:

1. Select **Body > form-data**.
2. Add a text field named `name` when updating the profile.
3. Add a file field named `avatar`.
4. Choose a JPEG, PNG, WebP, or GIF file.
5. Do not manually set `Content-Type`; Postman must add the multipart boundary.

Images are limited to one file and 5 MB.

## 8. Stripe checkout

Create:

```text
POST {{baseUrl}}/billing/organizations/{{organizationId}}/checkout
```

Add this header:

```text
Idempotency-Key: postman-checkout-001
```

Use a unique value for each new checkout operation. Reusing the same key is
appropriate when retrying the same operation.

Body: **raw > JSON**

```json
{
  "additionalTeamCapacity": 5
}
```

The value must be an integer from `1` through `100`.

## 9. Stripe webhook testing

The webhook endpoint verifies Stripe's signature against the raw request body.
A normal Postman request with a manually typed `stripe-signature` will not
produce a valid event.

For local webhook testing, use the Stripe CLI:

```text
stripe listen --forward-to localhost:3000/api/v1/billing/stripe/webhook
```

Then trigger a test event through the Stripe CLI or Stripe Dashboard. The
server receives the raw body and the CLI generates the valid
`stripe-signature` header.

## 10. Useful request order

For a basic organization workflow:

1. Register
2. Verify email
3. Login
4. Create organization
5. Create team
6. Add a team member
7. Assign the team leader
8. Create a task
9. Accept or reject the task
10. Create and submit a subtask
11. Approve the subtask or request a revision

For administrative endpoints, log in with a `SUPER_ADMIN` account and use the
requests in the **Super Admin** folder.

## 11. Troubleshooting

| Response | Postman checks |
|---|---|
| `401 Unauthorized` | Confirm `{{accessToken}}` is populated and the Bearer token type is selected. |
| `403 Forbidden` | Confirm the logged-in account has the role required by the endpoint. |
| `400 BAD_REQUEST` | Check the JSON field names, enum values, required fields, and ISO date-time format. |
| `404 NOT_FOUND` | Confirm the ID variable is populated and the URL uses `{{baseUrl}}/api/v1`. |
| `413 REQUEST_ENTITY_TOO_LARGE` | Use an image no larger than 5 MB. |
| Stripe webhook signature error | Use Stripe CLI forwarding instead of manually crafting the signature. |

Every successful response follows the standard envelope described in
[API.md](./API.md). Validation and server errors include an `error.code`,
`error.message`, and `errorDetails`.
