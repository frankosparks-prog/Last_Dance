const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const lastDanceRoutes = require('./routes/lastDanceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const Candidate = require('./models/Candidate');
const LastDanceSettings = require('./models/LastDanceSettings');
const ServiceItem = require('./models/ServiceItem');

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

// Enable Socket.IO to receive connections via /api/socket.io through reverse proxies
server.prependListener('request', (req, res) => {
  if (req.url && req.url.startsWith('/api/socket.io')) {
    req.url = req.url.replace(/^\/api\/socket\.io/, '/socket.io');
  }
});
server.prependListener('upgrade', (req, socket, head) => {
  if (req.url && req.url.startsWith('/api/socket.io')) {
    req.url = req.url.replace(/^\/api\/socket\.io/, '/socket.io');
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Socket.IO event listeners
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint (handles both /api/health and /health if /api is stripped by reverse proxy)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    service: 'Last Dance Module Server',
    time: new Date(),
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// PayHero & M-Pesa direct callback handler catch-all
const lastDanceController = require('./controllers/lastDanceController');
app.post(
  ['/api/payhero/callback', '/payhero/callback', '/api/last-dance/callback', '/last-dance/callback', '/callback'],
  lastDanceController.handlePaymentCallback
);

// Main API Routes (mounted on both prefixes so requests with or without /api prefix work)
app.use(['/api/last-dance/services', '/last-dance/services', '/api/services', '/services'], serviceRoutes);
app.use(['/api/last-dance', '/last-dance'], lastDanceRoutes);

// Database connection & Seed Mock Test Data
const PORT = process.env.PORT || 5001;
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

    // 3. Seed Sample Services / Merchandise if service table is empty
    const serviceCount = await ServiceItem.countDocuments();
    if (serviceCount === 0) {
      console.log('[Seed] Seeding initial marketplace services & merchandise...');
      const sampleServices = [
        {
          title: 'Glam Graduation Red-Carpet Makeup',
          category: 'Makeup Artist',
          description: 'Full face red-carpet glamour including premium lash application, contouring, and 12-hour setting spray for photo perfection.',
          imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
          totalPriceKES: 1500,
          depositAmountKES: 50,
          stockOrSlots: 20,
          featured: true,
          providerName: 'Sarah Glam Beauty',
          providerContact: '0711223344',
          internalNotes: 'On-campus booth 2 or hostel room callout available'
        },
        {
          title: 'Luxury Acrylic Sculpting & Gel Nail Art',
          category: 'Nail Tech',
          description: 'Custom luxury shape acrylic tips with hand-painted nail art, chrome finish, or glitter gradient for your send-off night.',
          imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80',
          totalPriceKES: 1200,
          depositAmountKES: 50,
          stockOrSlots: 15,
          featured: true,
          providerName: 'Vee Nail Haven',
          providerContact: '0722334455',
          internalNotes: 'All instruments UV-sterilized'
        },
        {
          title: 'Official Last Dance Festival 2026 Hoodie',
          category: 'Merchandise',
          description: 'Heavyweight fleece embroidered festival send-off hoodie. Available in Electric Indigo and Midnight Black (Sizes S-XXL).',
          imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
          totalPriceKES: 2200,
          depositAmountKES: 100,
          stockOrSlots: 50,
          featured: true,
          providerName: 'Last Dance Merch Team',
          providerContact: '0733445566',
          internalNotes: 'Collection point: Main Quad Student Center'
        },
        {
          title: 'Signature "Class of \'26" Commemorative T-Shirt',
          category: 'Merchandise',
          description: '100% combed cotton festival t-shirt with high-density gradient print and graduation year commemorative crest.',
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          totalPriceKES: 850,
          depositAmountKES: 50,
          stockOrSlots: 100,
          featured: false,
          providerName: 'Last Dance Merch Team',
          providerContact: '0733445566',
          internalNotes: 'Includes festival lanyard'
        },
        {
          title: 'Executive Hair Styling, Updos & Barber Fade',
          category: 'Hair & Styling',
          description: 'Sharp clean fades, razor line-ups, or sleek styling and curls to match your evening attire.',
          imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
          totalPriceKES: 1000,
          depositAmountKES: 50,
          stockOrSlots: 25,
          featured: false,
          providerName: 'Crown Studio Barbers',
          providerContact: '0744556677',
          internalNotes: 'Available on-site and room callout'
        }
      ];

      await ServiceItem.insertMany(sampleServices);
      console.log(`[Seed] Successfully seeded ${sampleServices.length} marketplace services & merchandise.`);
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
