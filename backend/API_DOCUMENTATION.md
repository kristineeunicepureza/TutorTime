# API Endpoints Documentation

This document describes the REST API endpoints provided by the TestAPI Spring Boot application.
All endpoints are prefixed with `/api`.

---

## Authentication

### POST `/api/register`
Create a new user account via Supabase Auth and store profile.

**Request Body** (JSON):
```json
{
  "email": "user@example.com",
  "password": "secret",
  "displayName": "User Name"
}
```
**Response** (JSON):
```json
{
  "success": true,
  "message": "Success! Please check your email to verify your account.",
  "token": null
}
```

> **Note:** if Supabase confirms the new account immediately the
> response will include an access token and the message will be
> **"Registration successful!"** instead.

---

### POST `/api/login`
Authenticate user credentials and return a Supabase access token.

**Request Body** (JSON):
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
**Response** (JSON):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "<access_token>"
}
```

---

## Profile Management

> All endpoints below require the `Authorization` header with a Bearer token obtained from `/api/login`.

### GET `/api/profile`
Retrieve the currently authenticated user’s profile data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response** (JSON):
```json
{
  "uid": "<user-id>",
  "email": "user@example.com",
  "displayName": "User Name",
  "photo": null
}
```

---

### PUT `/api/profile`
Update the user's display name or other profile fields.

**Headers:**
```
Authorization: Bearer <token>
```
**Request Body** (JSON):
```json
{
  "displayName": "New Name"
}
```
**Response** (JSON):
```json
{
  "message": "profile updated"
}
```

---

### PUT `/api/password`
Change the authenticated user's password.

**Headers:**
```
Authorization: Bearer <token>
```
**Request Body** (JSON):
```json
{
  "newPassword": "newSecret"
}
```
**Response** (JSON):
```json
{
  "message": "password changed"
}
```

---

### POST `/api/uploadPhoto`
Upload and save a profile photo as bytes.

**Headers:**
```
Authorization: Bearer <token>
```
**Request:** multipart/form-data with field `file` containing `.jpg` or `.png` image.

**Response** (JSON):
```json
{
  "message": "photo uploaded"
}
```

---

## Notes

- All responses are JSON.
- Tokens are the Supabase access tokens; include them as Bearer in the `Authorization` header.
- Profile photo bytes are stored in the database and returned as base64 when serialized (clients may need to handle binary conversion).

Feel free to copy this into your Postman collection as documentation.