# Admin Email API Frontend Integration Guide

This guide explains how to integrate the admin email system APIs in your frontend dashboard.

## 1) Scope

This backend supports:

- Admin list of email threads with filters
- Admin email thread details page
- Admin reply to thread
- Admin delete thread
- Incoming email reply storage via Resend webhook

## 2) Base Configuration

- Base URL: `{{API_BASE_URL}}/api`
- Auth: Bearer token required for all admin email endpoints
- Content type: `application/json`

Example header:

```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

## 3) API Endpoints (Admin)

### 3.1 List email threads

- Method: `GET`
- URL: `/admin/emails`

Query params:

- `page` number (default `1`)
- `limit` number (default `10`)
- `search` string
- `status` string: `open | closed`
- `fromEmail` string
- `subject` string
- `hasReply` string: `true | false`
- `startDate` string date (ISO recommended)
- `endDate` string date (ISO recommended)

Example request:

```http
GET /api/admin/emails?page=1&limit=10&search=john&status=open&hasReply=false
```

Example success response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "67fdfebf9f10c2b5f7fbc4f1",
      "threadToken": "1bfe72a0-80cc-4bb3-abf4-30f1bcfef8c1",
      "subject": "Contact Us: John",
      "status": "open",
      "from": {
        "name": "John",
        "email": "john@example.com"
      },
      "incomingCount": 2,
      "outgoingCount": 1,
      "lastMessageAt": "2026-04-15T10:20:30.000Z",
      "lastMessage": {
        "direction": "incoming",
        "source": "webhook",
        "subject": "Re: Contact Us: John",
        "text": "Any update?"
      },
      "createdAt": "2026-04-15T08:10:11.000Z"
    }
  ],
  "count": 5
}
```

Notes:

- `count` is total number of pages, not total rows.
- Use `status`, `hasReply`, and date filters for table controls.

### 3.2 Thread details

- Method: `GET`
- URL: `/admin/emails/:id`

Example request:

```http
GET /api/admin/emails/67fdfebf9f10c2b5f7fbc4f1
```

Example success response:

```json
{
  "success": true,
  "data": {
    "_id": "67fdfebf9f10c2b5f7fbc4f1",
    "threadToken": "1bfe72a0-80cc-4bb3-abf4-30f1bcfef8c1",
    "status": "open",
    "subject": "Contact Us: John",
    "from": {
      "name": "John",
      "email": "john@example.com"
    },
    "messages": [
      {
        "direction": "incoming",
        "source": "public",
        "text": "I need help",
        "createdAt": "2026-04-15T08:10:11.000Z"
      },
      {
        "direction": "outgoing",
        "source": "admin",
        "text": "Sure, we can help",
        "createdAt": "2026-04-15T08:20:11.000Z"
      }
    ],
    "lastMessageAt": "2026-04-15T10:20:30.000Z",
    "createdAt": "2026-04-15T08:10:11.000Z",
    "updatedAt": "2026-04-15T10:20:30.000Z"
  }
}
```

UI suggestion:

- Left: thread metadata (from, status, subject)
- Right: timeline/chat style message list sorted by `createdAt`
- Composer at bottom for admin reply

### 3.3 Reply to thread

- Method: `POST`
- URL: `/admin/emails/:id/reply`

Request body:

- `message` required string
- `subject` optional string
- `status` optional string: `open | closed`

Example request:

```json
{
  "message": "Thanks for reaching out. Please share your phone number.",
  "status": "open"
}
```

Example success response:

```json
{
  "success": true,
  "message": "Email reply sent",
  "data": {
    "threadId": "67fdfebf9f10c2b5f7fbc4f1",
    "resendId": "9f9f70e4-bf09-4e2e-b9fb-b82767a2fd1c"
  }
}
```

Frontend behavior after success:

- Refresh thread details query
- Refresh thread list query
- Clear compose input

### 3.4 Delete thread

- Method: `DELETE`
- URL: `/admin/emails/:id`

Example success response:

```json
{
  "success": true,
  "message": "Email thread deleted"
}
```

Frontend behavior:

