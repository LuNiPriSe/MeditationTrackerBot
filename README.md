# MeditationTrackerBot 🧘‍♂️

A bilingual Telegram meditation tracking bot built on Google Apps Script that helps users track their daily meditation sessions and provides detailed analytics.

![Bot Icon](DhammaBotIcon.png)

## Features

### 🌍 Bilingual Support

- **English** and **Spanish** interface
- Automatic language detection based on commands
- Consistent bilingual responses and analytics

### 📊 Meditation Tracking

- **Morning Sessions** (`/morning` / `/mañana`) - Track AM meditation
- **Evening Sessions** (`/evening` / `/tarde`) - Track PM meditation
- Automatic timestamp recording
- User session history storage

### 📈 Analytics & Reports

- **Personal Status** (`/status` / `/estado`) - Individual progress overview
- **General Analysis** (`/analysis` / `/analisis`) - Community-wide statistics
- **Personal Analysis** (`/myanalysis` / `/mianalisis`) - Detailed personal insights
- Completion rates and consistency tracking
- User participation statistics

### 🔐 User Management

- Registration system via `/start` command
- Telegram user ID-based tracking (privacy-safe)
- Duplicate registration prevention
- Unregistered user handling

## Commands

| English       | Spanish       | Description                      |
| ------------- | ------------- | -------------------------------- |
| `/start`      | `/start`      | Register with the bot            |
| `/help`       | `/ayuda`      | Show available commands          |
| `/morning`    | `/mañana`     | Log morning meditation session   |
| `/evening`    | `/tarde`      | Log evening meditation session   |
| `/status`     | `/estado`     | View your meditation statistics  |
| `/analysis`   | `/analisis`   | View community analytics         |
| `/myanalysis` | `/mianalisis` | View detailed personal analytics |

## Technical Architecture

### Google Apps Script Integration

- Built entirely on Google Apps Script platform
- No external server infrastructure required
- Integrates seamlessly with Google Sheets for data storage

### Data Storage

- **MeditationLog Sheet**: Stores all meditation sessions with timestamps
- **ChatIDs Sheet**: Manages registered users and their Telegram IDs
- Automatic data validation and duplicate prevention

### Bot Features

- Robust error handling with bilingual error messages
- User privacy protection (works with Telegram privacy settings)
- Efficient data querying and analytics computation
- Scalable architecture for multiple users

## Setup Instructions

### Prerequisites

1. Google Account with Google Apps Script access
2. Telegram Bot Token (from @BotFather)
3. Google Sheets document for data storage

### Installation

1. Create a new Google Apps Script project
2. Copy the `MeditationTrackerBot.js` code
3. Set up the required Google Sheets with proper column structure
4. Configure your Telegram Bot Token in the script
5. Deploy as a web app and set the webhook

### Configuration

- Update the `SHEET_ID` constant with your Google Sheets ID
- Replace `BOT_TOKEN` with your actual Telegram bot token
- Configure webhook URL in Telegram Bot API

## Data Privacy & Security

- Uses Telegram user IDs for robust user identification
- Works with users who have privacy settings enabled
- No personal data stored beyond meditation session logs
- GDPR-compliant data handling

## Analytics Capabilities

- **Individual Progress**: Personal meditation streaks and consistency
- **Community Stats**: Overall participation and completion rates
- **Temporal Analysis**: Daily, weekly, and monthly trends
- **Comparative Insights**: Progress relative to community averages

## Contributing

This project is open source under the GPL-3.0 license. Contributions welcome!

## License

Licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

_Built with ❤️ for the meditation community_
