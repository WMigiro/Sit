# Power Automate Vaccine Reminder Flow - Fix Guide

## Overview of Issues Found

Your current flow has these problems:
1. Date comparison uses string equality which is unreliable
2. Missing 3-day reminder (you have 2 days instead of 3)
3. No logic for Third Dose reminders
4. Potential timezone issues

---

## Step-by-Step Fix Instructions

### Step 1: Fix the Recurrence Trigger

**Current:** Runs daily at 4:00 AM UTC (which is 7:00 AM EAT)

**Fix for East Africa Time (UTC+3):**

1. Click on your **Recurrence** trigger
2. Click **Edit** or expand the trigger settings
3. Set the following:
   - **Interval:** 1
   - **Frequency:** Day
   - **Time zone:** Select `(UTC+03:00) Nairobi` or `E. Africa Standard Time`
   - **At these hours:** 8 (for 8:00 AM EAT)
   - **At these minutes:** 0

**Important:** East Africa Time does NOT observe Daylight Saving Time, so `E. Africa Standard Time` is consistent year-round.

---

### Step 2: Fix the "Get Items" Filter Query for Second Dose

**Replace your current Filter Query with this:**

```
SecondDose ne null
```

**Why?** We'll handle the date logic in a Condition action instead, which is more reliable than OData filtering for complex date comparisons.

---

### Step 3: Add a Condition Inside "For Each" to Check Days Until Second Dose

After the "For each" action, add **two Compose** actions:

**Action 1:** Compose  
**Name:** `Get_Today_EAT`  
**Inputs:**
```
@{startOfDay(convertTimeZone(utcNow(), 'UTC', 'E. Africa Standard Time'))}
```

**Action 2:** Compose  
**Name:** `Calculate_Days_Until_SecondDose`  
**Inputs:**
```
@{div(sub(ticks(items('For_each')?['SecondDose']),ticks(outputs('Get_Today_EAT'))),864000000000)}
```

This calculates the number of days between today (in East Africa Time) and the SecondDose date.

---

### Step 4: Add Condition for 7-Day Reminder

**Action:** Condition  
**Name:** `Check_7_Days_Before_SecondDose`

**Condition:**
```
@equals(outputs('Calculate_Days_Until_SecondDose'), 7)
```

**If Yes - Send Email:**
- **To:** `@{items('For_each')?['Email']}`
- **Subject:** `Reminder: Your Second Vaccine Dose is in 7 Days`
- **Body:**
```html
<p>Dear @{items('For_each')?['FullName']},</p>

<p>This is a reminder that your <strong>second vaccine dose</strong> is scheduled for:</p>

<p><strong>Date:</strong> @{formatDateTime(items('For_each')?['SecondDose'], 'dddd, MMMM d, yyyy')}</p>

<p>Please make sure to:</p>
<ul>
  <li>Bring your vaccination card</li>
  <li>Arrive 15 minutes early</li>
  <li>Wear a mask</li>
</ul>

<p>Thank you for helping keep our community safe!</p>
```

---

### Step 5: Add Condition for 3-Day Reminder

**Action:** Condition  
**Name:** `Check_3_Days_Before_SecondDose`

**Condition:**
```
@equals(outputs('Calculate_Days_Until_SecondDose'), 3)
```

**If Yes - Send Email:**
- **To:** `@{items('For_each')?['Email']}`
- **Subject:** `Reminder: Your Second Vaccine Dose is in 3 Days`
- **Body:**
```html
<p>Dear @{items('For_each')?['FullName']},</p>

<p>This is a friendly reminder that your <strong>second vaccine dose</strong> is coming up in <strong>3 days</strong>:</p>

<p><strong>Date:</strong> @{formatDateTime(items('For_each')?['SecondDose'], 'dddd, MMMM d, yyyy')}</p>

<p>Please ensure you have made the necessary arrangements to attend.</p>

<p>Thank you!</p>
```

---

### Step 6: Add Condition for 1-Day Reminder

**Action:** Condition  
**Name:** `Check_1_Day_Before_SecondDose`

**Condition:**
```
@equals(outputs('Calculate_Days_Until_SecondDose'), 1)
```

