# Quick Fix for Your Vaccine Reminder Flow

## The Problem

Your loop is named `Apply_to_each` but all your expressions use `items('Loop_Through_Staff')`.
This mismatch causes the flow to fail.

---

## Option 1: Rename Your Loop (Easiest Fix)

1. In Power Automate, click on your **"Apply to each"** action
2. Click the **three dots (...)** menu in the top right of the action
3. Select **"Rename"**
4. Change the name to exactly: `Loop_Through_Staff`
5. Click **Save**

This will make all your existing expressions work!

---

## Option 2: Fix All Expressions (If You Keep "Apply_to_each")

If you want to keep the loop named "Apply_to_each", replace ALL occurrences of `Loop_Through_Staff` with `Apply_to_each`:

### Get_Today_EAT (Compose)
```
@startOfDay(convertTimeZone(utcNow(),'UTC','E. Africa Standard Time'))
```

### Calculate_days_until_SecondDose (Compose)
```
@if(empty(items('Apply_to_each')?['SecondDose']), -999, div(sub(ticks(items('Apply_to_each')?['SecondDose']),ticks(outputs('Get_Today_EAT'))),864000000000))
```

### Calculate_days_until_ThirdDose (Compose)
```
@if(empty(items('Apply_to_each')?['ThirdDose']), -999, div(sub(ticks(items('Apply_to_each')?['ThirdDose']),ticks(outputs('Get_Today_EAT'))),864000000000))
```

### Condition_7_Days_SecondDose
**Left side:** `@outputs('Calculate_days_until_SecondDose')`
**Operator:** `is equal to`
**Right side:** `7`

### Send_7_Day_SecondDose_Reminder Email
**To:**
```
@items('Apply_to_each')?['Email']
```

**Subject:**
```
Reminder: Your Second Vaccine Dose is in 7 Days
```

**Body:**
```html
<p>Dear @{items('Apply_to_each')?['StaffName']},</p>
<p>This is a friendly reminder that your <strong>second vaccine dose</strong> is scheduled for <strong>@{formatDateTime(items('Apply_to_each')?['SecondDose'], 'dddd, MMMM d, yyyy')}</strong> (7 days from now).</p>
<p>Please ensure you are available on this date.</p>
<p>Best regards,<br>NBI Hospital Health Team</p>
```

### Condition_3_Days_SecondDose
**Left side:** `@outputs('Calculate_days_until_SecondDose')`
**Operator:** `is equal to`
**Right side:** `3`

### Send_3_Day_SecondDose_Reminder Email
**To:**
```
@items('Apply_to_each')?['Email']
```

**Body:**
```html
<p>Dear @{items('Apply_to_each')?['StaffName']},</p>
<p>This is a reminder that your <strong>second vaccine dose</strong> is scheduled for <strong>@{formatDateTime(items('Apply_to_each')?['SecondDose'], 'dddd, MMMM d, yyyy')}</strong> (3 days from now).</p>
<p>Please make the necessary arrangements.</p>
<p>Best regards,<br>NBI Hospital Health Team</p>
```

### Condition_1_Day_SecondDose
**Left side:** `@outputs('Calculate_days_until_SecondDose')`
**Operator:** `is equal to`
**Right side:** `1`

### Send_1_Day_SecondDose_Reminder Email (IMPORTANT - Set Importance to High)
**To:**
```
@items('Apply_to_each')?['Email']
```

**Subject:**
```
TOMORROW: Your Second Vaccine Dose
```

**Body:**
```html
<p>Dear @{items('Apply_to_each')?['StaffName']},</p>
<p><strong>IMPORTANT:</strong> Your <strong>second vaccine dose</strong> is scheduled for <strong>TOMORROW</strong> (@{formatDateTime(items('Apply_to_each')?['SecondDose'], 'dddd, MMMM d, yyyy')}).</p>
<p>Please ensure you are ready for your vaccination.</p>
<p>Best regards,<br>NBI Hospital Health Team</p>
```

---

## Third Dose Expressions

### Condition_7_Days_ThirdDose
**Left side:** `@outputs('Calculate_days_until_ThirdDose')`
**Operator:** `is equal to`
**Right side:** `7`

