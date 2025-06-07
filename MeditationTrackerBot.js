const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;
const SHEET_ID = 'YOUR_SHEET_ID';

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const message = data.message;

        if (!message || !message.text) return;

        const text = message.text.trim();
        if (!text.startsWith('/')) return; // Only process commands
        // Remove @botusername if present (e.g., /status@DhammaTrackerBot -> /status)
        const command = text.split(' ')[0].split('@')[0].toLowerCase();
        const chatId = message.chat.id;
        const username = message.from.username ? '@' + message.from.username : message.from.first_name;
        const userId = message.from.id;

        const now = new Date();
        const date = Utilities.formatDate(now, 'GMT+2', 'yyyy-MM-dd');
        const time = Utilities.formatDate(now, 'GMT+2', 'HH:mm:ss');

        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('MeditationLog') ||
            SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

        let responseText = '';

        // Handle /start separately - register chat and show help
        if (command === '/start') {
            // Register chat if not already registered
            if (!isChatRegistered(chatId)) {
                const result = registerChat(chatId, message.chat.title || username);
                console.log('Registration result for /start:', result);
            }
            // Show help message
            responseText = 'Welcome to Meditation Tracker! 🧘‍♀️\n\n' +
                'Commands:\n' +
                '/morning - Log morning meditation\n' +
                '/evening - Log evening meditation\n' +
                '/status - See today\'s progress\n' +
                '/analysis - See overall meditation statistics\n' +
                '/myanalysis - See your personal meditation statistics\n' +
                '/help - Show this message\n' +
                '/ayuda - Mostrar este mensaje en español\n';
        }
        // Check if chat is registered for all other commands (except help)
        else if (command !== '/help' && command !== '/ayuda' && !isChatRegistered(chatId)) {
            responseText = 'This chat is not registered for meditation tracking. Please send /start to begin! 🧘‍♀️\n\n' +
                'Este chat no está registrado para seguimiento de meditación. ¡Envía /start para comenzar! 🧘‍♀️';
        }
        // Bilingual help (excluding /start which is handled above)
        else if (command === '/help') {
            responseText = 'Welcome to Meditation Tracker! 🧘‍♀️\n\n' +
                'Commands:\n' +
                '/morning - Log morning meditation\n' +
                '/evening - Log evening meditation\n' +
                '/status - See today\'s progress\n' +
                '/analysis - See overall meditation statistics\n' +
                '/myanalysis - See your personal meditation statistics\n' +
                '/help - Show this message\n' +
                '/ayuda - Mostrar este mensaje en español\n';
        } else if (command === '/ayuda') {
            responseText = '¡Bienvenido al Rastreador de Meditación! 🧘‍♀️\n\n' +
                'Comandos:\n' +
                '/mañana - Registrar meditación de la mañana\n' +
                '/tarde - Registrar meditación de la tarde\n' +
                '/estado - Ver el progreso de hoy\n' +
                '/analisis - Ver estadísticas generales\n' +
                '/mianalisis - Tus estadísticas personales\n' +
                '/help - Show this message in english';
        } else if (command === '/myanalysis') {
            responseText = getPersonalAnalysisMessage(sheet, username, 'en');
        } else if (command === '/mianalisis') {
            responseText = getPersonalAnalysisMessage(sheet, username, 'es');
        } else if (command === '/morning' || command === '/meditate_morning' || command === '/mañana' || command === '/meditar_mañana') {
            const result = logMeditation(sheet, date, username, 'morning', time, userId);
            if (command === '/mañana' || command === '/meditar_mañana') {
                if (result.success) {
                    responseText = `🌞 ${username} ¡Meditación de la mañana registrada a las ${time}!`;
                } else {
                    responseText = `⚠️ ${result.message}`;
                }
            } else {
                if (result.success) {
                    responseText = `🌞 ${username} logged morning meditation at ${time}!`;
                } else {
                    responseText = `⚠️ ${result.message}`;
                }
            }
        } else if (command === '/evening' || command === '/meditate_evening' || command === '/tarde' || command === '/meditar_tarde') {
            const result = logMeditation(sheet, date, username, 'evening', time, userId);
            if (command === '/tarde' || command === '/meditar_tarde') {
                if (result.success) {
                    responseText = `🌙 ${username} ¡Meditación de la tarde registrada a las ${time}!`;
                } else {
                    responseText = `⚠️ ${result.message}`;
                }
            } else {
                if (result.success) {
                    responseText = `🌙 ${username} logged evening meditation at ${time}!`;
                } else {
                    responseText = `⚠️ ${result.message}`;
                }
            }
        } else if (command === '/status') {
            responseText = getSimpleStatus(sheet, date, 'en');
        } else if (command === '/estado') {
            responseText = getSimpleStatus(sheet, date, 'es');
        } else if (command === '/analysis') {
            responseText = getGeneralAnalysisMessage(sheet, 'en');
        } else if (command === '/analisis') {
            responseText = getGeneralAnalysisMessage(sheet, 'es');
        } else {
            responseText = 'Unknown command. Send /help or /ayuda for available commands.';
        }

        sendTelegramMessage(chatId, responseText);

    } catch (error) {
        console.error('Error in doPost:', error);
        if (data && data.message) {
            sendTelegramMessage(data.message.chat.id, 'Sorry, an error occurred. Please try again.');
        }
    }
}

