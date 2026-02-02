# Admin Guide: Managing Live Driver Tracking Access

## Quick Start for Administrators

### Initial Setup (One-Time)

**1. Run Database Migration**
```bash
# In Supabase SQL Editor, execute:
migrations/add_live_tracking_page.sql
```

**2. Verify Installation**
- Login as Administrator
- Check that "Page Access" appears in navigation
- Click "Page Access"
- Find "Live Driver Tracking" in the list ✅

---

## Managing Access via UI

### To Grant/Revoke Role-Based Access

**Step 1**: Navigate to Page Access
- Login as Administrator or Fleet Manager
- Click **"Page Access"** in the left navigation menu

**Step 2**: Find Live Driver Tracking
- Scroll through the table or use browser search (Ctrl+F)
- Look for "Live Driver Tracking" with path `/live-tracking`

**Step 3**: Edit Permissions
- Click the **"Edit"** button on that row
- You'll see checkboxes for each role:

```
☑ Fleet Manager           - Recommended ✅ (monitors fleet)
☐ Maintenance Team        - Usually unchecked ❌
☐ Driver                  - Usually unchecked ❌ (privacy)
☑ Administration          - Recommended ✅ (full access)
☐ Client-Company Liaison  - Usually unchecked ❌
```

**Step 4**: Save Changes
- Click **"Update Restriction"**
- Changes are **immediate** - no restart needed
- Users will see/lose menu item on next page load

---

## Default Configuration

### Who Has Access (After Migration)

| Role | Access | Reason |
|------|--------|--------|
| **Fleet Manager** | ✅ Yes | Needs to monitor fleet vehicles |
| **Administration** | ✅ Yes | Full system access |
| **Maintenance Team** | ❌ No | Doesn't need real-time tracking |
| **Driver** | ❌ No | Privacy - shouldn't see other drivers |
| **Client Liaison** | ❌ No | External facing role |

---

## Common Admin Tasks

### Task 1: Give All Maintenance Team Access
1. Go to **Page Access**
2. Edit **"Live Driver Tracking"**
3. Check ☑ **Maintenance Team**
4. Click **Update Restriction**

**Result**: All users with `maintenance_team` role can now access Live Tracking

### Task 2: Remove Access from Fleet Managers
1. Go to **Page Access**
2. Edit **"Live Driver Tracking"**
3. Uncheck ☐ **Fleet Manager**
4. Click **Update Restriction**

**Result**: Fleet Managers lose access (unless they have user-specific override)

### Task 3: Temporarily Disable Live Tracking for Everyone
1. Go to **Page Access**
2. Edit **"Live Driver Tracking"**
3. Uncheck ☐ **Active** at the bottom
4. Click **Update Restriction**

**Result**: Page completely hidden for everyone

---

## Verification & Testing

### Verify Access is Working

**Test 1: Check as Fleet Manager**
1. Logout
2. Login as a user with `fleet_manager` role
3. Check navigation menu - should see "Live Tracking" ✅

**Test 2: Check as Driver**
1. Logout
2. Login as a user with `driver` role
3. Check navigation menu - should NOT see "Live Tracking" ❌

### SQL Queries for Verification

**Check current role permissions**:
```sql
SELECT 
  page_name,
  fleet_manager_access,
  maintenance_team_access,
  driver_access,
  administration_access,
  client_company_liaison_access,
  is_active
FROM page_restrictions
WHERE page_path = '/live-tracking';
```

**See all users who can access** (by role):
```sql
-- Users with role-based access
SELECT 
  u.email,
  u.role,
  'Role Permission' as access_type
FROM users u
JOIN page_restrictions pr ON 
  (u.role = 'fleet_manager' AND pr.fleet_manager_access) OR
  (u.role = 'administration' AND pr.administration_access) OR
  (u.role = 'maintenance_team' AND pr.maintenance_team_access) OR
  (u.role = 'driver' AND pr.driver_access) OR
  (u.role = 'client_company_liaison' AND pr.client_company_liaison_access)
WHERE pr.page_path = '/live-tracking' AND pr.is_active = true
ORDER BY u.email;
```

---

## Troubleshooting

### Problem: User can't see Live Tracking

