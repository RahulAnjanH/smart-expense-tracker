const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Category = require('./models/Category');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Expense.deleteMany({});

    // Seed Users
    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password456', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const insertedUsers = await User.insertMany(users);
    const userId = insertedUsers[0]._id;

    // Seed Categories
    const categories = [
      { name: 'Food', description: 'Meals and groceries', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Travel', description: 'Transportation and trips', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Utilities', description: 'Bills and services', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Entertainment', description: 'Leisure activities', createdAt: new Date(), updatedAt: new Date() },
    ];
    const insertedCategories = await Category.insertMany(categories);

    // Seed Expenses
    const expenses = [
      {
        userId,
        description: 'Groceries at Walmart',
        amount: 45.99,
        date: new Date('2025-04-19'),
        categoryId: insertedCategories.find(cat => cat.name === 'Food')._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        description: 'Train ticket',
        amount: 30.0,
        date: new Date('2025-04-20'),
        categoryId: insertedCategories.find(cat => cat.name === 'Travel')._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        description: 'Electricity bill',
        amount: 75.5,
        date: new Date('2025-04-18'),
        categoryId: insertedCategories.find(cat => cat.name === 'Utilities')._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        description: 'Movie tickets',
        amount: 25.0,
        date: new Date('2025-04-21'),
        categoryId: insertedCategories.find(cat => cat.name === 'Entertainment')._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await Expense.insertMany(expenses);

    console.log('Database seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
    mongoose.connection.close();
  }
};

seedData();