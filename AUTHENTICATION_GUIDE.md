# Legal Case Management System - Authentication & Authorization Guide

## Overview
This system implements a complete authentication and authorization system with role-based access control for a Legal Case Management System supporting three user roles: Admin, Lawyer, and Client.

## Architecture

### 1. User Model & Roles
**File:** [app/Models/User.php](app/Models/User.php)

The `User` model has been updated with:
- **Role Column**: Enum field with three possible values: `admin`, `lawyer`, `client`
- **Helper Methods**:
  - `isAdmin()` - Returns true if user is an admin
  - `isLawyer()` - Returns true if user is a lawyer
  - `isClient()` - Returns true if user is a client

**Password Encryption**: Laravel's built-in hashing mechanism automatically encrypts passwords using bcrypt. The password is cast as `hashed` in the model.

### 2. Database Migration
**File:** [database/migrations/2025_02_03_000000_add_role_to_users_table.php](database/migrations/2025_02_03_000000_add_role_to_users_table.php)

Adds the `role` enum column to the users table with default value of `client`.

### 3. Authentication & Registration

#### Registration
**File:** [app/Actions/Fortify/CreateNewUser.php](app/Actions/Fortify/CreateNewUser.php)

Modified to:
- Accept a `role` parameter during registration
- Validate that the role is one of: `admin`, `lawyer`, `client`
- Create user with the specified role

**Frontend:** [resources/js/pages/auth/register.tsx](resources/js/pages/auth/register.tsx)

Register page includes a role selection dropdown where users can select:
- Client
- Lawyer
- Admin

#### Login
**File:** [app/Actions/Fortify/LoginResponse.php](app/Actions/Fortify/LoginResponse.php)

Custom login response handler that:
- Authenticates the user
- Redirects to role-specific dashboard based on their assigned role

**Frontend:** [resources/js/pages/auth/login.tsx](resources/js/pages/auth/login.tsx)

Standard login form with email and password fields.

### 4. Role-Based Routing & Middleware

#### Middleware
**File:** [app/Http/Middleware/EnsureUserRole.php](app/Http/Middleware/EnsureUserRole.php)

Middleware that:
- Checks if user is authenticated
- Verifies the user's role matches the required role
- Returns 403 Unauthorized if role doesn't match

**Registration:** Registered as alias `role` in [bootstrap/app.php](bootstrap/app.php)

#### Routes
**File:** [routes/web.php](routes/web.php)

Three role-specific dashboard routes:
- `/admin/dashboard` - Admin dashboard (requires `admin` role)
- `/lawyer/dashboard` - Lawyer dashboard (requires `lawyer` role)
- `/client/dashboard` - Client dashboard (requires `client` role)
- `/dashboard` - Smart redirect that routes to appropriate dashboard based on user role

Usage:
```php
Route::get('admin/dashboard', function () {
    return Inertia::render('admin-dashboard');
})->middleware(['auth', 'verified', 'role:admin'])->name('admin-dashboard');
```

### 5. Dashboard Pages

Three role-specific dashboard pages have been created:

#### Admin Dashboard
**File:** [resources/js/pages/admin-dashboard.tsx](resources/js/pages/admin-dashboard.tsx)

Features:
- Total users count
- Total cases count
- Active lawyers count
- Active clients count
- Recent users list
- System activity log

#### Lawyer Dashboard
**File:** [resources/js/pages/lawyer-dashboard.tsx](resources/js/pages/lawyer-dashboard.tsx)

Features:
- Active cases count
- My clients count
- Pending tasks count
- Closed cases count
- Current cases list
- Upcoming deadlines

#### Client Dashboard
**File:** [resources/js/pages/client-dashboard.tsx](resources/js/pages/client-dashboard.tsx)

Features:
- My cases count
- Active cases count
- Assigned lawyer display
- Closed cases count
- My cases list
- Updates & documents

### 6. Authentication Flow

1. **Unregistered User**: Visits registration page
2. **Register**: 
   - Fills in name, email, password
   - Selects role (Admin, Lawyer, or Client)
   - Submits form
   - User created with encrypted password using bcrypt
   - Automatically logged in
   - Redirected to role-specific dashboard

3. **Existing User - Login**:
   - Visits login page
   - Enters email and password
   - Password verified against bcrypt hash
   - User authenticated
   - Redirected to role-specific dashboard

