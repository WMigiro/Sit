# Vaccine Reminder Flow - Step-by-Step Build Guide

## Overview
This flow sends email reminders 7 days, 3 days, and 1 day before SecondDose and ThirdDose dates.

---

## STEP 1: Create New Flow

1. Go to [Power Automate](https://make.powerautomate.com)
2. Click **+ Create** → **Scheduled cloud flow**
3. Name it: `Vaccine Dose Reminder`
4. Set:
   - **Starting:** Today's date
   - **Repeat every:** 1 Day
5. Click **Create**

---

## STEP 2: Configure the Trigger

1. Click on the **Recurrence** trigger
2. Click **Edit**
3. Set:
   - **Interval:** `1`
   - **Frequency:** `Day`
   - **Time zone:** `(UTC+03:00) Nairobi`
   - **At these hours:** `8`
   - **At these minutes:** `0`

---

## STEP 3: Add "Get Today's Date" (Compose)

1. Click **+ New step**
2. Search for **Compose** and select it
3. Rename it to: `Get_Today_EAT`
4. In **Inputs**, paste:
```
@{startOfDay(convertTimeZone(utcNow(),'UTC','E. Africa Standard Time'))}
```

---

## STEP 4: Add "Get Items" (SharePoint)

1. Click **+ New step**
2. Search for **SharePoint - Get items**
3. Configure:
   - **Site Address:** Select your SharePoint site
   - **List Name:** Select your vaccination list
   - **Filter Query:** `SecondDose ne null or ThirdDose ne null`

---

## STEP 5: Add "Apply to each" Loop

1. Click **+ New step**
2. Search for **Apply to each** (under Control)
3. Rename it to: `Loop_Through_Staff`
4. In **Select an output from previous steps**, select: `value` from Get items

---

## STEP 6: Inside the Loop - Calculate Days Until SecondDose

1. Inside the loop, click **Add an action**
2. Search for **Compose**
3. Rename it to: `Calculate_Days_Until_SecondDose`
4. In **Inputs**, paste:
```
@{if(empty(items('Loop_Through_Staff')?['SecondDose']), -999, div(sub(ticks(items('Loop_Through_Staff')?['SecondDose']),ticks(outputs('Get_Today_EAT'))),864000000000))}
```

---

## STEP 7: Inside the Loop - Calculate Days Until ThirdDose

1. Inside the loop, click **Add an action**
2. Search for **Compose**
3. Rename it to: `Calculate_Days_Until_ThirdDose`
4. In **Inputs**, paste:
```
@{if(empty(items('Loop_Through_Staff')?['ThirdDose']), -999, div(sub(ticks(items('Loop_Through_Staff')?['ThirdDose']),ticks(outputs('Get_Today_EAT'))),864000000000))}
```

---

## STEP 8: Add Condition for SecondDose - 7 Days

1. Inside the loop, click **Add an action**
2. Search for **Condition** (under Control)
3. Rename it to: `Check_SecondDose_7_Days`
4. Configure the condition:
   - Click in the first box, then click **Expression** tab
   - Paste: `outputs('Calculate_Days_Until_SecondDose')`
   - Click **OK**
   - Set operator to: `is equal to`
   - In the second box, type: `7`

5. In the **If yes** branch, add **Send an email (V2)**:
   - **To:** Click Expression, paste: `items('Loop_Through_Staff')?['Email']`
   - **Subject:** `Reminder: Your Second Vaccine Dose in 7 Days`
   - **Body:**
```html
<p>Dear @{items('Loop_Through_Staff')?['StaffName']},</p>
<p>This is a friendly reminder that your <strong>second vaccination dose</strong> is scheduled for:</p>
<p><strong>Date: @{formatDateTime(items('Loop_Through_Staff')?['SecondDose'], 'dddd, MMMM d, yyyy')}</strong></p>
<p>Please mark your calendar and ensure you visit the staff clinic on the scheduled date.</p>
<p>Your health and safety are our priority.</p>
<p>Best regards,<br>Staff Clinic Team</p>
```

---

## STEP 9: Add Condition for SecondDose - 3 Days

1. Add another **Condition** after the 7-day check
2. Rename it to: `Check_SecondDose_3_Days`
3. Configure:
   - Expression: `outputs('Calculate_Days_Until_SecondDose')`
   - Operator: `is equal to`
   - Value: `3`

4. In **If yes**, add **Send an email (V2)**:
   - **To:** `@{items('Loop_Through_Staff')?['Email']}`
   - **Subject:** `Reminder: Your Second Vaccine Dose in 3 Days`
   - **Body:**
```html
<p>Dear @{items('Loop_Through_Staff')?['StaffName']},</p>
<p>This is a reminder that your <strong>second vaccination dose</strong> is coming up in <strong>3 days</strong>:</p>
<p><strong>Date: @{formatDateTime(items('Loop_Through_Staff')?['SecondDose'], 'dddd, MMMM d, yyyy')}</strong></p>
<p>Please ensure you are available to visit the staff clinic on the scheduled date.</p>
<p>Best regards,<br>Staff Clinic Team</p>
```

---

## STEP 10: Add Condition for SecondDose - 1 Day (Tomorrow)

1. Add another **Condition**
2. Rename it to: `Check_SecondDose_1_Day`
3. Configure:
   - Expression: `outputs('Calculate_Days_Until_SecondDose')`
   - Operator: `is equal to`
   - Value: `1`

4. In **If yes**, add **Send an email (V2)**:
   - **To:** `@{items('Loop_Through_Staff')?['Email']}`
   - **Subject:** `TOMORROW: Your Second Vaccine Dose`
   - **Importance:** `High`
   - **Body:**
```html
<p>Dear @{items('Loop_Through_Staff')?['StaffName']},</p>
<p><strong>Your second vaccination dose is TOMORROW!</strong></p>
<p><strong>Date: @{formatDateTime(items('Loop_Through_Staff')?['SecondDose'], 'dddd, MMMM d, yyyy')}</strong></p>
<p>Please visit the staff clinic tomorrow for your vaccination. Do not forget to bring your ID and vaccination card.</p>
<p>Best regards,<br>Staff Clinic Team</p>
```

---

## STEP 11: Repeat Steps 8-10 for ThirdDose

Add three more conditions for ThirdDose using the same pattern:

### Check_ThirdDose_7_Days
- Expression: `outputs('Calculate_Days_Until_ThirdDose')`
- Value: `7`
- Subject: `Reminder: Your Third Vaccine Dose in 7 Days`

### Check_ThirdDose_3_Days
- Expression: `outputs('Calculate_Days_Until_ThirdDose')`
- Value: `3`
- Subject: `Reminder: Your Third Vaccine Dose in 3 Days`

### Check_ThirdDose_1_Day
- Expression: `outputs('Calculate_Days_Until_ThirdDose')`
- Value: `1`
- Subject: `TOMORROW: Your Third Vaccine Dose`
- Importance: `High`

**For ThirdDose emails, change the body to reference ThirdDose:**
```
@{formatDateTime(items('Loop_Through_Staff')?['ThirdDose'], 'dddd, MMMM d, yyyy')}
```

---

## STEP 12: Save and Test

1. Click **Save**
2. Click **Test** → **Manually** → **Test**
3. Check the run history for any errors

---

## Final Flow Structure

```
Recurrence (Daily at 8 AM EAT)
    │
    ▼
Get_Today_EAT (Compose)
    │
    ▼
Get_Vaccination_Records (SharePoint Get Items)
    │
    ▼
Loop_Through_Staff (Apply to each)
    │
    ├── Calculate_Days_Until_SecondDose
    ├── Calculate_Days_Until_ThirdDose
    │
    ├── Check_SecondDose_7_Days → Email (if 7 days)
    ├── Check_SecondDose_3_Days → Email (if 3 days)
    ├── Check_SecondDose_1_Day → Email (if 1 day)
    │
    ├── Check_ThirdDose_7_Days → Email (if 7 days)
    ├── Check_ThirdDose_3_Days → Email (if 3 days)
    └── Check_ThirdDose_1_Day → Email (if 1 day)
```

---

## Troubleshooting

### Error: "The template language function 'ticks' expects its parameter to be a string"
- Your date column might be empty for some records
- The `if(empty(...), -999, ...)` wrapper handles this - make sure you copied it exactly

### Error: "Action referenced by 'inputs' not defined"
- Make sure all action names match EXACTLY (including underscores)
- The loop must be named `Loop_Through_Staff`

### Emails not sending
- Check that the Email column has valid email addresses
- Verify the SharePoint connection is working
- Check the date format in your SharePoint list (should be Date/Time type)

### Wrong dates
- Ensure your SharePoint Date columns are set to "Date and Time" type, not "Single line of text"
- Check that dates in SharePoint are in the future

---

## Required SharePoint Columns

Your SharePoint list must have these columns:
| Column Name | Type | Description |
|-------------|------|-------------|
| StaffName | Single line of text | Employee name |
| Email | Single line of text | Employee email address |
| SecondDose | Date and Time | Date of second vaccine dose |
| ThirdDose | Date and Time | Date of third vaccine dose |