function registerChat(chatId, chatName) {
    // Use the existing isChatRegistered function for consistency
    if (isChatRegistered(chatId)) {
        return {
            success: false,
            message: 'This chat is already registered for meditation tracking!'
        };
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let chatSheet = ss.getSheetByName('ChatIDs');

    if (!chatSheet) {
        chatSheet = ss.insertSheet('ChatIDs');
        chatSheet.getRange(1, 1, 1, 3).setValues([['Chat ID', 'Chat Name', 'Registration Date']]);
        chatSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    }

    // Add new chat
    const now = new Date();
    const date = Utilities.formatDate(now, 'GMT+2', 'yyyy-MM-dd HH:mm:ss');
    chatSheet.appendRow([chatId.toString(), chatName, date]);

    return {
        success: true,
        message: '✅ Chat successfully registered for meditation tracking! You will now receive daily reminders and can track meditations here.'
    };
}

function getRegisteredChats() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const chatSheet = ss.getSheetByName('ChatIDs');

    if (!chatSheet) {
        return [];
    }

    const data = chatSheet.getDataRange().getValues();
    return data.slice(1).map(row => row[0]); // Return array of chat IDs
}

function logMeditation(sheet, date, username, type, time, userId) {
    const dataRange = sheet.getDataRange();
    const rows = dataRange.getValues();

    // Find existing row for this user and date (by userId)
    let userRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
        let rowDateString = rows[i][0];
        if (rows[i][0] instanceof Date) {
            rowDateString = Utilities.formatDate(rows[i][0], 'GMT+2', 'yyyy-MM-dd');
        }
        if (rowDateString === date && String(rows[i][1]) === String(userId)) {
            userRowIndex = i + 1; // Convert to 1-based for sheet operations
            break;
        }
    }

    // If no row exists, create one
    if (userRowIndex === -1) {
        sheet.appendRow([date, userId, username, '', '']);
        userRowIndex = sheet.getLastRow();
    }

    // Check if this meditation session is already logged
    const columnIndex = type === 'morning' ? 4 : 5; // 1-based: Morning=4, Evening=5
    const existingValue = sheet.getRange(userRowIndex, columnIndex).getValue();

    if (existingValue && existingValue !== '') {
        return {
            success: false,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} meditation already logged today at ${existingValue}! 🧘‍♀️`
        };
    }

    // Log the meditation
    sheet.getRange(userRowIndex, columnIndex).setValue(time);

    return {
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} meditation logged successfully!`
    };
}

// Helper: Get all unique users ever
function getAllUniqueUsers(sheet) {
    const rows = sheet.getDataRange().getValues();
    const users = {};
    for (let i = 1; i < rows.length; i++) {
        const userId = String(rows[i][1] || '').trim();
        const username = (rows[i][2] || '').trim();
        if (userId && !users[userId]) {
            users[userId] = username;
        }
    }
    return users; // {userId: username}
}

// Helper: Get all unique dates ever
function getAllUniqueDates(sheet) {
    const rows = sheet.getDataRange().getValues();
    const dates = new Set();
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] && rows[i][0] !== '') {
            let d = rows[i][0];
            if (d instanceof Date) {
                d = Utilities.formatDate(d, 'GMT+2', 'yyyy-MM-dd');
            }
            dates.add(d);
        }
    }
    return Array.from(dates).sort();
}

