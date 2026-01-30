# Role-Based Page Access Control

## Overview

The system now implements automatic role-based redirects that ensure users only access pages they're authorized to use. When a user logs in or attempts to access a restricted page, they are automatically redirected to their appropriate default page.

## Role Default Pages

Each role has a designated default landing page:

| Role | Default Page | Path |
|------|-------------|------|
| **driver** | Trips | `/trips` |
| **administration** | Dashboard | `/dashboard` |
| **maintenance_team** | Vehicles | `/vehicles` |
| **fleet_manager** | Dashboard | `/dashboard` |
| **client_company_liaison** | Dashboard | `/dashboard` |

## Role Access Permissions

### Driver
**Allowed Pages:**
- `/trips` - View and create their trips
- `/vehicles` - View assigned vehicles only
- `/fuel` - Log and view their fuel transactions
- `/incidents` - Report and view their incidents

**Restrictions:**
- Cannot access maintenance, drivers, users, or administrative pages

### Maintenance Team (maintenance_manager)
**Allowed Pages:**
- `/vehicles` - View all vehicles
- `/maintenance` - Manage maintenance records
- `/incidents` - View reported vehicle issues

**Restrictions:**
- Cannot access trips, drivers, users, or administrative functions

### Administration
**Allowed Pages:**
- Full access to all pages except page restrictions
- `/dashboard`, `/vehicles`, `/drivers`, `/maintenance`, `/trips`, `/fuel`, `/incidents`, `/reports`, `/compliance`, `/disposal`, `/analytics`, `/users`

**Special Access:**
- Can manage users
- Can configure system settings

### Fleet Manager
**Allowed Pages:**
- `/dashboard` - Overview and analytics
- `/vehicles`, `/drivers`, `/maintenance`, `/trips`
- `/fuel`, `/incidents`, `/reports`, `/compliance`, `/disposal`, `/analytics`

**Restrictions:**
- Cannot access user management or page restrictions

### Client Company Liaison
**Allowed Pages:**
- `/dashboard` - Client-specific overview
- `/vehicles` - View client vehicles only
- `/reports` - Client-scoped reports
- `/compliance` - Client compliance documents

**Restrictions:**
- Limited to client-scoped data only

## How It Works

### 1. On Login
When a user successfully logs in:
1. The system retrieves their role from the database
2. Automatically redirects them to their role's default page
3. Shows their role badge in the header

### 2. On Page Access Attempt
When a user tries to access a page:
1. The system checks if their role permits access to that page
2. If **ALLOWED**: Page loads normally
3. If **DENIED**: 
   - User is automatically redirected to their default page
   - A notification appears: "You don't have access to that page. Redirected to your default page."

### 3. Navigation Menu
The sidebar dynamically shows only the pages the user has access to:
- Pages the user cannot access are automatically hidden
- No need to show "Access Denied" - they simply don't see restricted options

### 4. Unknown/Missing Role
If a user has no role assigned:
- Shows "No Role Assigned" message
- Prompts them to contact administrator
- Prevents access to any page except logout

## Implementation Files

### Core Files

**`src/utils/roleRedirects.ts`**
- Defines default pages for each role
- Contains `getRoleDefaultPage()` function
- Contains `checkRoleAccess()` function for access validation
- Maps roles to allowed page paths

**`src/App.tsx`**
- Implements automatic redirect logic via `useEffect` hooks
- Monitors active module changes
- Enforces role-based access on module switches
- Shows notifications when access is denied

**`src/components/ProtectedRoute.tsx`**
- Wraps each module with access control
- Shows "Access Denied" screen if needed
- Updated to inform users about automatic redirection

**`src/components/LoginPage.tsx`**
- Handles user authentication
- Triggers role-based redirect after successful login

## Testing the Implementation

### Test Case 1: Driver Login
1. Log in as a driver
2. **Expected**: Automatically redirected to `/trips` page
3. Try clicking on "Maintenance" (if visible)
4. **Expected**: Cannot access, redirected back to `/trips`

### Test Case 2: Maintenance Team Login
1. Log in as maintenance_team user
2. **Expected**: Automatically redirected to `/vehicles` page
3. Navigation menu shows only: Vehicles, Maintenance, Incidents
4. **Expected**: Other pages are hidden

### Test Case 3: Administration Login
1. Log in as administration user
2. **Expected**: Automatically redirected to `/dashboard`
3. **Expected**: Can access almost all pages
4. Try accessing any module
5. **Expected**: Full access granted

### Test Case 4: Unauthorized Access Attempt
1. Log in as driver
2. Manually try to navigate to user management
3. **Expected**: Automatically redirected to `/trips` with warning notification

## User Experience

### What Users See

**On Login:**
```
✓ Login successful
→ Redirected to [Your Default Page]
```

**On Unauthorized Access:**
```
⚠ Access Denied
You don't have access to that page. Redirected to your default page.
```

**Navigation:**
- Clean, focused menu showing only permitted pages
- No clutter from inaccessible options
- Role badge displayed next to username

## Security Features

1. **Client-Side Validation**: Immediate redirect prevents UI flash
2. **Server-Side Protection**: ProtectedRoute components enforce access
3. **Page Restrictions**: Database-driven page-level restrictions
4. **Role-Based Access Control (RBAC)**: Module-level permissions
5. **Session Management**: Automatic logout on session expiration

## Configuration

### Adding a New Role

1. **Define in rolePermissions.ts**:
```typescript
export const ROLE_DEFAULT_PAGES: Record<UserRole, string> = {
  // ... existing roles
  new_role: '/custom-page',
};
```

2. **Add access map in roleRedirects.ts**:
```typescript
const roleAccessMap: Record<UserRole, string[]> = {
  // ... existing roles
  new_role: ['/custom-page', '/vehicles'],
};
```

3. **Update module permissions** in `config/rolePermissions.ts`

### Changing Default Pages

Edit `src/utils/roleRedirects.ts`:
```typescript
export const ROLE_DEFAULT_PAGES: Record<UserRole, string> = {
  driver: '/new-driver-home',  // Changed from /trips
  // ...
};
```

## Troubleshooting

### User Not Redirecting on Login
- Check that user has a valid role assigned in database
- Verify `useRoleAccess()` hook is returning role data
- Check browser console for errors

### Access Denied Loop
- Verify role's default page is in their allowed pages list
- Check for typos in path names
- Ensure module has proper permissions configured

### Menu Not Filtering Correctly
- Verify `hasModuleAccess()` and `hasPageAccess()` are working
- Check page restrictions table in database
- Verify role permissions in `rolePermissions.ts`

## Best Practices

1. **Always use ProtectedRoute**: Wrap all module components
2. **Test with all roles**: Ensure each role works as expected
3. **Keep redirects user-friendly**: Show clear notifications
4. **Document role changes**: Update this file when adding roles
5. **Server-side validation**: Always validate on backend too

## Related Documentation

- [RBAC_IMPLEMENTATION_GUIDE.md](./RBAC_IMPLEMENTATION_GUIDE.md)
- [PAGE_RESTRICTIONS_MODULE.md](./PAGE_RESTRICTIONS_MODULE.md)
- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