**Check 1**: Verify user's role
```sql
SELECT email, role FROM users WHERE email = 'user@example.com';
```

**Check 2**: Verify role has access
```sql
SELECT 
  CASE 
    WHEN role = 'fleet_manager' THEN fleet_manager_access
    WHEN role = 'administration' THEN administration_access
    WHEN role = 'maintenance_team' THEN maintenance_team_access
    WHEN role = 'driver' THEN driver_access
    WHEN role = 'client_company_liaison' THEN client_company_liaison_access
  END as has_access
FROM page_restrictions pr
CROSS JOIN (SELECT 'fleet_manager' as role) u  -- Replace with actual role
WHERE pr.page_path = '/live-tracking';
```

**Check 3**: Check if page is active
```sql
SELECT is_active FROM page_restrictions WHERE page_path = '/live-tracking';
```

**Solution**: Edit the page restriction to grant their role access

### Problem: User has access but shouldn't

**Check 1**: Check role permission
```sql
SELECT * FROM page_restrictions WHERE page_path = '/live-tracking';
```

**Solution**: Edit via UI to uncheck their role

### Problem: Changes not taking effect

**Solution 1**: User needs to refresh browser (Ctrl+R or F5)

**Solution 2**: Check browser console for errors:
- Press F12
- Go to "Console" tab
- Look for red error messages
- Check for "Access denied" or "RLS policy" errors

**Solution 3**: Verify RLS policies exist:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'page_restrictions';
```

---

## Security Best Practices

### ✅ DO:
- Grant access to supervisory roles (Fleet Manager, Administration)
- Use role-based access for managing user permissions
- Regularly audit who has access
- Test changes with test accounts before applying to production

### ❌ DON'T:
- Give all drivers access to see each other's locations (privacy concern)
- Grant access to client liaisons unless specifically needed
- Leave inactive restrictions active
- Modify RLS policies directly without understanding security implications

---

## Access Control Hierarchy

```
Access Control:
┌─────────────────────────────────────────┐
│ Role-Based Access (page_restrictions)  │
│ - Applied to all users with that role  │
│ - Managed via Page Access UI           │
│ - ONLY method of access control        │
└─────────────────────────────────────────┘
             ↓ (if denied)
┌─────────────────────────────────────────┐
│ Default Deny                            │
│ - No access if role not granted         │
└─────────────────────────────────────────┘
```

**Example Scenarios**:

| User Email | Role | Role Access | Final Result |
|------------|------|-------------|--------------|
| john@ex.com | driver | ❌ No | ❌ **No Access** |
| mary@ex.com | fleet_manager | ✅ Yes | ✅ **Can Access** (role) |
| bob@ex.com | maintenance_team | ❌ No | ❌ **No Access** (default deny) |
| admin@ex.com | administration | ✅ Yes | ✅ **Can Access** (role) |

---

## Quick Reference Commands

### View Current Configuration
```sql
SELECT * FROM page_restrictions WHERE page_path = '/live-tracking';
```

### Grant Role Access (via SQL)
```sql
UPDATE page_restrictions
SET fleet_manager_access = true
WHERE page_path = '/live-tracking';
```

### Revoke All Access
```sql
-- Disable page completely
UPDATE page_restrictions
SET is_active = false
WHERE page_path = '/live-tracking';
```

### Audit Who Has Access
```sql
-- Run the "See all users who can access" query from Verification section above
```

---

## Support

For additional help:
1. Check [LIVE_TRACKING_SETUP_GUIDE.md](LIVE_TRACKING_SETUP_GUIDE.md) for detailed documentation
2. Verify database migration was executed successfully
3. Check Supabase logs for RLS policy errors
4. Test with a known working account first

---

## Summary Checklist

- [ ] Database migration executed
- [ ] "Live Driver Tracking" appears in Page Access table
- [ ] Fleet Manager role has access ✅
- [ ] Administration role has access ✅
- [ ] Driver role does NOT have access ❌
- [ ] Tested with Fleet Manager account
- [ ] Tested with Driver account (should not see it)
- [ ] Changes take effect immediately after editing

**All set! The Live Tracking page is now manageable through your Page Access control panel.** 🎉
