const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;
const SHEET_ID = 'YOUR_SHEET_ID';

// Helper function to format time consistently 
function formatTime(timeValue, isSpanish = false) {
    if (!timeValue || timeValue === '') return '';

    // If it's already a string in HH:mm or HH:mm:ss format, extract HH:mm
    if (typeof timeValue === 'string') {
        // Handle formats like "12:06:00" or "12:06"
        const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const hours = timeMatch[1].padStart(2, '0');
            const minutes = timeMatch[2];
            return `${hours}:${minutes}`;
        }
        return timeValue; // Return as-is if no match
    }

    // If it's a Date object, format it properly
    if (timeValue instanceof Date) {
        return Utilities.formatDate(timeValue, 'GMT+2', 'HH:mm');
    }

    // Fallback for other types
    return String(timeValue);
}

// Helper function to get display name with first name priority
function getDisplayName(userRow) {
    // userRow format: [date, userId, username, morning, evening]
    // But we need to get the actual name from the message object
    // This function will be used when we have the full user data
    const storedName = userRow[2] || '';
    return storedName; // Will be the properly formatted name from message
}

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
        // Prioritize first name, fallback to username with @, then user ID
        const username = message.from.first_name || (message.from.username ? '@' + message.from.username : `User${message.from.id}`);
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
            responseText = 'Welcome to our meditation journey! 🌱💙\n\n' +
                'Let\'s support each other on this peaceful path:\n' +
                '/morning - Share your morning meditation 🌅\n' +
                '/evening - Share your evening meditation 🌙\n' +
                '/dailyvibrations - Feel today\'s community energy 🌸\n' +
                '/ourgift - View our collective offering to the world 🌿\n' +
                '/mygrowth - Reflect on your personal flowering 🦋\n' +
                '/help - Show this message\n' +
                '/ayuda - Mostrar este mensaje en español\n';
        }
        // Check if chat is registered for all other commands (except help)
        else if (command !== '/help' && command !== '/ayuda' && !isChatRegistered(chatId)) {
            responseText = 'Welcome to our meditation community! 🌱 Please send /start to join our peaceful journey together 💙\n\n' +
                '¡Bienvenido a nuestra comunidad de meditación! 🌱 ¡Envía /start para unirte a nuestro viaje pacífico juntos! 💙';
        }
        // Bilingual help (excluding /start which is handled above)
        else if (command === '/help') {
            responseText = 'Welcome to our meditation journey! 🌱💙\n\n' +
                'Let\'s support each other on this peaceful path:\n' +
                '/morning - Share your morning meditation 🌅\n' +
                '/evening - Share your evening meditation 🌙\n' +
                '/dailyvibrations - Feel today\'s community energy 🌸\n' +
                '/ourgift - View our collective offering to the world 🌿\n' +
                '/mygrowth - Reflect on your personal flowering 🦋\n' +
                '/help - Show this message\n' +
                '/ayuda - Mostrar este mensaje en español\n';
        } else if (command === '/ayuda') {
            responseText = '¡Bienvenido a nuestro viaje de meditación! 🌱💙\n\n' +
                'Apoyémonos mutuamente en este sendero pacífico:\n' +
                '/mañana - Comparte tu meditación matutina 🌅\n' +
                '/tarde - Comparte tu meditación vespertina 🌙\n' +
                '/vibreshoy - Siente la energía de nuestra comunidad hoy 🌸\n' +
                '/nuestroregalo - Mira nuestra ofrenda colectiva al mundo 🌿\n' +
                '/micrecimiento - Reflexiona sobre tu florecimiento personal 🦋\n' +
                '/help - Show this message in english';
        } else if (command === '/mygrowth' || command === '/micrecimiento' || command === '/myanalysis' || command === '/mianalisis') {
            responseText = getPersonalAnalysisMessage(sheet, userId, command.includes('micrecimiento') || command.includes('mianalisis') ? 'es' : 'en');
        } else if (command === '/morning' || command === '/meditate_morning' || command === '/mañana' || command === '/meditar_mañana') {
            const isSpanish = command === '/mañana' || command === '/meditar_mañana';
            const result = logMeditation(sheet, date, username, 'morning', time, userId, isSpanish);
            responseText = result.message;
        } else if (command === '/evening' || command === '/meditate_evening' || command === '/tarde' || command === '/meditar_tarde') {
            const isSpanish = command === '/tarde' || command === '/meditar_tarde';
            const result = logMeditation(sheet, date, username, 'evening', time, userId, isSpanish);
            responseText = result.message;
        } else if (command === '/dailyvibrations' || command === '/vibreshoy' || command === '/status' || command === '/estado') {
            responseText = getSimpleStatus(sheet, date, command.includes('vibreshoy') || command.includes('estado') ? 'es' : 'en');
        } else if (command === '/ourgift' || command === '/nuestroregalo' || command === '/analysis' || command === '/analisis') {
            responseText = getGeneralAnalysisMessage(sheet, command.includes('nuestroregalo') || command.includes('analisis') ? 'es' : 'en');
        } else {
            responseText = 'Let\'s explore together! 🌱 Send /help or /ayuda for our peaceful commands.';
        }

        sendTelegramMessage(chatId, responseText);

    } catch (error) {
        console.error('Error in doPost:', error);
        if (data && data.message) {
            sendTelegramMessage(data.message.chat.id, 'A gentle pause occurred 🌸 Please try again when you\'re ready.');
        }
    }
}