**If Yes - Send Email:**
- **To:** `@{items('For_each')?['Email']}`
- **Subject:** `TOMORROW: Your Second Vaccine Dose`
- **Body:**
```html
<p>Dear @{items('For_each')?['FullName']},</p>

<p><strong>Your second vaccine dose is TOMORROW!</strong></p>

<p><strong>Date:</strong> @{formatDateTime(items('For_each')?['SecondDose'], 'dddd, MMMM d, yyyy')}</p>

<p>Important reminders:</p>
<ul>
  <li>Bring your vaccination card</li>
  <li>Arrive 15 minutes before your appointment</li>
  <li>Wear comfortable clothing with easy arm access</li>
  <li>Stay hydrated</li>
</ul>

<p>See you tomorrow!</p>
```

---

## Step 7: Add Third Dose Logic

**Option A: Duplicate the entire logic for ThirdDose**

Add another "Get items" action after the SecondDose logic:

**Action:** Get items  
**Name:** `Get_Items_ThirdDose`  
**Site Address:** (your SharePoint site)  
**List Name:** (your list name)  
**Filter Query:**
```
ThirdDose ne null
```

Then repeat Steps 3-6, but replace:
- `SecondDose` with `ThirdDose`
- `Calculate_Days_Until_SecondDose` with `Calculate_Days_Until_ThirdDose`
- Update email subjects to say "Third Vaccine Dose"

---

## Alternative: Simplified Single Filter Approach

If you prefer to keep the OData filter approach, use this corrected filter:

**For SecondDose (7, 3, and 1 day reminders):**
```
SecondDose ge '@{formatDateTime(startOfDay(addDays(utcNow(),1)),'yyyy-MM-ddTHH:mm:ssZ')}' and SecondDose le '@{formatDateTime(startOfDay(addDays(utcNow(),8)),'yyyy-MM-ddTHH:mm:ssZ')}'
```

This gets all items where SecondDose is between 1 and 7 days from now, then you filter the specific days (1, 3, 7) inside the loop.

---

## Complete Flow Structure

```
Recurrence (Daily at 8 AM local time)
│
├── Get items (SecondDose ne null)
│   └── For each (SecondDose items)
│       ├── Compose: Calculate days until SecondDose
│       ├── Condition: 7 days?
│       │   └── Yes: Send 7-day email
│       ├── Condition: 3 days?
│       │   └── Yes: Send 3-day email
│       └── Condition: 1 day?
│           └── Yes: Send 1-day email
│
└── Get items (ThirdDose ne null)
    └── For each (ThirdDose items)
        ├── Compose: Calculate days until ThirdDose
        ├── Condition: 7 days?
        │   └── Yes: Send 7-day email
        ├── Condition: 3 days?
        │   └── Yes: Send 3-day email
        └── Condition: 1 day?
            └── Yes: Send 1-day email
```

---

## Testing Your Flow

1. **Test Mode:** Use the "Test" button in Power Automate
2. **Add test data:** Create a SharePoint item with SecondDose set to tomorrow, 3 days, and 7 days from now
3. **Check run history:** Look at the flow run history to see which conditions passed/failed
4. **Verify emails:** Check if test emails are received

---

## Common Errors and Solutions

| Error | Solution |
|-------|----------|
| "Invalid template" | Check for missing `@` symbols or incorrect curly braces |
| "The expression is invalid" | Verify column names match exactly (case-sensitive) |
| No emails sent | Check if filter returns items; verify email addresses exist |
| Wrong dates | Ensure date columns in SharePoint are Date type, not Text |
| Timezone issues | Use `convertTimeZone()` function to convert dates |

---

## Expression Reference (East Africa Time)

**Get current time in EAT:**
```
@{convertTimeZone(utcNow(), 'UTC', 'E. Africa Standard Time')}
```

**Get today's date at midnight (EAT):**
```
@{startOfDay(convertTimeZone(utcNow(), 'UTC', 'E. Africa Standard Time'))}
```

**Add days to current EAT date:**
```
@{addDays(convertTimeZone(utcNow(), 'UTC', 'E. Africa Standard Time'), 7)}
```

**Format date for display (user-friendly):**
```
@{formatDateTime(items('For_each')?['SecondDose'], 'dddd, MMMM d, yyyy')}
```
Output example: `Monday, March 20, 2026`

**Calculate days between dates (EAT-aware):**
```
@{div(sub(ticks(futureDate),ticks(startOfDay(convertTimeZone(utcNow(), 'UTC', 'E. Africa Standard Time')))),864000000000)}
```

**Timezone identifier for East Africa:**
- Power Automate: `E. Africa Standard Time`
- Alternative: `(UTC+03:00) Nairobi`
- Offset: UTC+3 (no daylight saving changes)
