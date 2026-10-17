const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const TicketPurchase = require('../models/TicketPurchase');
const VoteTransaction = require('../models/VoteTransaction');

async function cleanup() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lastdance';
  console.log('[Cleanup] Connecting to MongoDB...');
  await mongoose.connect(mongoUri);

  console.log('[Cleanup] Searching for bad test order 6ad3e2adb82167ed486bb8cd...');
  const badOrder = await TicketPurchase.findOne({
    $or: [
      { _id: '6ad3e2adb82167ed486bb8cd' },
      { checkoutRequestID: 'ws_CO_1792271020754_e29983' }
    ]
  });

  if (badOrder) {
    console.log(`[Cleanup] Found bad order: ID=${badOrder._id}, Status=${badOrder.status}, Receipt=${badOrder.mpesaReceiptNumber}`);
    badOrder.status = 'failed';
    badOrder.mpesaReceiptNumber = '';
    badOrder.tickets = [];
    await badOrder.save();
    console.log('[Cleanup] Successfully updated bad order to failed and cleared receipt & tickets.');
  } else {
    console.log('[Cleanup] Order 6ad3e2adb82167ed486bb8cd not found or already cleaned.');
  }

  await mongoose.disconnect();
  console.log('[Cleanup] Done.');
}

cleanup().catch(err => {
  console.error('[Cleanup] Error:', err);
  process.exit(1);
});
