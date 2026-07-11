import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Setting } from '../src/modules/settings/model';

const MONGODB_URI = process.env.MONGODB_URI;

async function changePasswordInDb(newPassword: string) {
  const trimmed = newPassword.trim();
  if (!trimmed || trimmed.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully.');

    const saltRounds = 10;
    console.log('🔒 Hashing new password...');
    const hash = await bcrypt.hash(trimmed, saltRounds);

    const systemUserId = new mongoose.Types.ObjectId('000000000000000000000000');

    console.log('✍️ Updating password in database...');
    const result = await Setting.findOneAndUpdate(
      { userId: systemUserId, key: 'admin_ai_passcode_hash' },
      { value: hash },
      { upsert: true, new: true }
    );

    console.log('\n==================================================');
    console.log('✅ Admin passcode updated in DATABASE successfully!');
    console.log(`🔑 New Passcode: ${trimmed}`);
    console.log(`🔒 Hashed & Saved: ${result.value}`);
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Error during password update:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

const argPassword = process.argv[2];
if (argPassword) {
  changePasswordInDb(argPassword);
} else {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter new admin passcode to save in DB: ', (input: string) => {
    rl.close();
    changePasswordInDb(input);
  });
}
