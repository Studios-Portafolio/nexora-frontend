import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client'; 
import { 
  ShieldCheck, Users, Ban, CheckCircle, Search, LogOut, AlertTriangle, 
  Settings, ShieldAlert, CalendarDays, X, Plus, Loader2, Copy, Check,
  Headphones, MessageSquare, Send 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://nexora-api-psrx.onrender.com/api/admin';
const API_URL = 'https://nexora-api-psrx.onrender.com/api'; 
const SOCKET_URL = 'https://nexora-api-psrx.onrender.com'; 

export default function AdminPanel() {
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<'directorio' | 'soporte'>('directorio');

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<any | null>(null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const supportChatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());
  const selectedChatUserRef = useRef(selectedChatUser);

  useEffect(() => {
    selectedChatUserRef.current = selectedChatUser;
  }, [selectedChatUser]);

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 FUNCIÓN CON RASTREADOR VISUAL PARA EL TELÉFONO 🔥
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('nexora_token'); 
      if (!token) {
        alert("⚠️ No tienes un token de sesión activo. Debes iniciar sesión de nuevo.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      
      if (response.data.success) {
        setUsers(response.data.data || []);
      } else {
        alert("❌ El servidor respondió, pero con error: " + response.data.message);
      }
    } catch (error: any) {
      // ESTA ES LA LÍNEA CLAVE QUE NOS DIRÁ QUÉ ESTÁ BLOQUEANDO LA NUBE
      alert("🛑 Bloqueo del servidor: " + (error.response?.data?.message || error.message));
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('receive_message', (data: any) => {
      const currentChatId = selectedChatUserRef.current?.id;
      if (currentChatId === data.userId) {
        setSupportMessages((prev) => {
          const safePrev = prev || [];
          const exists = safePrev.some(msg => msg.id === data.id);
          if (exists) return safePrev;
          return [...safePrev, data]; 
        });
      } else {
        setUnreadChats(prev => new Set(prev).add(data.userId));
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentView === 'soporte' && supportChatEndRef.current) {
      supportChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages, currentView]);

  const fetchActiveChats = async () => {
    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/chat/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setActiveChats(res.data.data || []);
      }
    } catch (err) {
      console.error("Error cargando lista de chats", err);
    }
  };

  useEffect(() => {
    if (currentView === 'soporte') {
      fetchActiveChats();
    }
  }, [currentView]);

  const handleSelectChat = async (user: any) => {
    setSelectedChatUser(user);
    setSupportMessages([]); 
    
    setUnreadChats(prev => {
      const next = new Set(prev);
      next.delete(user.id);
      return next;
    });

    if (socketRef.current) {
      socketRef.current.emit('join_chat', user.id);
    }

    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/chat/messages/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSupportMessages(res.data.data || []);
      }
    } catch (err) {
      console.error("Error cargando historial del chat", err);
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim() || !selectedChatUser) return;

    setIsSendingSupport(true);
    const messageData = {
      userId: selectedChatUser.id, 
      content: supportInput.trim(),
      isAdmin: true 
    };

    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.post(`${API_URL}/chat/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        if (socketRef.current) {
          socketRef.current.emit('send_message', res.data.data);
        }
        setSupportInput('');
      }
    } catch (err) {
      alert("Error al enviar el mensaje.");
    } finally {
      setIsSendingSupport(false);
    }
  };


  const handleStatusChange = async (userId: string, newStatus: string, monthsToAdd?: number) => {
    const actionText = newStatus === 'BLOCKED' ? 'BLOQUEAR' : 'ACTIVAR';
    if (!window.confirm(`¿Estás seguro de que deseas ${actionText} a este usuario?`)) return;
    
    try {
      const token = localStorage.getItem('nexora_token'); 
      await axios.put(`${API_BASE}/users/${userId}`, { status: newStatus, monthsToAdd }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      if(isModalOpen) setIsModalOpen(false);
    } catch (error) {
      alert('Error al actualizar el estado del usuario.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openManageModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setCopied(false);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDaysRemaining = (subscriptionEnd: string | null) => {
    if (!subscriptionEnd) return null;
    const endDate = new Date(subscriptionEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const safeUsers = users || [];
  const clientsOnly = safeUsers.filter(u => u?.role !== 'ADMIN');
  const activeClients = clientsOnly.filter(u => u?.status === 'ACTIVE').length;
  const blockedClients = clientsOnly.filter(u => u?.status === 'BLOCKED').length;

  const filteredUsers = clientsOnly.filter(user => 
    user?.email?.toLowerCase().includes(search?.toLowerCase() || '') || 
    user?.name?.toLowerCase().includes(search?.toLowerCase() || '')
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-12 select-none">
      
      {/* Navbar Admin */}
      <div className="bg-stone-900 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-40 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">NEXORA CEO</h1>
              <p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase mt-0.5">Control Central</p>
            </div>
            <span className="ml-3 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black px-2 py-1 rounded-full tracking-widest">
              v1.1
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex bg-stone-800 rounded-xl p-1 shadow-inner border border-stone-700">
          <button 
            onClick={() => {setCurrentView('directorio'); setSelectedChatUser(null);}} 
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${currentView === 'directorio' ? 'bg-indigo-600 text-white shadow-md' : 'text-stone-400 hover:text-white'}`}
          >
            Directorio
          </button>
          <button 
            onClick={() => setCurrentView('soporte')} 
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 relative ${currentView === 'soporte' ? 'bg-teal-600 text-white shadow-md' : 'text-stone-400 hover:text-white'}`}
          >
            <Headphones className="w-4 h-4" /> Soporte
            {unreadChats.size > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-stone-800"></span>
              </span>
            )}
          </button>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 text-stone-400 hover:text-white font-bold text-sm transition-colors bg-stone-800 px-4 py-2 rounded-lg">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>

      {/* Pestañas Móvil */}
      <div className="flex md:hidden bg-stone-800 p-1 mb-4 shadow-inner border-b border-stone-700">
          <button 
            onClick={() => {setCurrentView('directorio'); setSelectedChatUser(null);}} 
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${currentView === 'directorio' ? 'bg-indigo-600 text-white shadow-md' : 'text-stone-400 hover:text-white'}`}
          >
            Directorio
          </button>
          <button 
            onClick={() => setCurrentView('soporte')} 
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${currentView === 'soporte' ? 'bg-teal-600 text-white shadow-md' : 'text-stone-400 hover:text-white'}`}
          >
            <Headphones className="w-4 h-4" /> Soporte
            {unreadChats.size > 0 && (
              <span className="absolute top-1 right-[20%] flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </button>
      </div>

      <div className="p-4 md:p-10 max-w-7xl mx-auto">

        {currentView === 'directorio' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-bold text-stone-500 mb-1 uppercase tracking-wider">Total Clientes</p>
                  <h3 className="text-4xl font-black text-stone-900">{clientsOnly.length}</h3>
                </div>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center"><Users className="text-indigo-600 w-7 h-7" /></div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-bold text-stone-500 mb-1 uppercase tracking-wider">Activos</p>
                  <h3 className="text-4xl font-black text-teal-600">{activeClients}</h3>
                </div>
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center"><CheckCircle className="text-teal-600 w-7 h-7" /></div>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-bold text-stone-500 mb-1 uppercase tracking-wider">Bloqueados</p>
                  <h3 className="text-4xl font-black text-rose-600">{blockedClients}</h3>
                </div>
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center"><Ban className="text-rose-600 w-7 h-7" /></div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">Directorio de Cuentas</h2>
                {search && <p className="text-sm text-indigo-600 font-bold mt-1">Mostrando {filteredUsers.length} resultados</p>}
              </div>
              <div className="relative w-full md:w-auto shadow-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-80 pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
              </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-lg border border-stone-100 overflow-hidden animate-in fade-in">
              <div className="max-h-[60vh] overflow-y-auto w-full custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-stone-50/80 sticky top-0 z-10 border-b border-stone-200 backdrop-blur-md">
                    <tr>
                      <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest">Cliente</th>
                      <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest">Registro</th>
                      <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest">Estado</th>
                      <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest">Tiempo Restante</th>
                      <th className="p-5 text-xs font-black text-stone-500 uppercase tracking-widest text-right">Ajustes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {loading ? (
                      <tr><td colSpan={5} className="p-10 text-center text-stone-400 font-bold"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/> Cargando directorio...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-stone-400 font-bold">No se encontraron clientes.</td></tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const daysRemaining = getDaysRemaining(user?.subscriptionEnd);
                        const isExpired = daysRemaining !== null && daysRemaining <= 0;

                        return (
                          <tr key={user?.id} className={`transition-colors ${isExpired && user?.status !== 'BLOCKED' ? 'bg-rose-50/30' : 'hover:bg-stone-50'}`}>
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                                  {user?.name?.substring(0, 2).toUpperCase() || 'NA'}
                                </div>
                                <div>
                                  <p className="font-bold text-stone-900 text-sm truncate max-w-[200px]">{user?.name}</p>
                                  <p className="text-xs text-stone-500 font-medium truncate max-w-[200px]">{user?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                               <span className="text-sm font-bold text-stone-600">
                                 {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                               </span>
                            </td>
                            <td className="p-5">
                              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                                user?.status === 'ACTIVE' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {user?.status || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="p-5">
                              {daysRemaining !== null ? (
                                <div className="flex items-center gap-2">
                                  {isExpired ? (
                                    <span className="flex items-center gap-1 text-rose-600 font-black text-xs bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                                      <AlertTriangle className="w-3.5 h-3.5" /> Vencido
                                    </span>
                                  ) : (
                                    <span className={`font-bold text-sm ${daysRemaining <= 5 ? 'text-amber-600' : 'text-stone-600'}`}>
                                      Quedan {daysRemaining} días
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-stone-400 font-medium text-sm">Sin registro</span>
                              )}
                            </td>
                            <td className="p-5 text-right">
                              <button 
                                onClick={() => openManageModal(user)}
                                className="inline-flex items-center justify-center p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100"
                              >
                                <Settings className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CHAT DE SOPORTE */}
        {currentView === 'soporte' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col md:flex-row h-[calc(100vh-14rem)] md:h-[calc(100vh-10rem)] min-h-[500px] gap-0 md:gap-6">
            
            <div className={`w-full md:w-1/3 bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden flex-col ${selectedChatUser ? 'hidden md:flex' : 'flex'} h-full md:h-auto`}>
               <div className="p-5 border-b border-stone-100 bg-stone-50">
                 <h2 className="font-black text-stone-900 text-lg flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-teal-600" /> Consultas Activas
                 </h2>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                 {(activeChats || []).length === 0 ? (
                   <p className="text-center text-stone-400 text-sm mt-10 font-bold">No hay clientes registrados.</p>
                 ) : (
                   (activeChats || []).map(user => {
                     const hasUnread = unreadChats.has(user?.id);
                     
                     return (
                       <button 
                         key={user?.id}
                         onClick={() => handleSelectChat(user)}
                         className={`w-full flex items-center p-3 rounded-2xl transition-all border relative ${
                           selectedChatUser?.id === user?.id 
                             ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-sm' 
                             : 'bg-white border-transparent hover:bg-stone-50 text-stone-700'
                         }`}
                       >
                         {hasUnread && (
                           <span className="absolute top-1/2 right-4 -translate-y-1/2 w-3 h-3 bg-rose-500 rounded-full shadow-sm animate-pulse border border-white"></span>
                         )}

                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 mr-3 ${
                            selectedChatUser?.id === user?.id ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-500'
                         }`}>
                           {user?.name?.substring(0, 2).toUpperCase() || 'NA'}
                         </div>
                         <div className="text-left min-w-0 flex-1">
                           <p className={`font-black text-sm truncate ${hasUnread ? 'text-rose-600' : ''}`}>{user?.name}</p>
                           <p className={`text-xs truncate ${selectedChatUser?.id === user?.id ? 'text-teal-600 font-semibold' : 'text-stone-400'}`}>
                             {user?.email}
                           </p>
                         </div>
                       </button>
                     )
                   })
                 )}
               </div>
            </div>

            <div className={`flex-1 bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden flex-col relative ${!selectedChatUser ? 'hidden md:flex' : 'flex'} h-full md:h-auto`}>
              {selectedChatUser ? (
                <>
                  <div className="p-5 border-b border-stone-100 bg-teal-600 text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <button 
                        onClick={() => setSelectedChatUser(null)} 
                        className="md:hidden mr-3 p-2 bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 font-black">
                        {selectedChatUser?.name?.substring(0, 2).toUpperCase() || 'NA'}
                      </div>
                      <div>
                        <h3 className="font-black text-lg leading-tight">{selectedChatUser?.name}</h3>
                        <p className="text-xs text-teal-100 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span> 
                          Sesión Segura Activa
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50 custom-scrollbar">
                    {(supportMessages || []).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400">
                        <MessageSquare className="w-12 h-12 mb-3 text-stone-200" />
                        <p className="font-bold text-sm">No hay mensajes en este chat.</p>
                      </div>
                    ) : (
                      (supportMessages || []).map((msg, idx) => (
                        <div key={msg?.id || idx} className={`flex ${msg?.isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-4 rounded-3xl max-w-[80%] text-sm font-medium leading-relaxed shadow-sm ${
                            msg?.isAdmin 
                              ? 'bg-teal-600 text-white rounded-br-sm' 
                              : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm whitespace-pre-wrap'
                          }`}>
                            {msg?.content}
                            <div className={`text-[9px] mt-1.5 text-right ${msg?.isAdmin ? 'text-teal-200' : 'text-stone-400'}`}>
                              {new Date(msg?.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={supportChatEndRef} />
                  </div>

                  <form onSubmit={handleSendAdminMessage} className="p-4 bg-white border-t border-stone-100 flex-shrink-0">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder={`Escribe a ${selectedChatUser?.name?.split(' ')[0] || 'usuario'}...`} 
                        className="w-full pl-6 pr-16 py-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none font-medium text-sm focus:border-teal-400 focus:bg-white transition-colors" 
                        value={supportInput} 
                        onChange={(e) => setSupportInput(e.target.value)} 
                        disabled={isSendingSupport} 
                      />
                      <button 
                        type="submit" 
                        disabled={!supportInput.trim() || isSendingSupport} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-teal-600 text-white rounded-xl shadow-md hover:bg-teal-700 disabled:opacity-50 transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                  <Headphones className="w-16 h-16 mb-4 text-stone-200" />
                  <h3 className="text-xl font-black text-stone-700 mb-1">Centro de Soporte</h3>
                  <p className="font-medium text-sm">Selecciona un cliente de la lista para ver su historial y chatear.</p>
                </div>
              )}
            </div>
            
          </div>
        )}

      </div>

      {/* MODAL DE GESTIÓN AVANZADA */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-stone-50 border-b border-stone-100 p-6 flex justify-between items-start">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl shadow-inner shrink-0">
                    {selectedUser?.name?.substring(0, 2).toUpperCase() || 'NA'}
                 </div>
                 <div className="min-w-0 pr-2">
                   <h2 className="text-xl font-black text-stone-900 tracking-tight truncate">{selectedUser?.name}</h2>
                   <div className="flex items-center gap-2 mt-1">
                     <p className="text-sm text-stone-500 font-medium truncate">{selectedUser?.email}</p>
                     <button onClick={() => copyEmail(selectedUser?.email)} className="p-1 text-stone-400 hover:text-indigo-600 transition-colors" title="Copiar correo">
                       {copied ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                     </button>
                   </div>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white hover:bg-stone-100 rounded-full shadow-sm border border-stone-200 text-stone-400 shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Métricas Actuales</h3>
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 mb-6 flex justify-between items-center">
                 <div>
                   <p className="text-xs font-bold text-stone-500 mb-1">Estado de Cuenta</p>
                   <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${selectedUser?.status === 'ACTIVE' ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>{selectedUser?.status}</span>
                 </div>
                 <div className="text-right">
                   <p className="text-xs font-bold text-stone-500 mb-1">Vencimiento</p>
                   <p className="text-sm font-black text-stone-800">{selectedUser?.subscriptionEnd ? new Date(selectedUser.subscriptionEnd).toLocaleDateString() : 'N/A'}</p>
                 </div>
              </div>

              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Acciones de Membresía</h3>
              <div className="space-y-3 mb-8">
                 <button onClick={() => handleStatusChange(selectedUser?.id, 'ACTIVE', 1)} className="w-full py-3 px-4 bg-white border-2 border-indigo-100 hover:border-indigo-500 rounded-xl text-indigo-700 font-bold flex items-center justify-between transition-all">
                   <span className="flex items-center"><CalendarDays className="w-5 h-5 mr-3" /> Añadir 1 Mes (30 días)</span><Plus className="w-4 h-4" />
                 </button>
                 <button onClick={() => handleStatusChange(selectedUser?.id, 'ACTIVE', 12)} className="w-full py-3 px-4 bg-white border-2 border-teal-100 hover:border-teal-500 rounded-xl text-teal-700 font-bold flex items-center justify-between transition-all">
                   <span className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" /> Añadir 1 Año (365 días)</span><Plus className="w-4 h-4" />
                 </button>
              </div>

              <div className="pt-6 border-t border-stone-100">
                 {selectedUser?.status === 'ACTIVE' ? (
                   <button onClick={() => handleStatusChange(selectedUser?.id, 'BLOCKED')} className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black flex items-center justify-center transition-colors">
                     <ShieldAlert className="w-5 h-5 mr-2" /> Restringir Acceso (Bloquear)
                   </button>
                 ) : (
                   <button onClick={() => handleStatusChange(selectedUser?.id, 'ACTIVE')} className="w-full py-4 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-2xl font-black flex items-center justify-center transition-colors">
                     <CheckCircle className="w-5 h-5 mr-2" /> Restaurar Acceso Libre
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}