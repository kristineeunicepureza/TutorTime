# TutorTime - React Frontend API Integration

This project is a React-based frontend for the TutorTime application, integrated with the Java Spring Boot backend API.

## Setup

### Prerequisites
- Node.js and npm
- Java Spring Boot backend running on `http://localhost:8080`

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the API base URL in `.env`:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

## API Integration

### Authentication Service (`apiService.js`)

The application uses a centralized API service for all backend communication. The service handles:
- Automatic token management (stored in `localStorage`)
- Bearer token authorization headers
- Error handling and response parsing

#### Available Functions

**Authentication:**
- `loginUser(email, password)` - POST `/api/login`
- `registerUser(email, password, displayName)` - POST `/api/register`
- `logout()` - Clears stored auth token
- `isAuthenticated()` - Check if user is logged in
- `getAuthToken()` - Retrieve stored access token

**Profile Management:**
- `getUserProfile()` - GET `/api/profile`
- `updateProfile(displayName)` - PUT `/api/profile`
- `changePassword(newPassword)` - PUT `/api/password`
- `uploadPhoto(file)` - POST `/api/uploadPhoto`

### Component Integration

#### Login Component (`Login.jsx`)
- Validates email and password input
- Calls `loginUser()` from API service
- Stores authentication token automatically
- Shows loading state during request
- Displays error messages for failed login

#### SignUp Component (`SignUp.jsx`)
- Validates full name, email, password, and role selection
- Calls `registerUser()` with displayName in format: `"Name (Role)"`
- Stores user role in `localStorage` for later use
- Shows loading state during registration
- Displays error messages

### Token Management

Authentication tokens are automatically:
1. Stored in `localStorage` after successful login/registration
2. Included in all subsequent requests via `Authorization: Bearer <token>` header
3. Cleared when user logs out

### Error Handling

All API errors are caught and user-friendly messages are displayed:
- Network errors
- Server errors (4xx, 5xx)
- Validation errors from backend

### Example Usage

```jsx
import { loginUser, getUserProfile, logout } from './apiService';

// Login
try {
  const response = await loginUser('user@example.com', 'password');
  console.log(response.message);
} catch (error) {
  console.error(error.message);
}

// Get profile (requires token)
try {
  const profile = await getUserProfile();
  console.log(profile);
} catch (error) {
  console.error(error.message);
}

// Logout
logout();
```

## Project Structure

```
src/
├── App.js              - Main app component with view switching
├── App.css             - App styles
├── Login.jsx           - Login page component
├── Login.css           - Login styles
├── SignUp.jsx          - SignUp page component
├── SignUp.css          - SignUp styles
├── apiService.js       - Centralized API service
└── index.js            - React entry point
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Development (default)
REACT_APP_API_URL=http://localhost:8080/api

# Production (example)
# REACT_APP_API_URL=https://api.tutortime.com/api
```

## Features Implemented

✅ User Login with email/password  
✅ User Registration with role selection (Student/Tutor)  
✅ Input validation on client-side  
✅ Error display and handling  
✅ Loading states during API calls  
✅ Token-based authentication  
✅ Automatic token management  
✅ Link between Login and SignUp pages  

## Future Features

- Password reset flow
- Profile updates and editing
- Photo upload
- User profile page
- Session persistence
- Auto-login on app load

## Troubleshooting

### "Cannot reach backend API"
- Ensure Java backend is running on port 8080
- Check `REACT_APP_API_URL` in `.env` file
- Verify CORS is configured on backend

### "Invalid token" errors
- Clear browser `localStorage` and login again
- Check backend token expiration

### Development Server Won't Start
- Delete `node_modules` and `package-lock.json`
- Reinstall with `npm install`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Notes

- All API endpoints require JSON request bodies and return JSON responses
- Profile photos are stored as base64 in the database
- Display names include role information in the format: "Name (Role)"
