const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

// Baca file ca.pem dari folder certs
const caCert = fs.readFileSync(path.join(__dirname, '../../certs/ca.pem'), 'utf8');

// Setup Adapter dengan SSL Certificate
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
  },
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;