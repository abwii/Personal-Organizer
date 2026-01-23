const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const mailService = require('../services/mail.service');

const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User'); // Needed to get user email

// Real database access functions
const getTasksWithUpcomingDeadlines = async () => {
    const startRange = new Date(Date.now() + 23.5 * 60 * 60 * 1000); // 23.5 hours from now
    const endRange = new Date(Date.now() + 24.5 * 60 * 60 * 1000);   // 24.5 hours from now

    // Find goals due in ~24 hours
    const goals = await Goal.find({
        dueDate: { $gte: startRange, $lte: endRange },
        status: 'active'
    }).populate('user_id');

    return goals;
};

const getUncheckedHabits = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all active daily habits
    const activeHabits = await Habit.find({
        frequency: 'daily',
        status: 'active'
    }).populate('user_id');

    const uncheckedHabits = [];

    for (const habit of activeHabits) {
        // Check if a log exists for today
        const log = await HabitLog.findOne({
            habit_id: habit._id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (!log || !log.is_completed) {
            uncheckedHabits.push(habit);
        }
    }

    return uncheckedHabits;
};

const loadTemplate = (templateName) => {
    const templatePath = path.join(__dirname, '../templates', templateName);
    return fs.readFileSync(templatePath, 'utf-8');
};

const checkDeadlines = async () => {
    console.log('Running checkDeadlines job...');
    try {
        const goals = await getTasksWithUpcomingDeadlines();
        
        // Group by user to send one email per user
        const goalsByUser = {};
        goals.forEach(goal => {
            if (!goalsByUser[goal.user_id._id]) {
                goalsByUser[goal.user_id._id] = {
                    email: goal.user_id.email,
                    goals: []
                };
            }
            goalsByUser[goal.user_id._id].goals.push(goal);
        });

        for (const userId in goalsByUser) {
            const userData = goalsByUser[userId];
            let taskListHtml = '';
            userData.goals.forEach(goal => {
                taskListHtml += `<li class="task-item"><strong>${goal.title}</strong> - ${new Date(goal.dueDate).toLocaleString()}</li>`;
            });

            let template = loadTemplate('deadline-reminder.html');
            const html = template.replace('{{tasks}}', taskListHtml);

            await mailService.sendEmail(userData.email, 'Upcoming Deadlines', html);
        }
    } catch (error) {
        console.error('Error in checkDeadlines job:', error);
    }
};

const sendHabitRecap = async () => {
    console.log('Running sendHabitRecap job...');
    try {
        const habits = await getUncheckedHabits();

        // Group by user
        const habitsByUser = {};
        habits.forEach(habit => {
            if (!habitsByUser[habit.user_id._id]) {
                habitsByUser[habit.user_id._id] = {
                    email: habit.user_id.email,
                    habits: []
                };
            }
            habitsByUser[habit.user_id._id].habits.push(habit);
        });

        for (const userId in habitsByUser) {
            const userData = habitsByUser[userId];
            let habitListHtml = '';
            userData.habits.forEach(habit => {
                habitListHtml += `<li class="habit-item">${habit.title}</li>`;
            });

            let template = loadTemplate('habit-recap.html');
            const html = template.replace('{{habits}}', habitListHtml);

            await mailService.sendEmail(userData.email, 'Daily Habit Recap', html);
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
