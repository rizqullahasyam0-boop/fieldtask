const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Setup Prisma 7 dengan Adapter
const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 1. Fungsi Register (Daftar)
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Cek apakah email udah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar!' });
    }

    // Hash password (acak password)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Simpan ke database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'technician', // Default jadi teknisi kalau kosong
        phone,
      },
    });

    res.status(201).json({ 
      message: 'User berhasil didaftarkan!', 
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// 2. Fungsi Login (Masuk)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan!' });
    }

    // Cocokkan password yang diketik dengan yang di database
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password salah!' });
    }

    // Bikin Token JWT (berlaku 1 hari)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'Login berhasil!', 
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

module.exports = { register, login };