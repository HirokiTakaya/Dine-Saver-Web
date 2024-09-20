
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const ExpenseSchema = new mongoose.Schema({
  name: String,
  date: String,
  amount: Number,
});


const UserProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  gender: String,
  dateOfBirth: Date,
});


UserProfileSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  }
  next();
});

const Expense = mongoose.model('Expense', ExpenseSchema);
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

export const getExpenses = async () => {
  try {
    return await Expense.find();
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

export const addExpense = async (expenseData) => {
  const expense = new Expense(expenseData);
  try {
    return await expense.save();
  } catch (error) {
    console.error('Error saving new expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const result = await Expense.findByIdAndDelete(id);
    if (result == null) {
      throw new Error('Expense not found');
    }
    return result;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};


export const getUserProfile = async (username) => {
  try {
    return await UserProfile.findOne({ username }).select('+password');
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (username, profileData) => {
  try {
    if (profileData.password) {
      profileData.password = await bcrypt.hash(profileData.password, 10);
    }
    return await UserProfile.findOneAndUpdate({ username }, profileData, { new: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};


export { Expense, UserProfile };