### 7. Service Provider Configuration
**File:** [app/Providers/FortifyServiceProvider.php](app/Providers/FortifyServiceProvider.php)

Configured to:
- Use custom `CreateNewUser` action for registration
- Use custom `LoginResponse` for login redirection
- Use custom `RegisterResponse` for post-registration redirection
- Configure all Fortify views using Inertia

### 8. Password Security

- **Hashing Algorithm**: bcrypt (Laravel's default)
- **Validation**: Password confirmation required during registration
- **Strength**: Passwords are validated based on environment:
  - **Production**: Minimum 12 characters, mixed case, numbers, symbols, uncompromised check
  - **Development**: No strict requirements

See [app/Providers/AppServiceProvider.php](app/Providers/AppServiceProvider.php) for password configuration.

## File Structure Summary

```
app/
├── Actions/Fortify/
│   ├── CreateNewUser.php          ← Modified for role support
│   ├── LoginResponse.php           ← NEW: Role-based redirect on login
│   └── RegisterResponse.php        ← NEW: Role-based redirect on register
├── Http/Middleware/
│   └── EnsureUserRole.php          ← NEW: Role verification middleware
└── Models/
    └── User.php                    ← Modified with role support

database/
└── migrations/
    └── 2025_02_03_000000_add_role_to_users_table.php  ← NEW: Add role column

resources/js/pages/
├── admin-dashboard.tsx            ← NEW: Admin-specific dashboard
├── lawyer-dashboard.tsx           ← NEW: Lawyer-specific dashboard
├── client-dashboard.tsx           ← NEW: Client-specific dashboard
└── auth/
    └── register.tsx               ← Modified to include role selection

routes/
└── web.php                        ← Modified with role-based routes

bootstrap/
└── app.php                        ← Modified to register role middleware

config/
└── fortify.php                    ← (Reference only, no changes needed)
```

## Usage Examples

### Check User Role in Code
```php
$user = auth()->user();

if ($user->isAdmin()) {
    // Admin-specific logic
}

if ($user->isLawyer()) {
    // Lawyer-specific logic
}

if ($user->isClient()) {
    // Client-specific logic
}
```

### Protect Routes with Role Middleware
```php
Route::get('admin/panel', function () {
    // Only accessible to admins
})->middleware(['auth', 'role:admin']);

Route::get('lawyer/cases', function () {
    // Only accessible to lawyers
})->middleware(['auth', 'role:lawyer']);

Route::get('client/status', function () {
    // Only accessible to clients
})->middleware(['auth', 'role:client']);
```

### Check Role in Frontend (React/TSX)
```tsx
import { usePage } from '@inertiajs/react';

export default function SomeComponent() {
    const { auth } = usePage().props;
    
    if (auth.user.role === 'admin') {
        return <AdminContent />;
    }
    
    return <DefaultContent />;
}
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **CSRF Protection**: Built-in Laravel CSRF protection
3. **Email Verification**: Optional email verification available
4. **Two-Factor Authentication**: Optional 2FA available
5. **Rate Limiting**: Login attempts are rate-limited to 5 per minute
6. **Role-Based Access Control**: Middleware ensures users can only access routes for their role

## Testing the System

### Step 1: Register as Different Roles
1. Visit `/register`
2. Fill in the form and select a role
3. Submit

### Step 2: Test Role-Specific Redirects
1. Login with an admin account → Should redirect to `/admin/dashboard`
2. Login with a lawyer account → Should redirect to `/lawyer/dashboard`
3. Login with a client account → Should redirect to `/client/dashboard`

### Step 3: Test Role-Based Route Protection
1. Try to access `/admin/dashboard` as a non-admin → Should get 403 Forbidden
2. Try to access `/lawyer/dashboard` as a client → Should get 403 Forbidden
3. Try to access `/client/dashboard` as a lawyer → Should get 403 Forbidden

## Future Enhancements

1. Create actual database tables for:
   - Cases
   - Client-Lawyer assignments
   - Case documents
   - Communications/Messages

2. Implement role-specific features:
   - Admin: User management, case assignment, reports
   - Lawyer: Case management, client communication, document upload
   - Client: Case tracking, document viewing, communication with lawyer

3. Add audit logging
4. Implement soft deletes for users
5. Add role permissions system for more granular control
