const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const mailService = require('../services/mail.service');

// Dummy functions to simulate database access
const getTasksWithUpcomingDeadlines = async () => {
    // Simulate fetching tasks due in 24 hours
    return [
        { title: 'Submit Project Report', deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        { title: 'Prepare Presentation', deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    ];
};

const getUncheckedHabits = async () => {
    // Simulate fetching unchecked habits for today
    return [
        { name: 'Drink 2L of water' },
        { name: 'Read for 30 minutes' }
    ];
};

const loadTemplate = (templateName) => {
    const templatePath = path.join(__dirname, '../templates', templateName);
    return fs.readFileSync(templatePath, 'utf-8');
};

const checkDeadlines = async () => {
    console.log('Running checkDeadlines job...');
    try {
        const tasks = await getTasksWithUpcomingDeadlines();
        if (tasks.length > 0) {
            let taskListHtml = '';
            tasks.forEach(task => {
                taskListHtml += `<li class="task-item"><strong>${task.title}</strong> - ${task.deadline.toLocaleString()}</li>`;
            });

            let template = loadTemplate('deadline-reminder.html');
            const html = template.replace('{{tasks}}', taskListHtml);

            // Send email (assuming a single user for this demo)
            await mailService.sendEmail('user@example.com', 'Upcoming Deadlines', html);
        }
    } catch (error) {
        console.error('Error in checkDeadlines job:', error);
    }
};

const sendHabitRecap = async () => {
    console.log('Running sendHabitRecap job...');
    try {
        const habits = await getUncheckedHabits();
        if (habits.length > 0) {
            let habitListHtml = '';
            habits.forEach(habit => {
                habitListHtml += `<li class="habit-item">${habit.name}</li>`;
            });

            let template = loadTemplate('habit-recap.html');
            const html = template.replace('{{habits}}', habitListHtml);

            // Send email
            await mailService.sendEmail('user@example.com', 'Daily Habit Recap', html);
        }
    } catch (error) {
        console.error('Error in sendHabitRecap job:', error);
    }
};

const initCronJobs = () => {
    // Schedule deadline check every hour
    cron.schedule('0 * * * *', checkDeadlines);
    console.log('Scheduled deadline check (Hourly)');

    // Schedule habit recap every day at 20:00
    cron.schedule('0 20 * * *', sendHabitRecap);
    console.log('Scheduled habit recap (Daily at 20:00)');
    
    // For testing purposes, uncomment the lines below to run immediately on startup
    // checkDeadlines();
    // sendHabitRecap();
};

module.exports = {
    initCronJobs,
    // Exporting for potential manual triggering or testing
    checkDeadlines,
    sendHabitRecap
};
