const ExcelJS = require('exceljs');
const prisma = require('../config/prisma');

const exportTasks = async (req, res) => {
  try {
    // Ambil parameter tanggal dari URL (query string)
    const { startDate, endDate } = req.query;

    // Siapin filter kalau tanggalnya diisi
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) // Sampai akhir hari
        }
      };
    }

    // 1. Ambil data tugas dari database sesuai filter
    const tasks = await prisma.task.findMany({
      where: dateFilter,
      include: {
        assignedTo: { select: { name: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Bikin workbook (file Excel) baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Tugas');

    // 3. Bikin Header Tabel
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Tanggal Dibuat', key: 'date', width: 20 },
      { header: 'Judul Tugas', key: 'title', width: 30 },
      { header: 'Deskripsi', key: 'description', width: 40 },
      { header: 'Lokasi', key: 'location', width: 25 },
      { header: 'Teknisi', key: 'technician', width: 20 },
      { header: 'Prioritas', key: 'priority', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Styling Header (Biar tebal dan ada warna background)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' } 
    };

    // 4. Masukin data tugas ke baris Excel
    tasks.forEach((task, index) => {
      worksheet.addRow({
        no: index + 1,
        date: new Date(task.createdAt).toLocaleDateString('id-ID'),
        title: task.title,
        description: task.description,
        location: task.location,
        technician: task.assignedTo ? task.assignedTo.name : 'Belum di-assign',
        priority: task.priority.toUpperCase(),
        status: task.status.replace('_', ' ').toUpperCase(),
      });
    });

    // 5. Set header response biar browser otomatis download file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'Laporan_FieldTask.xlsx'
    );

    // 6. Kirim file Excel ke browser
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ message: 'Gagal export Excel', error: error.message });
  }
};

module.exports = { exportTasks };