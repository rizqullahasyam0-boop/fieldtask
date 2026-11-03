const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// 1. Admin bikin tugas
const createTask = async (req, res) => {
  try {
    const { title, description, location, priority, assignedToId } = req.body;
    const createdById = req.user.id;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        location,
        priority,
        createdById,
        assignedToId: assignedToId || null,
        status: assignedToId ? 'assigned' : 'pending',
      },
    });

    res.status(201).json({ message: 'Tugas berhasil dibuat!', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// 2. Ambil semua tugas
const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await prisma.task.findMany({ include: { assignedTo: true } });
    } else {
      tasks = await prisma.task.findMany({ 
        where: { assignedToId: req.user.id },
        include: { createdBy: true }
      });
    }
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// 3. Update status tugas
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    await prisma.taskUpdate.create({
      data: {
        taskId: id,
        updatedById: req.user.id,
        newStatus: status,
        notes: notes || 'Status diperbarui',
      },
    });

    res.status(200).json({ message: 'Status tugas berhasil diperbarui!', task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTaskStatus };