const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params; // ID tugas
    const uploadedById = req.user.id; // Diambil dari token JWT

    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan. Pastikan sudah memilih gambar.' });
    }

    // URL file yang bisa diakses dari browser
    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId: id,
        uploadedById,
        fileUrl: fileUrl,
        fileType: req.file.mimetype,
      },
    });

    res.status(201).json({ 
      message: 'Foto berhasil di-upload!', 
      attachment: attachment,
      url: fileUrl 
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

module.exports = { uploadAttachment };