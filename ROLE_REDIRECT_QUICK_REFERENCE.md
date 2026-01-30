# Role-Based Redirect - Quick Reference

## Default Pages by Role

```
driver              → /trips
administration      → /dashboard
maintenance_team    → /vehicles
fleet_manager       → /dashboard
client_company_liaison → /dashboard
```

## Allowed Pages by Role

### Driver
✓ /trips, /vehicles, /fuel, /incidents
✗ All other pages

### Maintenance Team
✓ /vehicles, /maintenance, /incidents
✗ All other pages

### Administration
✓ All pages except page restrictions
✗ None (full access)

### Fleet Manager
✓ /dashboard, /vehicles, /drivers, /maintenance, /trips, /fuel, /incidents, /reports, /compliance, /disposal, /analytics
✗ /users, /page-restrictions

### Client Company Liaison
✓ /dashboard, /vehicles, /reports, /compliance (client-scoped only)
✗ All other pages

## Key Features

1. **Automatic Redirect on Login**: Users land on their role's default page
2. **Automatic Redirect on Unauthorized Access**: Attempts to access restricted pages redirect to default
3. **Notification on Block**: "You don't have access to that page. Redirected to your default page."
4. **Hidden Navigation**: Users only see menu items they can access
5. **No Role = No Access**: Users without roles see "No Role Assigned" message

## Implementation Files

- `src/utils/roleRedirects.ts` - Role default pages and access mapping
- `src/App.tsx` - Automatic redirect logic
- `src/components/ProtectedRoute.tsx` - Access control wrapper
- `src/components/LoginPage.tsx` - Login with redirect

## Quick Test

1. **Test Driver Role**:
   ```
   Login as driver → Should see /trips page
   Try accessing /maintenance → Redirected to /trips
   ```

2. **Test Administration Role**:
   ```
   Login as admin → Should see /dashboard
   Can access all pages ✓
   ```

3. **Test Unknown Role**:
   ```
   Login with no role → "No Role Assigned" screen
   ```

## Modifying Redirects

Edit `src/utils/roleRedirects.ts`:

```typescript
// Change default page
export const ROLE_DEFAULT_PAGES: Record<UserRole, string> = {
  driver: '/new-page',  // Change here
};

// Change allowed pages
const roleAccessMap: Record<UserRole, string[]> = {
  driver: ['/new-page', '/vehicles'],  // Update here
};
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Not redirecting | Check user has valid role in database |
| Access denied loop | Ensure default page is in allowed list |
| Wrong page shown | Verify path mappings in App.tsx |
| Menu not filtering | Check hasModuleAccess() and hasPageAccess() |

## Documentation

Full details: [ROLE_BASED_REDIRECT_GUIDE.md](./ROLE_BASED_REDIRECT_GUIDE.md)