function createAsciiBar(percentage) {
  const roundedPercentage = Math.round(percentage);
  const clampedPercentage = Math.max(0, Math.min(100, roundedPercentage)); // Ensure percentage is between 0 and 100

  const barLength = 10;
  const filledLength = Math.round((clampedPercentage / 100) * barLength);
  const emptyLength = barLength - filledLength;

  const filledBar = '█'.repeat(filledLength);
  const emptyBar = '-'.repeat(emptyLength);

  return `[${filledBar}${emptyBar}] ${clampedPercentage}%`;
}

function getSimpleStatus(sheet, date, lang) {
    try {
        const dataRange = sheet.getDataRange();
        const rows = dataRange.getValues();

        if (rows.length <= 1) {
            return lang === 'es' ? 'No hay datos de meditación aún.' : 'No meditation data yet.';
        }

        // Get all unique users (userId: username)
        const allUsers = getAllUniqueUsers(sheet);
        const userIds = Object.keys(allUsers);
        if (userIds.length === 0) {
            return lang === 'es' ? 'No se encontraron usuarios.' : 'No users found.';
        }

        // Analyze today's data
        let bothDone = [];
        let morningOnly = [];
        let eveningOnly = [];
        let notStarted = [];

        userIds.forEach(userId => {
            let userMorning = '';
            let userEvening = '';
            // Find this user's row for today
            for (let i = 1; i < rows.length; i++) {
                let rowDate = rows[i][0];
                if (rowDate instanceof Date) {
                    rowDate = Utilities.formatDate(rowDate, 'GMT+2', 'yyyy-MM-dd');
                }
                if (rowDate === date && String(rows[i][1]) === userId) {
                    userMorning = rows[i][3] || '';
                    userEvening = rows[i][4] || '';
                    break;
                }
            }
            const hasMorning = userMorning && userMorning !== '';
            const hasEvening = userEvening && userEvening !== '';
            const displayName = allUsers[userId] || userId;
            if (hasMorning && hasEvening) {
                bothDone.push(displayName);
            } else if (hasMorning) {
                morningOnly.push(displayName);
            } else if (hasEvening) {
                eveningOnly.push(displayName);
            } else {
                notStarted.push(displayName);
            }
        });

        // Calculate percentages
        const total = userIds.length;
        const total = userIds.length;
        const bothPercent = total > 0 ? Math.round((bothDone.length / total) * 100) : 0;
        const morningPercent = total > 0 ? Math.round((morningOnly.length / total) * 100) : 0;
        const eveningPercent = total > 0 ? Math.round((eveningOnly.length / total) * 100) : 0;
        const notStartedPercent = total > 0 ? Math.round((notStarted.length / total) * 100) : 0;

        // Calculate overall completion rate
        const completedMeditations = bothDone.length * 2 + morningOnly.length + eveningOnly.length;
        const totalPossibleMeditations = total * 2;
        const overallCompletionRate = totalPossibleMeditations > 0 ? Math.round((completedMeditations / totalPossibleMeditations) * 100) : 0;

        // Generate ASCII bars
        const bothBar = createAsciiBar(bothPercent);
        const morningBar = createAsciiBar(morningPercent);
        const eveningBar = createAsciiBar(eveningPercent);
        const notStartedBar = createAsciiBar(notStartedPercent);
        const overallBar = createAsciiBar(overallCompletionRate);

        let msg = '';
        if (lang === 'es') {
            msg = '📊 Estado (' + date + ')\n';
            msg += '👥 Total: ' + total + '\n\n';
            msg += '🏆 Ambas: ' + bothDone.length + ' (' + bothPercent + '%) ' + bothBar;
            if (bothDone.length > 0) msg += '\n' + bothDone.join(', ');
            msg += '\n\n🌞 Mañana: ' + morningOnly.length + ' (' + morningPercent + '%) ' + morningBar;
            if (morningOnly.length > 0) msg += '\n' + morningOnly.join(', ');
            msg += '\n\n🌙 Tarde: ' + eveningOnly.length + ' (' + eveningPercent + '%) ' + eveningBar;
            if (eveningOnly.length > 0) msg += '\n' + eveningOnly.join(', ');
            msg += '\n\n⏳ Pendiente: ' + notStarted.length + ' (' + notStartedPercent + '%) ' + notStartedBar;
            if (notStarted.length > 0) msg += '\n' + notStarted.join(', ');
            msg += '\n\n📈 Tasa de cumplimiento de hoy\n' + overallBar;
        } else {
            msg = '📊 Status (' + date + ')\n';
            msg += '👥 Total: ' + total + '\n\n';
            msg += '🏆 Both: ' + bothDone.length + ' (' + bothPercent + '%) ' + bothBar;
            if (bothDone.length > 0) msg += '\n' + bothDone.join(', ');
            msg += '\n\n🌞 Morning: ' + morningOnly.length + ' (' + morningPercent + '%) ' + morningBar;
            if (morningOnly.length > 0) msg += '\n' + morningOnly.join(', ');
            msg += '\n\n🌙 Evening: ' + eveningOnly.length + ' (' + eveningPercent + '%) ' + eveningBar;
            if (eveningOnly.length > 0) msg += '\n' + eveningOnly.join(', ');
            msg += '\n\n⏳ Pending: ' + notStarted.length + ' (' + notStartedPercent + '%) ' + notStartedBar;
            if (notStarted.length > 0) msg += '\n' + notStarted.join(', ');
            msg += '\n\n📈 Today\'s completion rate\n' + overallBar;
        }
        return msg;

    } catch (error) {
        console.error('Error in getSimpleStatus:', error);
        return `Status error: ${error.message} (Line: ${error.lineNumber})`;
    }
}