### Send_7_Day_ThirdDose_Reminder Email
**To:**
```
@items('Apply_to_each')?['Email']
```

**Body:**
```html
<p>Dear @{items('Apply_to_each')?['StaffName']},</p>
<p>This is a friendly reminder that your <strong>third vaccine dose (booster)</strong> is scheduled for <strong>@{formatDateTime(items('Apply_to_each')?['ThirdDose'], 'dddd, MMMM d, yyyy')}</strong> (7 days from now).</p>
<p>Please ensure you are available on this date.</p>
<p>Best regards,<br>NBI Hospital Health Team</p>
```

### Condition_3_Days_ThirdDose
**Left side:** `@outputs('Calculate_days_until_ThirdDose')`
**Operator:** `is equal to`
**Right side:** `3`

### Send_3_Day_ThirdDose_Reminder Email
**To:**
```
@items('Apply_to_each')?['Email']
```

**Body:**
```html
<p>Dear @{items('Apply_to_each')?['StaffName']},</p>
<p>This is a reminder that your <strong>third vaccine dose (booster)</strong> is scheduled for <strong>@{formatDateTime(items('Apply_to_each')?['ThirdDose'], 'dddd, MMMM d, yyyy')}</strong> (3 days from now).</p>
<p>Please make the necessary arrangements.</p>
<p>Best regards,<br>NBI Hospital Health Team</p>
```

### Condition_1_Day_ThirdDose
**Left side:** `@outputs('Calculate_days_until_ThirdDose')`
**Operator:** `is equal to`
**Right side:** `1`

### Send_1_Day_ThirdDose_Reminder Email (IMPORTANT - Set Importance to High)
**To:**
```
@items('Apply_to_each')?['Email']
```

**Subject:**
```
TOMORROW: Your Third Vaccine Dose (Booster)
```

**Body:**
```html
<p>Dear @{items('Apply_to_each')?['StaffName']},</p>
<p><strong>IMPORTANT:</strong> Your <strong>third vaccine dose (booster)</strong> is scheduled for <strong>TOMORROW</strong> (@{formatDateTime(items('Apply_to_each')?['ThirdDose'], 'dddd, MMMM d, yyyy')}).</p>
<p>Please ensure you are ready for your vaccination.</p>
<p>Best regards,<br>NBI Hospital Health Team</p>
```

---

## Flow Structure (Correct Order)

```
Recurrence (Daily at 8:00 AM EAT)
│
├── Get_items (Get all staff from SharePoint)
│
├── Get_Today_EAT (Compose - get today's date in EAT)
│
└── Apply_to_each (Loop through each staff member)
    │
    ├── Calculate_days_until_SecondDose
    │
    ├── Calculate_days_until_ThirdDose
    │
    ├── Condition: SecondDose = 7 days?
    │   └── Yes: Send 7-day SecondDose email
    │
    ├── Condition: SecondDose = 3 days?
    │   └── Yes: Send 3-day SecondDose email
    │
    ├── Condition: SecondDose = 1 day?
    │   └── Yes: Send 1-day SecondDose email
    │
    ├── Condition: ThirdDose = 7 days?
    │   └── Yes: Send 7-day ThirdDose email
    │
    ├── Condition: ThirdDose = 3 days?
    │   └── Yes: Send 3-day ThirdDose email
    │
    └── Condition: ThirdDose = 1 day?
        └── Yes: Send 1-day ThirdDose email
```

---

## Testing Your Flow

1. **Test with a specific record**: Update one staff member's SecondDose to tomorrow's date
2. **Run the flow manually**: Click "Test" > "Manually" > "Run flow"
3. **Check the run history**: Verify each action succeeded
4. **Check your email**: Confirm the reminder was received

---

## Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| "ticks expects a string" | Date field is null or wrong type | Use the `if(empty(...))` wrapper in the expression |
| "Action not found" | Loop name mismatch | Rename loop to match expression OR update expression |
| "Invalid template" | Syntax error in expression | Copy expression exactly as shown above |
| Email not sending | Condition never true | Check if days calculation returns integer (not decimal) |
