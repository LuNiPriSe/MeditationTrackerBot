# MeditationTrackerBot 🌱

A bilingual Telegram meditation community bot built on Google Apps Script that helps nurture daily meditation practice, provides supportive insights, and sends gentle daily reminders. Transform your meditation journey into a collaborative, spiritual experience.

![Bot Icon](DhammaBotIcon.png)

## Features

### 🌍 Bilingual Support

- **English** and **Spanish** interface
- Automatic language detection based on commands
- Consistent bilingual responses and analytics

### 🌸 Meditation Sharing

- **Morning Sessions** (`/morning` / `/mañana`) - Share your morning meditation
- **Evening Sessions** (`/evening` / `/tarde`) - Share your evening meditation
- Automatic timestamp recording with gratitude
- Sacred session history storage
- Gentle duplicate session prevention

### 🌿 Community Insights & Growth

- **Daily Vibrations** (`/dailyvibrations` / `/vibreshoy`) - Feel today's community energy with visual energy bars
- **Our Gift** (`/ourgift` / `/nuestroregalo`) - View our collective offering to the world with visual growth patterns
- **My Growth** (`/mygrowth` / `/micrecimiento`) - Reflect on your personal flowering with visual growth tracking
- Collective dedication visualization instead of competition metrics
- Beautiful souls participation celebration
- Supportive visual progress bars for all insight commands

### 🎨 Enhanced Visual Interface

- **Dot-based Progress Bars**: Visual representation using filled (●) and empty (○) dots
- **Consistent Formatting**: Icon → Progress Bar → Percentage → Category Name → User List
- **Full-width Completion Bars**: Enhanced visibility for overall completion rates
- **Clean User Display**: Simple, readable username and name lists
- **Bilingual Visual Elements**: Consistent formatting across English and Spanish interfaces

### 🔔 Automated Reminders

- **Daily morning reminders** at 8:00 AM 🌞
- **Daily evening reminders** at 8:00 PM 🌙
- Sent to all registered chats automatically
- Customizable timing via Google Apps Script triggers

### 🔐 User Management

- Registration system via `/start` command
- Telegram user ID-based tracking (privacy-safe)
- Chat ID registration for group reminders
- Duplicate registration prevention
- Unregistered user handling

## Commands

| English            | Spanish          | Description                               |
| ------------------ | ---------------- | ----------------------------------------- |
| `/start`           | `/start`         | Join our meditation community             |
| `/help`            | `/ayuda`         | Show available commands                   |
| `/morning`         | `/mañana`        | Share your morning meditation session     |
| `/evening`         | `/tarde`         | Share your evening meditation session     |
| `/dailyvibrations` | `/vibreshoy`     | Feel today's community energy             |
| `/ourgift`         | `/nuestroregalo` | View our collective offering to the world |
| `/mygrowth`        | `/micrecimiento` | Reflect on your personal flowering        |

## Example Output

### Daily Vibrations Command (`/dailyvibrations`)

```
🌸 Our Community Journey (2025-01-07)
🤗 Meditators in our community: 6

🌟 ●○○○○○○○○○ 17% Both daily practices
@meditator1

🌅 ●○○○○○○○○○ 17% Morning practice
@user2

🌙 ●●●●●○○○○○ 50% Evening practice
@peacekeeper, @mindful_soul, @zenmaster

🌱 ●○○○○○○○○○ 17% Awaiting their peaceful moment
@seeker

💚 Today's collective dedication
●●●●●●●●●●○○○○○○○○○○ 50%
```

### Our Gift Command (`/ourgift`)

```
🌿 Our Collective Meditation Insights

🤗 Beautiful souls in our community: 6
🌱 Total days of growth together: 42

Our beautiful community pattern:
🌟 ●●○○○○○○○○ 17% Days with both practices
🌅 ●●○○○○○○○○ 17% Days of morning practice
🌙 ●●●●●○○○○○ 50% Days of evening practice
🌱 ●●○○○○○○○○ 17% Days of rest and reflection

💚 Our collective dedication to inner growth
●●●●●●●●●●●○○○○○○○○○ 57%

Together we cultivate peace, compassion, and wisdom 🙏✨
```