// Helper: Get all log dates for a user (by userId)
function getUserLogDates(sheet, userId) {
    const rows = sheet.getDataRange().getValues();
    const dates = [];
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][1]) === String(userId)) {
            let d = rows[i][0];
            if (d instanceof Date) {
                d = Utilities.formatDate(d, 'GMT+2', 'yyyy-MM-dd');
            }
            dates.push(d);
        }
    }
    return Array.from(new Set(dates)).sort();
}

// Helper: Get all log rows for a user (by userId)
function getUserLogRows(sheet, userId) {
    const rows = sheet.getDataRange().getValues();
    return rows.filter(row => String(row[1]) === String(userId));
}

// Personal analysis for a user
function getPersonalAnalysisMessage(sheet, username, lang) {
    const userRows = getUserLogRows(sheet, username);
    if (userRows.length === 0) {
        return lang === 'es' ? 'No se encontraron registros de meditación para ti.' : 'No meditation records found for you.';
    }
    // Get all unique dates for this user
    const userDates = getUserLogDates(sheet, username);
    let bothSessions = 0;
    let morningOnly = 0;
    let eveningOnly = 0;
    let noSessions = 0;
    // Build a map: date => row
    const rowMap = {};
    userRows.forEach(row => {
        let d = row[0];
        if (d instanceof Date) {
            d = Utilities.formatDate(d, 'GMT+2', 'yyyy-MM-dd');
        }
        rowMap[d] = row;
    });
    userDates.forEach(date => {
        const row = rowMap[date];
        const morning = row ? row[2] : '';
        const evening = row ? row[3] : '';
        const hasMorning = morning && morning !== '' && morning !== null;
        const hasEvening = evening && evening !== '' && evening !== null;
        if (hasMorning && hasEvening) {
            bothSessions++;
        } else if (hasMorning) {
            morningOnly++;
        } else if (hasEvening) {
            eveningOnly++;
        } else {
            noSessions++;
        }
    });
    const totalDays = userDates.length;
    const bothPercent = Math.round((bothSessions / totalDays) * 100);
    const morningPercent = Math.round((morningOnly / totalDays) * 100);
    const eveningPercent = Math.round((eveningOnly / totalDays) * 100);
    const noSessionsPercent = Math.round((noSessions / totalDays) * 100);
    const completedSessions = (bothSessions * 2) + morningOnly + eveningOnly;
    const totalPossibleSessions = totalDays * 2;
    const completionRate = Math.round((completedSessions / totalPossibleSessions) * 100);
    if (lang === 'es') {
        let msg = `📊 Tu análisis personal de meditación\n\n`;
        msg += `Días rastreados: ${totalDays}\n`;
        msg += `Distribución de sesiones:\n`;
        msg += `🏆 Ambas sesiones: ${bothPercent}%\n`;
        msg += `🌞 Solo mañana: ${morningPercent}%\n`;
        msg += `🌙 Solo tarde: ${eveningPercent}%\n`;
        msg += `⏳ Ninguna: ${noSessionsPercent}%\n\n`;
        msg += `📈 Tasa de cumplimiento: ${completionRate}%`;
        return msg;
    } else {
        let msg = `📊 Your Personal Meditation Analysis\n\n`;
        msg += `Days tracked: ${totalDays}\n`;
        msg += `Session distribution:\n`;
        msg += `🏆 Both sessions: ${bothPercent}%\n`;
        msg += `🌞 Morning only: ${morningPercent}%\n`;
        msg += `🌙 Evening only: ${eveningPercent}%\n`;
        msg += `⏳ None: ${noSessionsPercent}%\n\n`;
        msg += `📈 Completion rate: ${completionRate}%`;
        return msg;
    }
}

