import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  // State Form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedToId, setAssignedToId] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [formError, setFormError] = useState('');

  // State Upload
  const [showUpload, setShowUpload] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // State Statistik
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedTasks = response.data.tasks;
      setTasks(fetchedTasks);

      if (user?.role === 'admin') {
        setStats({
          total: fetchedTasks.length,
          pending: fetchedTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
          completed: fetchedTasks.filter(t => t.status === 'completed').length
        });
      }
    } catch (error) {
      console.error("Gagal ambil tugas", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/auth/technicians', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(response.data.technicians);
    } catch (error) {
      console.error("Gagal ambil teknisi", error);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const savedTheme = localStorage.getItem('theme');

    if (!token || !savedUser) {
      navigate('/');
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
    
    if (parsedUser.role === 'admin') fetchTechnicians(); 
    fetchTasks();
  }, [navigate]);

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/tasks', {
        title, description, location, priority,
        assignedToId: assignedToId || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setTitle(''); setDescription(''); setLocation(''); setPriority('medium'); setAssignedToId('');
      fetchTasks(); 
    } catch (error) {
      setFormError(error.response?.data?.message || 'Gagal bikin tugas');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
        notes: `Status diubah menjadi ${newStatus}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal update status');
    }
  };

  // Fungsi Hapus Tugas (BARU)
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Yakin mau hapus tugas ini?")) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal hapus tugas');
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photo) return alert('Pilih foto dulu bro!');
    
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('photo', photo);

    try {
      const token = localStorage.getItem('token');
      await api.post(`/upload/${selectedTaskId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      alert('Foto bukti berhasil di-upload!');
      setShowUpload(false);
      setPhoto(null);
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal upload foto');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const openMaps = (location) => {
    if (!location) return;
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (loading) return <div className="p-10 text-center dark:bg-gray-900 dark:text-white min-h-screen">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">FieldTask</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.name} • {user?.role === 'admin' ? 'Admin' : 'Teknisi'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        
        {/* STATISTIK ADMIN */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Tugas</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Belum Selesai</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center transition-colors">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selesai</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            </div>
          </div>
        )}

        {user?.role === 'admin' && (
          <button onClick={() => setShowForm(true)} className="w-full mb-6 bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors">
            + Buat Tugas Baru
          </button>
        )}

        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          {user?.role === 'admin' ? 'Semua Tugas' : 'Tugas Saya'}
        </h2>
        
        {/* DAFTAR TUGAS */}
        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm text-center text-gray-500 dark:text-gray-400 transition-colors">
            Belum ada tugas saat ini.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight pr-2">{task.title}</h3>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide whitespace-nowrap ${
                    task.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                    task.status === 'assigned' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {task.description}
                </p>

                <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-500 dark:text-red-400">📍</span>
                    <span className="flex-1 truncate">{task.location || 'Tanpa Lokasi'}</span>
                    {user?.role === 'technician' && task.location && (
                      <button onClick={() => openMaps(task.location)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Buka Maps
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500 dark:text-blue-400">👷</span>
                    <span className="font-medium text-blue-700 dark:text-blue-400">
                      {task.assignedTo ? task.assignedTo.name : 'Belum di-assign'}
                    </span>
                  </div>
                </div>
                  
                {/* AKSI UNTUK TEKNISI */}
                {user?.role === 'technician' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {task.status !== 'completed' && (
                      <div className="flex gap-2">
                        {task.status !== 'in_progress' && (
                          <button onClick={() => handleUpdateStatus(task.id, 'in_progress')} className="flex-1 bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-blue-600">
                            Mulai Kerja
                          </button>
                        )}
                        <button onClick={() => handleUpdateStatus(task.id, 'completed')} className="flex-1 bg-green-500 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-green-600">
                          Selesai
                        </button>
                      </div>
                    )}
                    <button onClick={() => { setSelectedTaskId(task.id); setShowUpload(true); }} className="w-full bg-gray-800 dark:bg-gray-700 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-900 dark:hover:bg-gray-600">
                      📷 Upload Bukti
                    </button>
                  </div>
                )}

                {/* AKSI UNTUK ADMIN (HAPUS TUGAS) */}
                {user?.role === 'admin' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button onClick={() => handleDeleteTask(task.id)} className="text-xs text-red-500 font-semibold hover:text-red-700 bg-red-50 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-md">
                      🗑️ Hapus Tugas
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL BIKIN TUGAS */}
      {showForm && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Buat Tugas Baru</h2>
            {formError && <p className="text-red-500 text-sm mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded">{formError}</p>}
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Tugas</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="3" className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioritas</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teknisi</label>
                  <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Pilih (Opsional)</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Batal</button>
                <button type="submit" className="px-4 py-2 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700">Simpan Tugas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UPLOAD */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md transition-colors">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Upload Bukti Foto</h2>
            <form onSubmit={handleUploadPhoto} className="space-y-4">
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} required className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-gray-600" />
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Batal</button>
                <button type="submit" disabled={uploadLoading} className="px-4 py-2 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700">
                  {uploadLoading ? 'Mengupload...' : 'Upload Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;