function registerChat(chatId, chatName) {
    // Use the existing isChatRegistered function for consistency
    if (isChatRegistered(chatId)) {
        return {
            success: false,
            message: 'Your community is already part of our meditation circle! 🌸'
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
        message: '🌱 Welcome to our meditation circle! You\'ll now receive gentle daily reminders and can share your peaceful moments here.'
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

function logMeditation(sheet, date, username, type, time, userId, isSpanish = false) {
    const dataRange = sheet.getDataRange();
    const rows = dataRange.getValues();

    // Find existing row for this user and date (by userId)
    let userRowIndex = -1;
    let existingRow = null;
    for (let i = 1; i < rows.length; i++) {
        let rowDateString = rows[i][0];
        if (rows[i][0] instanceof Date) {
            rowDateString = Utilities.formatDate(rows[i][0], 'GMT+2', 'yyyy-MM-dd');
        }
        if (rowDateString === date && String(rows[i][1]) === String(userId)) {
            userRowIndex = i + 1; // Convert to 1-based for sheet operations
            existingRow = rows[i];
            break;
        }
    }

    // Check if this meditation session is already logged BEFORE creating a new row
    if (existingRow) {
        const morningTime = existingRow[3] || '';
        const eveningTime = existingRow[4] || '';
        const existingValue = type === 'morning' ? morningTime : eveningTime;

        if (existingValue && existingValue !== '') {
            // Use the improved formatTime function
            const formattedTime = formatTime(existingValue, isSpanish);

            const sessionName = isSpanish ?
                (type === 'morning' ? 'meditación matutina' : 'meditación vespertina') :
                (type === 'morning' ? 'morning meditation' : 'evening meditation');

            const message = isSpanish ?
                `${username}, ya compartiste tu ${sessionName} hoy a las ${formattedTime}! 🌸✨ Tu dedicación es hermosa.` :
                `${username}, you've already shared your ${sessionName} today at ${formattedTime}! 🌸✨ Your dedication is beautiful.`;

            return {
                success: false,
                message: message
            };
        }
    }

    // If no row exists, create one
    if (userRowIndex === -1) {
        sheet.appendRow([date, userId, username, '', '']);
        userRowIndex = sheet.getLastRow();
    }

    // Log the meditation
    const columnIndex = type === 'morning' ? 4 : 5; // 1-based: Morning=4, Evening=5
    sheet.getRange(userRowIndex, columnIndex).setValue(time);

    // Format current time for success message using the consistent formatTime function
    const formattedCurrentTime = formatTime(time, isSpanish);

    const sessionName = isSpanish ?
        (type === 'morning' ? 'meditación matutina' : 'meditación vespertina') :
        (type === 'morning' ? 'morning meditation' : 'evening meditation');

    const successMessage = isSpanish ?
        `🌸 ${username}, hermosa ${sessionName} completada a las ${formattedCurrentTime}! Gracias por nutrir tu paz interior 💚` :
        `🌸 ${username}, beautiful ${sessionName} completed at ${formattedCurrentTime}! Thank you for nurturing your inner peace 💚`;

    return {
        success: true,
        message: successMessage
    };
}

// Helper: Get all unique users ever with proper name handling
function getAllUniqueUsers(sheet) {
    const rows = sheet.getDataRange().getValues();
    const users = {};
    for (let i = 1; i < rows.length; i++) {
        const userId = String(rows[i][1] || '').trim();
        const storedName = (rows[i][2] || '').trim();
        if (userId && !users[userId]) {
            // Apply first name priority logic to stored names
            let displayName = storedName;
            if (displayName.startsWith('@')) {
                // If it's a @username, try to extract a reasonable display name
                displayName = displayName.substring(1); // Remove @
                // If it looks like a combination of words, take first part
                if (displayName.includes('_') || displayName.includes('.')) {
                    const parts = displayName.split(/[_.]/);
                    displayName = parts[0];
                }
                // Capitalize first letter
                displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
            }
            users[userId] = displayName;
        }
    }
    return users; // {userId: displayName}
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

function createAsciiBar(percentage, useFullWidth = false) {
    const roundedPercentage = Math.round(percentage);
    const clampedPercentage = Math.max(0, Math.min(100, roundedPercentage));

    const barLength = useFullWidth ? 20 : 10;
    const filledLength = Math.round((clampedPercentage / 100) * barLength);
    const emptyLength = barLength - filledLength;

    // Use soft dots for a gentle, supportive visualization
    const filledBar = '●'.repeat(filledLength);
    const emptyBar = '○'.repeat(emptyLength);

    return useFullWidth ?
        `${filledBar}${emptyBar} ${clampedPercentage}%` :
        `${filledBar}${emptyBar}`;
}

function formatUserNames(names) {
    // Simple comma-separated list with gentle presentation
    return names.join(', ');
}

function getSimpleStatus(sheet, date, lang) {
    try {
        const dataRange = sheet.getDataRange();
        const rows = dataRange.getValues();

        if (rows.length <= 1) {
            return lang === 'es' ? 'Nuestro viaje de meditación está comenzando 🌱' : 'Our meditation journey is beginning 🌱';
        }

        // Get all unique users (userId: username)
        const allUsers = getAllUniqueUsers(sheet);
        const userIds = Object.keys(allUsers);
        if (userIds.length === 0) {
            return lang === 'es' ? 'Esperando que nuestra comunidad crezca 🌸' : 'Waiting for our community to grow 🌸';
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
        const overallBar = createAsciiBar(overallCompletionRate, true);

        let msg = '';
        if (lang === 'es') {
            msg = '🌸 Nuestro Viaje Comunitario (' + date + ')\n';
            msg += '🤗 Meditadores en nuestra comunidad: ' + total + '\n\n';
            msg += '🌟 ' + bothBar + ' ' + bothPercent + '% Ambas prácticas del día';
            if (bothDone.length > 0) msg += '\n' + formatUserNames(bothDone);
            msg += '\n\n🌅 ' + morningBar + ' ' + morningPercent + '% Práctica matutina';
            if (morningOnly.length > 0) msg += '\n' + formatUserNames(morningOnly);
            msg += '\n\n🌙 ' + eveningBar + ' ' + eveningPercent + '% Práctica vespertina';
            if (eveningOnly.length > 0) msg += '\n' + formatUserNames(eveningOnly);
            msg += '\n\n🌱 ' + notStartedBar + ' ' + notStartedPercent + '% Esperando su momento de paz';
            if (notStarted.length > 0) msg += '\n' + formatUserNames(notStarted);
            msg += '\n\n💚 Dedicación colectiva de hoy\n' + overallBar;
        } else {
            msg = '🌸 Our Community Journey (' + date + ')\n';
            msg += '🤗 Meditators in our community: ' + total + '\n\n';
            msg += '🌟 ' + bothBar + ' ' + bothPercent + '% Both daily practices';
            if (bothDone.length > 0) msg += '\n' + formatUserNames(bothDone);
            msg += '\n\n🌅 ' + morningBar + ' ' + morningPercent + '% Morning practice';
            if (morningOnly.length > 0) msg += '\n' + formatUserNames(morningOnly);
            msg += '\n\n🌙 ' + eveningBar + ' ' + eveningPercent + '% Evening practice';
            if (eveningOnly.length > 0) msg += '\n' + formatUserNames(eveningOnly);
            msg += '\n\n🌱 ' + notStartedBar + ' ' + notStartedPercent + '% Awaiting their peaceful moment';
            if (notStarted.length > 0) msg += '\n' + formatUserNames(notStarted);
            msg += '\n\n💚 Today\'s collective dedication\n' + overallBar;
        }
        return msg;

    } catch (error) {
        console.error('Error in getSimpleStatus:', error);
        return `A gentle pause in our community update 🌸 ${error.message}`;
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
function getPersonalAnalysisMessage(sheet, userId, lang) {
    const userRows = getUserLogRows(sheet, userId);
    if (userRows.length === 0) {
        return lang === 'es' ? 'Tu hermoso viaje de meditación está comenzando 🌱 ¡Cada momento de paz cuenta!' : 'Your beautiful meditation journey is beginning 🌱 Every peaceful moment counts!';
    }
    // Get all unique dates for this user
    const userDates = getUserLogDates(sheet, userId);
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
    // Generate progress bars
    const bothBar = createAsciiBar(bothPercent);
    const morningBar = createAsciiBar(morningPercent);
    const eveningBar = createAsciiBar(eveningPercent);
    const noneBar = createAsciiBar(noSessionsPercent);
    const completionBar = createAsciiBar(completionRate, true);

    if (lang === 'es') {
        let msg = `🦋 Tu Reflexión Personal de Meditación\n\n`;
        msg += `Días de crecimiento interior: ${totalDays}\n\n`;
        msg += `Tu hermoso patrón de práctica:\n`;
        msg += `🌟 ${bothBar} ${bothPercent}% Días con ambas prácticas\n`;
        msg += `🌅 ${morningBar} ${morningPercent}% Días de práctica matutina\n`;
        msg += `🌙 ${eveningBar} ${eveningPercent}% Días de práctica vespertina\n`;
        msg += `🌱 ${noneBar} ${noSessionsPercent}% Días de descanso\n\n`;
        msg += `💚 Tu dedicación al crecimiento interior\n${completionBar}\n\n`;
        msg += `Cada momento de meditación es un regalo para ti mismo 🙏✨`;
        return msg;
    } else {
        let msg = `🦋 Your Personal Meditation Reflection\n\n`;
        msg += `Days of inner growth: ${totalDays}\n\n`;
        msg += `Your beautiful practice pattern:\n`;
        msg += `🌟 ${bothBar} ${bothPercent}% Days with both practices\n`;
        msg += `🌅 ${morningBar} ${morningPercent}% Days of morning practice\n`;
        msg += `🌙 ${eveningBar} ${eveningPercent}% Days of evening practice\n`;
        msg += `🌱 ${noneBar} ${noSessionsPercent}% Days of rest\n\n`;
        msg += `💚 Your dedication to inner growth\n${completionBar}\n\n`;
        msg += `Every moment of meditation is a gift to yourself 🙏✨`;
        return msg;
    }
}

// General analysis: per-user relative calculation
function getGeneralAnalysisMessage(sheet, lang) {
    const allUsers = getAllUniqueUsers(sheet);
    if (Object.keys(allUsers).length === 0) {
        return lang === 'es' ? "🌱 Nuestro jardín de meditación está creciendo. ¡Cada nuevo meditador es una bendición!" : "🌱 Our meditation garden is growing. Every new meditator is a blessing!";
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
    // Generate progress bars
    const bothBar = createAsciiBar(bothPercent);
    const morningBar = createAsciiBar(morningPercent);
    const eveningBar = createAsciiBar(eveningPercent);
    const noneBar = createAsciiBar(noSessionsPercent);
    const completionBar = createAsciiBar(completionRate, true);

    let analysisMessage = '';
    if (lang === 'es') {
        analysisMessage = "🌿 Nuestros Insights Colectivos de Meditación\n\n";
        analysisMessage += `🤗 Almas hermosas en nuestra comunidad: ${totalUsers}\n`;
        analysisMessage += `🌱 Total de días de crecimiento juntos: ${totalUserDays}\n\n`;
        analysisMessage += `Nuestro hermoso patrón comunitario:\n`;
        analysisMessage += `🌟 ${bothBar} ${bothPercent}% Días con ambas prácticas\n`;
        analysisMessage += `🌅 ${morningBar} ${morningPercent}% Días de práctica matutina\n`;
        analysisMessage += `🌙 ${eveningBar} ${eveningPercent}% Días de práctica vespertina\n`;
        analysisMessage += `🌱 ${noneBar} ${noSessionsPercent}% Días de descanso y reflexión\n\n`;
        analysisMessage += `💚 Nuestra dedicación colectiva al crecimiento interior\n${completionBar}\n\n`;
        analysisMessage += `Juntos cultivamos paz, compasión y sabiduría 🙏✨`;
    } else {
        analysisMessage = "🌿 Our Collective Meditation Insights\n\n";
        analysisMessage += `🤗 Beautiful souls in our community: ${totalUsers}\n`;
        analysisMessage += `🌱 Total days of growth together: ${totalUserDays}\n\n`;
        analysisMessage += `Our beautiful community pattern:\n`;
        analysisMessage += `🌟 ${bothBar} ${bothPercent}% Days with both practices\n`;
        analysisMessage += `🌅 ${morningBar} ${morningPercent}% Days of morning practice\n`;
        analysisMessage += `🌙 ${eveningBar} ${eveningPercent}% Days of evening practice\n`;
        analysisMessage += `🌱 ${noneBar} ${noSessionsPercent}% Days of rest and reflection\n\n`;
        analysisMessage += `💚 Our collective dedication to inner growth\n${completionBar}\n\n`;
        analysisMessage += `Together we cultivate peace, compassion, and wisdom 🙏✨`;
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
    const message = "🌅 Good morning, beautiful souls! 🌸 A gentle invitation for your morning meditation practice. Share with /morning when your heart feels ready! 💚🧘‍♀️";
    const chatIds = getRegisteredChats();
    chatIds.forEach(chatId => {
        sendTelegramMessage(chatId, message);
    });
}

function sendEveningReminder() {
    const message = "🌙 The day gently closes, dear friends 🌸 Time to nurture your evening meditation practice. Share with /evening when your soul feels peaceful! 💜🧘‍♂️";
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

    console.log('Gentle daily reminders set up for 8 AM and 8 PM with love!');
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

    console.log(`Gently cleaned up ${rowsToDelete.length} duplicate entries with care`);
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