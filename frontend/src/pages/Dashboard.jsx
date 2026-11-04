import { useState, useEffect } from 'react';
import api from '../services/api';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

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

    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
          <div>
            <h1 className="text-xl font-bold text-blue-600">Dashboard FieldTask</h1>
            <p className="text-sm text-gray-600">Halo, {user?.name} ({user?.role})</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

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
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
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