// General analysis: per-user relative calculation
function getGeneralAnalysisMessage(sheet, lang) {
    const allUsers = getAllUniqueUsers(sheet);
    if (Object.keys(allUsers).length === 0) {
        return lang === 'es' ? "📊 No hay datos de meditación aún." : "📊 No meditation data available yet.";
    }

    // Get all dates where ANY user has activity (latest possible date)
    const allActiveDates = getAllUniqueDates(sheet);
    const latestDate = allActiveDates[allActiveDates.length - 1]; // Last date with any activity

    let bothSessions = 0;
    let morningOnly = 0;
    let eveningOnly = 0;
    let noSessions = 0;
    let totalUserDays = 0;

    // For each user, analyze from their first active day to the latest global date
    Object.keys(allUsers).forEach(userId => {
        const userRows = getUserLogRows(sheet, userId);
        const userDates = getUserLogDates(sheet, userId);
        if (userDates.length === 0) return; // Skip users with no data
        const userFirstDate = userDates[0]; // User's personal start date
        // Build a map: date => row for this user
        const rowMap = {};
        userRows.forEach(row => {
            let d = row[0];
            if (d instanceof Date) {
                d = Utilities.formatDate(d, 'GMT+2', 'yyyy-MM-dd');
            }
            rowMap[d] = row;
        });
        // Generate all dates from user's first date to latest date
        const userAnalysisDates = [];
        for (let d = new Date(userFirstDate); d <= new Date(latestDate); d.setDate(d.getDate() + 1)) {
            userAnalysisDates.push(Utilities.formatDate(d, 'GMT+2', 'yyyy-MM-dd'));
        }
        totalUserDays += userAnalysisDates.length;
        // Check this user for each date in their analysis window
        userAnalysisDates.forEach(date => {
            const row = rowMap[date];
            const morning = row ? row[3] : '';
            const evening = row ? row[4] : '';
            const hasMorning = morning && morning !== '' && morning !== null;
            const hasEvening = evening && evening !== '' && evening !== null;
            if (hasMorning && hasEvening) {
                bothSessions++;
            } else if (hasMorning) {
                morningOnly++;
            } else if (hasEvening) {
                eveningOnly++;
            } else {
                noSessions++; // User had no activity on this date in their window
            }
        });
    });

    // Calculate completion rate correctly
    const completedSessions = (bothSessions * 2) + morningOnly + eveningOnly;
    const totalPossibleSessions = totalUserDays * 2;
    const totalUsers = Object.keys(allUsers).length;
    const bothPercent = totalUserDays === 0 ? 0 : Math.round((bothSessions / totalUserDays) * 100);
    const morningPercent = totalUserDays === 0 ? 0 : Math.round((morningOnly / totalUserDays) * 100);
    const eveningPercent = totalUserDays === 0 ? 0 : Math.round((eveningOnly / totalUserDays) * 100);
    const noSessionsPercent = totalUserDays === 0 ? 0 : Math.round((noSessions / totalUserDays) * 100);
    const completionRate = totalPossibleSessions === 0 ? 0 : Math.round((completedSessions / totalPossibleSessions) * 100);
    let analysisMessage = '';
    if (lang === 'es') {
        analysisMessage = "📊 Análisis general de meditación\n\n";
        analysisMessage += `Participantes totales (histórico): ${totalUsers}\n`;
        analysisMessage += `Total de días-usuario rastreados: ${totalUserDays}\n\n`;
        analysisMessage += `Distribución de sesiones (por usuario y día):\n`;
        analysisMessage += `🏆 Ambas sesiones: ${bothPercent}%\n`;
        analysisMessage += `🌞 Solo mañana: ${morningPercent}%\n`;
        analysisMessage += `🌙 Solo tarde: ${eveningPercent}%\n`;
        analysisMessage += `⏳ Ninguna: ${noSessionsPercent}%\n\n`;
        analysisMessage += `📈 Tasa de cumplimiento general: ${completionRate}%`;
    } else {
        analysisMessage = "📊 Overall Meditation Analysis\n\n";
        analysisMessage += `Total Participants (all-time): ${totalUsers}\n`;
        analysisMessage += `Total User-Days Tracked: ${totalUserDays}\n\n`;
        analysisMessage += `Session Distribution (per user per day):\n`;
        analysisMessage += `🏆 Both Sessions: ${bothPercent}%\n`;
        analysisMessage += `🌞 Morning Only: ${morningPercent}%\n`;
        analysisMessage += `🌙 Evening Only: ${eveningPercent}%\n`;
        analysisMessage += `⏳ No Sessions: ${noSessionsPercent}%\n\n`;
        analysisMessage += `📈 Overall Completion Rate: ${completionRate}%`;
    }
    return analysisMessage;
}

