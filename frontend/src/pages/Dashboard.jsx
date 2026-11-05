import { useState, useEffect } from 'react';
import api from '../services/api';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State buat Form Bikin Tugas
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedToId, setAssignedToId] = useState(''); // BARU: Buat nyimpen ID teknisi
  const [technicians, setTechnicians] = useState([]); // BARU: Buat nyimpen list teknisi
  const [formError, setFormError] = useState('');

  // Fungsi Ambil Tugas
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Gagal ambil tugas", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Ambil Daftar Teknisi (BARU)
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
    if (savedUser) setUser(JSON.parse(savedUser));
    
    fetchTasks();
    fetchTechnicians(); // Panggil teknisi pas halaman dimuat
  }, []);

  // Fungsi Bikin Tugas Baru
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const token = localStorage.getItem('token');
      await api.post('/tasks', {
        title,
        description,
        location,
        priority,
        assignedToId: assignedToId || null // Masukin ID teknisi kalau ada
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Kalau sukses, tutup form, kosongin input, dan refresh data
      setShowForm(false);
      setTitle('');
      setDescription('');
      setLocation('');
      setPriority('medium');
      setAssignedToId('');
      fetchTasks(); 
      
    } catch (error) {
      setFormError(error.response?.data?.message || 'Gagal bikin tugas');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
          <div>
            <h1 className="text-xl font-bold text-blue-600">Dashboard FieldTask</h1>
            <p className="text-sm text-gray-600">Halo, {user?.name} ({user?.role})</p>
          </div>
          <div className="space-x-2">
            {user?.role === 'admin' && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Buat Tugas
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Form Pop-up (Modal) Bikin Tugas */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h2 className="text-lg font-bold mb-4">Buat Tugas Baru</h2>
              {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
              
              <form onSubmit={handleCreateTask} className="space-y-3">
                <input type="text" placeholder="Judul Tugas" value={title} onChange={(e) => setTitle(e.target.value)} required
                  className="w-full px-3 py-2 border rounded-md" />
                
                <textarea placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} required
                  className="w-full px-3 py-2 border rounded-md" rows="2"></textarea>
                
                <input type="text" placeholder="Lokasi" value={location} onChange={(e) => setLocation(e.target.value)} required
                  className="w-full px-3 py-2 border rounded-md" />
                
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                {/* DROPDOWN TEKNISI BARU */}
                <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md">
                  <option value="">-- Pilih Teknisi (Opsional) --</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                  ))}
                </select>

                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">Batal</button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Daftar Tugas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Daftar Tugas</h2>
          
          {tasks.length === 0 ? (
            <p className="text-gray-500">Belum ada tugas.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border border-gray-200 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{task.title}</h3>
                      <p className="text-gray-600">{task.description}</p>
                      <p className="text-sm text-gray-500 mt-1">📍 {task.location || 'Tanpa Lokasi'}</p>
                      {/* Nampilin siapa teknisinya */}
                      <p className="text-sm text-blue-600 mt-1 font-semibold">
                        👷 {task.assignedTo ? task.assignedTo.name : 'Belum di-assign'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      task.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;