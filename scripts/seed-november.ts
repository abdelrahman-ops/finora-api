import fs from 'fs';
import path from 'path';
import { connectDatabase, disconnectDatabase } from '../src/common/config/database';
import { Wallet } from '../src/modules/wallets/model';
import { Transaction } from '../src/modules/transactions/model';
import { User } from '../src/modules/users/model';
import { Category } from '../src/modules/categories/model';
import mongoose from 'mongoose';

const TARGET_EMAIL = 'abdelrahmantest@gmail.com';
const NOV_DIR = path.join(__dirname, '../secret/november');

async function seedNovember() {
  await connectDatabase();

  const user = await User.findOne({ email: TARGET_EMAIL });
  if (!user) {
    console.error(`User ${TARGET_EMAIL} not found`);
    return process.exit(1);
  }
  const userId = user._id;

  // Find a wallet, preferably 'cash'
  let wallet = await Wallet.findOne({ userId, type: 'cash' });
  if (!wallet) {
    wallet = await Wallet.findOne({ userId }); // fallback
  }
  if (!wallet) {
    console.error(`No wallet found for user ${userId}. Please create one first.`);
    return process.exit(1);
  }
  const accountId = wallet._id;

  // Find an "Other" category to default to, or null
  const otherCategory = await Category.findOne({ 
    $or: [{ userId }, { isDefault: true }],
    name: { $regex: /^other$/i }
  });
  const categoryId = otherCategory ? otherCategory._id : undefined;

  const files = fs.readdirSync(NOV_DIR).filter(f => f.endsWith('.txt'));

  let totalInserted = 0;

  for (const file of files) {
    const dayMatch = file.match(/^(\d+)\.txt$/);
    if (!dayMatch) continue;
    
    const day = parseInt(dayMatch[1], 10);
    // Date: YYYY-MM-DD
    const date = new Date(Date.UTC(2025, 10, day, 12, 0, 0)); // 10 is Nov (0-indexed)

    const content = fs.readFileSync(path.join(NOV_DIR, file), 'utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // If it's the last line and it's just a number, it's likely a total. Skip.
        if (i === lines.length - 1 && /^[\d\.]+$/.test(line)) {
            console.log(`Skipping total line in ${file}: ${line}`);
            continue;
        }

        // Split by '+' for combo lines like "40 chips + 17 drink"
        const parts = line.split('+').map(p => p.trim()).filter(p => p.length > 0);

        for (const part of parts) {
            let amount = 0;
            let name = part;

            // Optional trailing multiplier: "patates x3" -> matches "x3" at the end
            let multiplier = 1;
            const trailingMatch = name.match(/\s*[xX×*]\s*(\d+(?:\.\d+)?)$/);
            if (trailingMatch) {
                multiplier = parseFloat(trailingMatch[1]);
                name = name.substring(0, trailingMatch.index).trim();
            }

            // Leading number logic: "8 x 10 coffee" or "35 patates"
            const leadMatch = name.match(/^(\d+(?:\.\d+)?)\s*(?:[xX×*]\s*(\d+(?:\.\d+)?))?\s*(.*)$/);
            
            if (leadMatch) {
                const num1 = parseFloat(leadMatch[1]);
                const num2 = leadMatch[2] ? parseFloat(leadMatch[2]) : 1;
                amount = num1 * num2 * multiplier; // combine multipliers if both exist (rare)
                name = leadMatch[3] || 'Expense';
            } else {
                amount = 0; // "Medicine for aya"
            }

            if (name.trim() === '') name = 'Expense';

            await Transaction.create({
                userId,
                amount,
                type: 'expense',
                name,
                accountId,
                categoryId,
                date,
                createdAt: new Date()
            });
            totalInserted++;
            console.log(`Inserted: Nov ${day} | Amount: ${amount} | Desc: ${name}`);
        }
    }
  }

  console.log(`Successfully inserted ${totalInserted} transactions for November 2025.`);
  await disconnectDatabase();
}

seedNovember().catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