function sendTelegramMessage(chatId, text) {
    UrlFetchApp.fetch(TELEGRAM_API_URL + 'sendMessage', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        }),
    });
}

// Modify the reminder functions to send to all registered chats
function sendMorningReminder() {
    const message = "🌞 Good morning! Time for your morning meditation. Send /morning when you're done! 🧘‍♀️";
    const chatIds = getRegisteredChats();
    chatIds.forEach(chatId => {
        sendTelegramMessage(chatId, message);
    });
}

function sendEveningReminder() {
    const message = "🌙 Good evening! Time to wind down with your evening meditation. Send /evening when you're done! 🧘‍♂️";
    const chatIds = getRegisteredChats();
    chatIds.forEach(chatId => {
        sendTelegramMessage(chatId, message);
    });
}

// Setup functions
function setupSheet() {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    sheet.getRange(1, 1, 1, 5).setValues([[
        'Date', 'User ID', 'Username', 'Morning Time', 'Evening Time']]);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
}

function setupReminders() {
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
        if (trigger.getHandlerFunction() === 'sendMorningReminder' ||
            trigger.getHandlerFunction() === 'sendEveningReminder') {
            ScriptApp.deleteTrigger(trigger);
        }
    });

    ScriptApp.newTrigger('sendMorningReminder')
        .timeBased()
        .everyDays(1)
        .atHour(8)
        .create();

    ScriptApp.newTrigger('sendEveningReminder')
        .timeBased()
        .everyDays(1)
        .atHour(20)
        .create();

    console.log('Reminders set up for 8 AM and 8 PM daily!');
}

// Helper function to clean up duplicate rows (run once)
function cleanupDuplicateRows() {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const rows = sheet.getDataRange().getValues();

    // Keep track of user-date combinations we've seen
    const seen = new Set();
    const rowsToDelete = [];

    for (let i = 1; i < rows.length; i++) {
        const date = rows[i][0];
        const user = rows[i][1];
        const key = `${date}-${user}`;

        if (seen.has(key)) {
            rowsToDelete.push(i + 1); // Convert to 1-based for deletion
        } else {
            seen.add(key);
        }
    }

    // Delete rows in reverse order to maintain indices
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
        sheet.deleteRow(rowsToDelete[i]);
    }

    console.log(`Cleaned up ${rowsToDelete.length} duplicate rows`);
}

function isChatRegistered(chatId) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const chatSheet = ss.getSheetByName('ChatIDs');

    if (!chatSheet) {
        return false;
    }

    const data = chatSheet.getDataRange().getValues();
    const chatIdStr = chatId.toString();

    for (let i = 1; i < data.length; i++) {
        // Handle both string and number comparisons
        if (data[i][0] && (data[i][0].toString() === chatIdStr)) {
            return true;
        }
    }
    return false;
}