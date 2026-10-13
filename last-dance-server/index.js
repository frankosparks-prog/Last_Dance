const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const lastDanceRoutes = require('./routes/lastDanceRoutes');
const Candidate = require('./models/Candidate');
const LastDanceSettings = require('./models/LastDanceSettings');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS enabled
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Set global socket instance so controllers can broadcast real-time events
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO event listeners
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Last Dance Module Server',
    time: new Date(),
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Test Simulation Endpoint for instant M-Pesa approval (useful during testing & demo)
app.post('/api/last-dance/test-simulate-payment', async (req, res) => {
  const { checkoutRequestID } = req.body;
  if (!checkoutRequestID) {
    return res.status(400).json({ success: false, message: 'checkoutRequestID is required' });
  }

  const lastDanceController = require('./controllers/lastDanceController');
  
  // Fake a successful M-Pesa STK callback
  const fakeCallbackReq = {
    body: {
      checkoutRequestID,
      success: true,
      mpesaReceiptNumber: `NL${Date.now().toString().slice(-7)}`,
      amountPaid: 500
    }
  };

  return lastDanceController.handlePaymentCallback(fakeCallbackReq, res);
});

// Main API Routes
app.use('/api/last-dance', lastDanceRoutes);

// Database connection & Seed Mock Test Data
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/last_dance_db';

const seedInitialData = async () => {
  try {
    // 1. Ensure Global Settings exist
    let settings = await LastDanceSettings.findOne({ key: 'global' });
    if (!settings) {
      settings = await LastDanceSettings.create({
        key: 'global',
        enabled: true,
        eventDate: '2026-10-26',
        eventTitle: 'Last Dance 2026',
        tagline: 'One Last Night. One Last Dance.',
        ticketPriceKES: 500,
        categories: [
          'Mr & Miss Last Dance',
          'Most Likely to Succeed',
          'Best Dressed / Most Stylish',
          'Life of the Party',
          'Power Couple',
          'Campus Icon',
          'Comeback King/Queen',
          'Squad of the Year',
          'Most Missed'
        ],
        votePackages: [
          { label: 'Single Vote', votes: 1, priceKES: 10, discountText: '', isPopular: false },
          { label: '10-Vote Power Pack', votes: 10, priceKES: 90, discountText: 'Save 10%', isPopular: true },
          { label: '25-Vote Boost Pack', votes: 25, priceKES: 200, discountText: 'Save 20%', isPopular: false },
          { label: '50-Vote Legend Pack', votes: 50, priceKES: 380, discountText: 'Save 24%', isPopular: false }
        ]
      });
      console.log('[Seed] Default settings initialized.');
    }

    // 2. Seed Mock Nominees if candidates table is empty
    const count = await Candidate.countDocuments();
    if (count === 0) {
      console.log('[Seed] Seeding sample candidates...');
      const sampleCandidates = [
        {
          name: 'Alexandre & Sophia',
          photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
          oneLiner: 'The duo that stole everyone\'s hearts on campus!',
          pitch: 'From day 1 orientation to final year research labs, we have danced through every semester together.',
          category: 'Mr & Miss Last Dance',
          isApproved: true,
          voteCount: 420
        },
        {
          name: 'Marcus Vance',
          photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
          oneLiner: 'Bringing the highest energy and best runway looks.',
          pitch: 'Styling has always been a passion. Let\'s close this chapter in absolute elegance.',
          category: 'Best Dressed / Most Stylish',
          isApproved: true,
          voteCount: 385
        },
        {
          name: 'Elena Rostova',
          photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
          oneLiner: 'Tech Innovator & Future CEO.',
          pitch: 'Building scalable systems by day and organizing campus hackathons by night.',
          category: 'Most Likely to Succeed',
          isApproved: true,
          voteCount: 310
        },
        {
          name: 'DJ Ray & The Hype Squad',
          photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
          oneLiner: 'If there\'s music playing, we\'re in the center ring.',
          pitch: 'We turned every Friday evening into an unforgettable festival.',
          category: 'Life of the Party',
          isApproved: true,
          voteCount: 295
        },
        {
          name: 'Brian & Clara',
          photoUrl: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=600&auto=format&fit=crop&q=80',
          oneLiner: 'Campus Power Couple 2026.',
          pitch: 'Four years of library dates, coffee runs, and mutual support.',
          category: 'Power Couple',
          isApproved: true,
          voteCount: 260
        },
        {
          name: 'David Ochieng',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
          oneLiner: 'Student Leader & Community Catalyst.',
          pitch: 'Representing student voices with integrity and relentless drive.',
          category: 'Campus Icon',
          isApproved: true,
          voteCount: 240
        },
        {
          name: 'Samantha Jenkins',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
          oneLiner: 'The comeback story of the decade.',
          pitch: 'Overcame every hurdle to reach graduation eve standing stronger than ever.',
          category: 'Comeback King/Queen',
          isApproved: true,
          voteCount: 190
        }
      ];

      await Candidate.insertMany(sampleCandidates);
      console.log(`[Seed] Successfully seeded ${sampleCandidates.length} candidate nominees.`);
    }
  } catch (err) {
    console.error('[Seed] Error during seeding:', err.message);
  }
};

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('[Database] Connected to MongoDB database');
    await seedInitialData();
  })
  .catch((err) => {
    console.warn('[Database] MongoDB connection issue:', err.message);
    console.warn('[Database] Server will continue running with mock handlers.');
  });

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Last Dance Backend Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/last-dance`);
  console.log(`⚡ WebSocket Server active on http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