- Show confirmation modal before delete
- On success, remove row or refetch list
- Redirect from details page to list if current thread is deleted

## 4) Webhook Endpoint (Backend only)

Not called by frontend directly, but relevant to UI updates:

- Method: `POST`
- URL: `/webhooks/resend/email`

This endpoint stores incoming replies into the same thread, so your admin thread page can show both outgoing and incoming messages over time.

## 5) Recommended Frontend Data Model

```ts
export type EmailThreadListItem = {
  _id: string;
  threadToken: string;
  subject: string;
  status: 'open' | 'closed';
  from: { name: string; email: string };
  incomingCount: number;
  outgoingCount: number;
  lastMessageAt: string;
  lastMessage: {
    direction: 'incoming' | 'outgoing';
    source: 'webhook' | 'admin' | 'public' | 'system';
    subject?: string;
    text?: string;
    html?: string;
    createdAt?: string;
  } | null;
  createdAt: string;
};

export type EmailMessage = {
  _id: string;
  direction: 'incoming' | 'outgoing';
  source: 'webhook' | 'admin' | 'public' | 'system';
  from: { name: string; email: string };
  to: string[];
  subject: string;
  text: string;
  html: string;
  resendId: string;
  inReplyTo: string;
  eventType: string;
  createdAt: string;
};

export type EmailThreadDetail = {
  _id: string;
  threadToken: string;
  status: 'open' | 'closed';
  subject: string;
  from: { name: string; email: string };
  messages: EmailMessage[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
};
```

## 6) Suggested Frontend Screen Flow

1. Open Email Threads page
2. Fetch list with current filters and pagination
3. Click row to open Email Details page
4. Show timeline and compose form
5. Send reply
6. Re-fetch details and list
7. Optionally poll details every 20 to 30 seconds for incoming webhook updates

## 7) Error Handling Guide

Use backend `message` from failed responses for toast notifications.

Common errors:

- `Reply message is required`
- `Email thread not found`
- `This thread has no valid recipient email`
- `Resend API key is missing in environment variables`

## 8) Prompt Guide for Frontend Team

Use these prompts with AI coding assistants to generate frontend pieces consistently.

### Prompt A: Build list page

```text
Create a React + TypeScript admin page called EmailThreadsPage.
Use TanStack Query and Axios.
Integrate GET /api/admin/emails with filters:
page, limit, search, status, fromEmail, subject, hasReply, startDate, endDate.
Render a table with columns:
Sender, Subject, Status, Incoming, Outgoing, Last Message At, Actions.
Actions should include View and Delete.
Use server pagination where response count is total pages.
Include loading, empty, and error states.
```

### Prompt B: Build details page with reply

```text
Create a React + TypeScript page EmailThreadDetailsPage for route /admin/emails/:id.
Fetch GET /api/admin/emails/:id.
Render conversation timeline grouped by day and aligned by direction (incoming left, outgoing right).
Add a reply form that posts to POST /api/admin/emails/:id/reply with { message, subject?, status? }.
After successful reply, refetch thread details and show a success toast.
Support status change open/closed from the form.
```

### Prompt C: API client layer

```text
Create an Axios API module for admin email APIs with bearer token support.
Expose functions:
getEmailThreads(params), getEmailThreadById(id), replyToEmailThread(id, payload), deleteEmailThread(id).
Add TypeScript types for request/response payloads.
Ensure query params are serialized correctly and omit empty values.
```

### Prompt D: Reusable filters component

```text
Build a reusable EmailThreadFilters component with controlled inputs:
search, status select, fromEmail, subject, hasReply, startDate, endDate.
Emit onChange(filterState).
Add Reset button and mobile-friendly layout.
```

## 9) QA Checklist

- List page supports all filters and pagination
- Opening thread shows full messages timeline
- Reply is sent and appears in timeline immediately
- Incoming webhook replies appear after refresh/poll
- Delete removes thread and handles navigation correctly
- API error messages are visible to admin user

## 10) Optional Improvements

- Add SSE or WebSocket for near real-time incoming replies
- Add endpoint to update thread status without replying
- Add attachment support in message model and frontend viewer