### My Growth Command (`/mygrowth`)

```
🦋 Your Personal Meditation Reflection

Days of inner growth: 7

Your beautiful practice pattern:
🌟 ●●○○○○○○○○ 29% Days with both practices
🌅 ●○○○○○○○○○ 14% Days of morning practice
🌙 ●●●●○○○○○○ 43% Days of evening practice
🌱 ●○○○○○○○○○ 14% Days of rest

💚 Your dedication to inner growth
●●●●●●●●●●●●●●○○○○○○ 71%

Every moment of meditation is a gift to yourself 🙏✨
```

## Setup Instructions

### Prerequisites

1. **Telegram Bot**: Create via [@BotFather](https://t.me/botfather) on Telegram
2. **Google Account**: Access to [Google Apps Script](https://script.google.com)
3. **Google Sheets**: Document for data storage via [Google Sheets](https://sheets.google.com)

### Step 1: Create Google Sheets Document

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
   Example: `1ABC123def456GHI789jkl012MNO345pqr678STU901vwx234YZ`

### Step 2: Configure Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Replace the default code with `MeditationTrackerBot.js`
4. **Configure the constants** at the top of the script:
   ```javascript
   const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_FROM_BOTFATHER";
   const SHEET_ID = "YOUR_GOOGLE_SHEETS_ID_FROM_STEP_1";
   ```

### Step 3: Run Setup Functions

Execute these functions in Google Apps Script (Run > Function):

1. **`setupSheet()`** - Creates proper column headers in your Google Sheet:

   - **For new installations**: Date, User ID, First Name, Username, Morning Time, Evening Time
   - **Note**: If updating from older version, run migration instead

2. **`setupReminders()`** - Configures automated daily reminders:
   - Morning reminder at 8:00 AM
   - Evening reminder at 8:00 PM
   - Automatically sends to all registered chats

### Step 4: Deploy the Bot

1. In Google Apps Script: **Deploy > New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Copy the **Web app URL**

### Step 5: Set Telegram Webhook

Use this URL (replace with your details):

```
https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook?url=[YOUR_WEB_APP_URL]
```

### Optional: Maintenance Functions

- **`cleanupDuplicateRows()`** - Remove duplicate entries (run once if needed)

## 🔄 Updating Your Bot

When new features are released, follow these steps to update your existing bot:

### Step 1: Check if Migration is Needed

First, determine if your sheet structure needs to be updated. Check your Google Sheet:

- **Old structure (5 columns)**: `Date | User ID | Username | Morning | Evening`
- **New structure (6 columns)**: `Date | User ID | First Name | Username | Morning | Evening`

If you have the old 5-column structure, **migration is required** for the latest features.

### Step 2: Backup Your Data

1. **Open your Google Sheet**
2. **File > Make a copy** - name it "MeditationBot*Backup*[DATE]"
3. **Keep this backup safe** - contains all your meditation history

### Step 3: Update the Code

1. **Open your Google Apps Script project**
2. **Copy your existing constants** (save these somewhere safe):
   ```javascript
   const TELEGRAM_BOT_TOKEN = "your_existing_token";
   const SHEET_ID = "your_existing_sheet_id";
   ```
3. **Replace all code** with the new `MeditationTrackerBot.js` content
4. **Restore your constants** at the top of the new code:
   ```javascript
   const TELEGRAM_BOT_TOKEN = "your_existing_token"; // Keep your token!
   const SHEET_ID = "your_existing_sheet_id"; // Keep your sheet ID!
   ```
5. **Save the project** (Ctrl+S or Cmd+S)

### Step 4: Run Migration (if needed)

If you need to migrate from 5-column to 6-column structure:

1. **In Google Apps Script**, find the function dropdown (usually shows "doPost")
2. **Select `migrateSheetToNewStructure`** from the dropdown
3. **Click the Run button** ▶️
4. **Grant permissions** if prompted (same permissions as before)
5. **Check execution log** - should show "Migration completed successfully!"

**What the migration does:**

- Adds a "First Name" column after "User ID"
- Leaves first names empty (will be populated with real Telegram names when users interact)
- Preserves all existing data
- Updates headers to new structure

### Step 5: Update Webhook (if needed)

If you created a new deployment or your Web App URL changed:

1. **In Google Apps Script**: Deploy > Manage deployments
2. **Copy the current Web App URL**
3. **Update the webhook** using this URL (replace with your details):
   ```
   https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook?url=[YOUR_NEW_WEB_APP_URL]
   ```

### Step 6: Test the Update

1. **Send `/start`** to your bot to ensure it's working
2. **Try a command** like `/dailyvibrations` to test functionality
3. **Check that first names appear** (may take a moment for Telegram API lookup)

### Common Update Scenarios

#### ✅ Minor Updates (new features, bug fixes)

- Just update the code (Steps 1-3)
- No migration needed
- Webhook stays the same

#### ⚠️ Major Updates (new sheet structure)

- Update code + run migration (Steps 1-4)
- Check if new webhook needed (Step 5)

#### 🆕 First Time Installing Latest Version

- Follow the main setup instructions instead
- Migration not needed for fresh installations

### Troubleshooting Updates

#### "Migration completed" but features not working

- Check that webhook is still active
- Verify constants are correctly set
- Try redeploying the Web App

#### Bot not responding after update

- Check execution log for errors
- Verify webhook URL is correct
- Ensure permissions are granted

#### Old data missing after migration

- Check your backup copy
- Migration preserves data - check the new 6-column structure

#### First names still showing as @usernames

- This is normal initially
- Real first names appear as users interact with the updated bot
- After users log meditations, status will show proper first names

### 🔄 Stay Updated

- **Watch the GitHub repository** for new releases
- **Follow the changelog** for breaking changes
- **Test updates** in a copy before applying to production

## Technical Architecture

### Google Apps Script Integration

- Built entirely on [Google Apps Script](https://script.google.com) platform
- No external server infrastructure required
- Integrates seamlessly with [Google Sheets](https://sheets.google.com) for data storage
- Automated triggers for daily reminders

### Data Storage (Google Sheets)

- **MeditationLog Sheet**: Stores all meditation sessions with timestamps
  - **Latest structure (6 columns)**: Date, User ID, First Name, Username, Morning Time, Evening Time
  - **Legacy structure (5 columns)**: Date, User ID, Username, Morning Time, Evening Time
- **ChatIDs Sheet**: Manages registered chats for reminders
  - Columns: Chat ID, Chat Name, Registration Date
- Automatic data validation and duplicate prevention
- Real Telegram first name caching and lookup

### Reminder System

- **Chat ID Registration**: Required for receiving automated reminders
- **Time-based Triggers**: Google Apps Script manages daily reminder scheduling
- **Bilingual Reminders**: Supports both English and Spanish reminder messages
- **Multi-chat Support**: Sends reminders to individual chats and groups

### Bot Features

- Robust error handling with bilingual error messages
- User privacy protection (works with Telegram privacy settings)
- Efficient data querying and analytics computation
- Scalable architecture for multiple users and groups

## ⚠️ Scalability Disclaimer & Performance Warnings

### 📊 Google Sheets as Database Limitations

This bot uses Google Sheets as its primary database, which provides excellent **simplicity and zero infrastructure costs** but comes with important scalability limitations that you should be aware of:

#### Current Architecture Constraints

- **Full table scans**: Every command reads the entire spreadsheet
- **No indexing**: Linear search through all records (O(n) performance)
- **Memory consumption**: Loads entire dataset into memory for processing
- **Google Sheets limits**: 5 million cells per spreadsheet, 400,000 cells per sheet

#### Expected Performance by Scale

| Users | Days | Total Rows | Status Commands | Analysis Commands | User Experience         |
| ----- | ---- | ---------- | --------------- | ----------------- | ----------------------- |
| 10    | 30   | ~300       | < 1 second      | < 2 seconds       | ✅ **Excellent**        |
| 50    | 90   | ~4,500     | 1-2 seconds     | 2-3 seconds       | ✅ **Good**             |
| 100   | 180  | ~18,000    | 3-5 seconds     | 5-8 seconds       | ⚠️ **Noticeable delay** |
| 500   | 365  | ~182,500   | 8-15+ seconds   | 15-30+ seconds    | ❌ **Very slow**        |
| 1000  | 365  | ~365,000   | Timeout likely  | Timeout likely    | ❌ **Unusable**         |

#### Warning Signs to Watch For

- Commands taking more than 3-5 seconds to respond
- Occasional "Script timeout" errors
- Users reporting bot "not responding"
- Analysis commands failing to complete

### 🔧 Optimization Strategies

#### For Small Communities (< 50 users)

✅ **Current implementation is perfect** - no changes needed

#### For Growing Communities (50-100 users)

⚠️ **Consider these optimizations**:

- Implement caching for frequently accessed data
- Use targeted Google Sheets range queries instead of full table scans
- Consider monthly sheet partitioning to reduce data size per query

#### For Large Communities (100+ users)

🔄 **Migration strongly recommended** to:

- **Google Cloud Firestore** (maintains serverless architecture)
- **Google Cloud SQL** (for complex relational queries)
- **Full cloud architecture** with proper API design

### 🎯 Recommendations Timeline

| Phase       | User Count | Action Required                                 |
| ----------- | ---------- | ----------------------------------------------- |
| **Phase 1** | 1-50       | ✅ Use current Google Sheets implementation     |
| **Phase 2** | 50-100     | ⚠️ Monitor performance, implement optimizations |
| **Phase 3** | 100-500    | 🔄 Plan database migration to Firestore         |
| **Phase 4** | 500+       | 🏗️ Full architecture redesign required          |

### 💡 Migration Options

#### Google Cloud Firestore (Recommended next step)

- Maintains serverless architecture
- Real-time queries with proper indexing
- Works well with Google Apps Script
- Better cost structure for larger datasets

#### Traditional Database Solutions

- **Cloud SQL**: For complex relational queries
- **Cloud Functions**: For better API design
- **Caching layers**: Redis or Memcached

### 🚨 Important Notes

- **This bot is designed for community/group usage** (meditation groups, small organizations)
- **Perfect for its intended use case** of tracking meditation in smaller communities
- **The simplicity of Google Sheets is a feature**, not a bug, for most meditation tracking needs
- **Migration complexity increases significantly** - only migrate when performance becomes problematic

**Bottom Line**: For meditation communities under 50 active users, this implementation provides an excellent balance of functionality, simplicity, and zero infrastructure costs. Consider the trade-offs carefully before optimizing or migrating.

## Why Chat ID Registration?

The `/start` command registers your chat ID in the system, enabling:

- **Daily meditation reminders** sent directly to your chat
- **Group support** - works in both private messages and group chats
- **Privacy compliance** - respects Telegram privacy settings
- **Persistent tracking** - maintains your meditation history

## Data Privacy & Security

- Uses Telegram user IDs for robust user identification
- Works with users who have privacy settings enabled
- No personal data stored beyond meditation session logs
- GDPR-compliant data handling
- Secure Google Apps Script environment

## Analytics Capabilities

- **Individual Progress**: Personal meditation streaks and consistency
- **Community Stats**: Overall participation and completion rates
- **Temporal Analysis**: Daily, weekly, and monthly trends
- **Comparative Insights**: Progress relative to community averages
- **Per-user Relative Calculation**: Fair analysis based on individual start dates

## Useful Links

- 🤖 [Create Telegram Bot](https://t.me/botfather)
- 📝 [Google Apps Script](https://script.google.com)
- 📊 [Google Sheets](https://sheets.google.com)
- 🔗 [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- 📚 [Google Apps Script Documentation](https://developers.google.com/apps-script)

## Contributing

This project is open source under the GPL-3.0 license. Contributions welcome!

## License

Licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

_Built with ❤️ for the meditation community_
