const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Goal = require('../models/Goal');
const Step = require('../models/Step');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/personal-organizer", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await User.deleteMany({});
        await Goal.deleteMany({});
        await Step.deleteMany({});
        await Habit.deleteMany({});
        await HabitLog.deleteMany({});
        console.log('Data cleared');

        // Create Demo User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('demo123', salt);

        const user = await User.create({
            name: 'Demo User',
            email: 'demo@example.com',
            password: hashedPassword,
            xp: 1250,
            level: 5,
            badges: ['Early Bird', 'Consistency King', 'Goal Crusher']
        });
        console.log('User created:', user.email);

        // --- GOALS ---
        const goalsData = [
            {
                title: 'Apprendre React Native',
                description: 'Maîtriser le développement mobile cross-platform.',
                startDate: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                priority: 'high',
                category: 'Education',
                status: 'active',
                progress: 40
            },
            {
                title: 'Courir un Marathon',
                description: 'Préparation pour le marathon de Paris.',
                startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // -60 days
                dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
                priority: 'high',
                category: 'Health',
                status: 'active',
                progress: 20
            },
            {
                title: 'Lire 12 Livres',
                description: 'Challenge lecture 2026.',
                startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                dueDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
                priority: 'medium',
                category: 'Personal',
                status: 'active',
                progress: 10
            },
            {
                title: 'Voyage au Japon',
                description: 'Planifier et économiser pour le voyage.',
                startDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
                dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                priority: 'high',
                category: 'Travel',
                status: 'completed',
                progress: 100
            },
            // Goal specifically for testing email notification (deadline in 24h)
            {
                title: 'Rendre le rapport final',
                description: 'Urgent ! Deadline demain.',
                startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // EXACTLY 24h from now (approx)
                priority: 'high',
                category: 'Work',
                status: 'active',
                progress: 80
            }
        ];

        for (const goalData of goalsData) {
            const goal = await Goal.create({ ...goalData, user_id: user._id });
            
            // Add steps for the first goal
            if (goal.title === 'Apprendre React Native') {
                await Step.create([
                    { goal_id: goal._id, title: 'Suivre le tutoriel officiel', is_completed: true },
                    { goal_id: goal._id, title: 'Créer une ToDo App', is_completed: true },
                    { goal_id: goal._id, title: 'Apprendre la navigation', is_completed: false },
                    { goal_id: goal._id, title: 'Publier sur le Store', is_completed: false }
                ]);
            }
        }
        console.log('Goals created');

        // --- HABITS ---
        const habitsData = [
            {
                title: 'Boire 2L d\'eau',
                description: 'Hydratation quotidienne.',
                frequency: 'daily',
                category: 'Health',
                status: 'active',
                current_streak: 14,
                best_streak: 14,
                weekly_completion_rate: 100
            },
            {
                title: 'Méditation 10min',
                description: 'Calme et sérénité.',
                frequency: 'daily',
                category: 'Wellness',
                status: 'active',
                current_streak: 3,
                best_streak: 7,
                weekly_completion_rate: 80
            },
            {
                title: 'Code Review',
                description: 'Relire du code open source.',
                frequency: 'daily',
                category: 'Work',
                status: 'active',
                current_streak: 0,
                best_streak: 5,
                weekly_completion_rate: 40
            },
            {
                title: 'Salle de sport',
                description: '3 fois par semaine.',
                frequency: 'weekly',
                category: 'Health',
                status: 'active',
                current_streak: 2,
                best_streak: 4,
                weekly_completion_rate: 66
            }
        ];

        for (const habitData of habitsData) {
            const habit = await Habit.create({ ...habitData, user_id: user._id });

            // Generate Logs for "Boire 2L d'eau" (14 days streak)
            if (habit.title === 'Boire 2L d\'eau') {
                const logs = [];
                for (let i = 0; i < 14; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0); // Midnight
                    logs.push({
                        habit_id: habit._id,
                        date: date,
                        is_completed: true
                    });
                }
                // Add some older logs with gaps
                for (let i = 16; i < 30; i += 2) {
                     const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    logs.push({
                        habit_id: habit._id,
                        date: date,
                        is_completed: true
                    });
                }
                await HabitLog.insertMany(logs);
            }

            // Generate Logs for "Méditation" (3 days streak)
            if (habit.title === 'Méditation 10min') {
                const logs = [];
                for (let i = 0; i < 3; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    logs.push({
                        habit_id: habit._id,
                        date: date,
                        is_completed: true
                    });
                }
                await HabitLog.insertMany(logs);
            }
        }
        console.log('Habits and Logs created');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
