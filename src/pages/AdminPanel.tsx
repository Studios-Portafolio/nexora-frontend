import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client'; // 🔥 IMPORTACIÓN DE SOCKETS
import { 
  ShieldCheck, Users, Ban, CheckCircle, Search, LogOut, AlertTriangle, 
  Settings, ShieldAlert, CalendarDays, X, Plus, Loader2, Copy, Check,
  Headphones, MessageSquare, Send // 🔥 Íconos para el chat
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://192.168.1.40:3000/api/admin';
const API_URL = 'http://192.168.1.40:3000/api'; // Para las rutas de chat
const SOCKET_URL = 'http://192.168.1.40:3000'; // 🔥 URL DEL SERVIDOR SOCKET

export default function AdminPanel() {
  const navigate = useNavigate();
  
  // Vistas: 'directorio' | 'soporte'
  const [currentView, setCurrentView] = useState<'directorio' | 'soporte'>('directorio');

  // Estados del Directorio
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 🔥 ESTADOS DEL CHAT DE SOPORTE 🔥
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<any | null>(null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const supportChatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Cargar usuarios al inicio
  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`); 
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LÓGICA DE SOCKETS PARA ADMIN 🔥
  useEffect(() => {
    // Conectar al socket globalmente
    socketRef.current = io(SOCKET_URL);
    
    // Escuchar mensajes entrantes
    socketRef.current.on('receive_message', (data: any) => {
      // Solo lo agregamos a la pantalla si el mensaje pertenece al usuario que tenemos seleccionado
      setSupportMessages((prev) => {
        // Validación para evitar duplicados si el socket se reconecta
        const exists = prev.some(msg => msg.id === data.id);
        if (exists) return prev;
        
        // Asumiendo que `data.userId` es el ID del cliente al que pertenece el chat
        // Si no hay un usuario seleccionado, o el mensaje es para otro usuario, no lo renderizamos en este panel
        return [...prev, data]; 
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Scroll automático en el chat
  useEffect(() => {
    if (currentView === 'soporte' && supportChatEndRef.current) {
      supportChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages, currentView]);

  // Cargar lista de clientes para soporte
  const fetchActiveChats = async () => {
    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/chat/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setActiveChats(res.data.data);
      }
    } catch (err) {
      console.error("Error cargando lista de chats", err);
    }
  };

  // Al cambiar a la vista de soporte, cargar los chats
  useEffect(() => {
    if (currentView === 'soporte') {
      fetchActiveChats();
    }
  }, [currentView]);

  // Seleccionar un usuario para chatear
  const handleSelectChat = async (user: any) => {
    setSelectedChatUser(user);
    setSupportMessages([]); // Limpiar mensajes anteriores
    
    // Unir al admin a la sala (room) del cliente
    if (socketRef.current) {
      socketRef.current.emit('join_chat', user.id);
    }

    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.get(`${API_URL}/chat/messages/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSupportMessages(res.data.data);
      }
    } catch (err) {
      console.error("Error cargando historial del chat", err);
    }
  };

  // Enviar mensaje como ADMIN
  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim() || !selectedChatUser) return;

    setIsSendingSupport(true);
    
    const messageData = {
      userId: selectedChatUser.id, // El ID del cliente a quien le respondemos
      content: supportInput.trim(),
      isAdmin: true // 🔥 Marcamos que lo envía el admin
    };

    try {
      const token = localStorage.getItem('nexora_token');
      const res = await axios.post(`${API_URL}/chat/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        // Emitimos al socket para que el cliente lo reciba en tiempo real
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


  // --- Funciones del Directorio ---
  const handleStatusChange = async (userId: string, newStatus: string, monthsToAdd?: number) => {
    const actionText = newStatus === 'BLOCKED' ? 'BLOQUEAR' : 'ACTIVAR';
    if (!window.confirm(`¿Estás seguro de que deseas ${actionText} a este usuario?`)) return;
    
    try {
      await axios.put(`${API_BASE}/users/${userId}`, { status: newStatus, monthsToAdd });
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

  // Calcular métricas
  const clientsOnly = users.filter(u => u.role !== 'ADMIN');
  const activeClients = clientsOnly.filter(u => u.status === 'ACTIVE').length;
  const blockedClients = clientsOnly.filter(u => u.status === 'BLOCKED').length;

  const filteredUsers = clientsOnly.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) || 
    user.name.toLowerCase().includes(search.toLowerCase())
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
        
        {/* Pestañas de Navegación Admin */}
        <div className="hidden md:flex bg-stone-800 rounded-xl p-1 shadow-inner border border-stone-700">
          <button 
            onClick={() => setCurrentView('directorio')} 
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${currentView === 'directorio' ? 'bg-indigo-600 text-white shadow-md' : 'text-stone-400 hover:text-white'}`}
          >
            Directorio
          </button>
          <button 
            onClick={() => setCurrentView('soporte')} 
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${currentView === 'soporte' ? 'bg-teal-600 text-white shadow-md' : 'text-stone-400 hover:text-white'}`}
          >
            <Headphones className="w-4 h-4" /> Soporte
          </button>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 text-stone-400 hover:text-white font-bold text-sm transition-colors bg-stone-800 px-4 py-2 rounded-lg">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto">

        {/* =========================================
            VISTA DE DIRECTORIO (Métricas y Tabla)
            ========================================= */}
        {currentView === 'directorio' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            {/* TARJETAS DE MÉTRICAS GLOBALES */}
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
                <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
                  Directorio de Cuentas
                </h2>
                {search && <p className="text-sm text-indigo-600 font-bold mt-1">Mostrando {filteredUsers.length} resultados</p>}
              </div>
              <div className="relative w-full md:w-auto shadow-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-80 pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
              </div>
            </div>

            {/* TABLA DE USUARIOS */}
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
                        const daysRemaining = getDaysRemaining(user.subscriptionEnd);
                        const isExpired = daysRemaining !== null && daysRemaining <= 0;

                        return (
                          <tr key={user.id} className={`transition-colors ${isExpired && user.status !== 'BLOCKED' ? 'bg-rose-50/30' : 'hover:bg-stone-50'}`}>
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                                  {user.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-stone-900 text-sm truncate max-w-[200px]">{user.name}</p>
                                  <p className="text-xs text-stone-500 font-medium truncate max-w-[200px]">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                               <span className="text-sm font-bold text-stone-600">
                                 {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                               </span>
                            </td>
                            <td className="p-5">
                              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                                user.status === 'ACTIVE' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {user.status}
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

        {/* =========================================
            VISTA DE SOPORTE TÉCNICO (Chat en tiempo real)
            ========================================= */}
        {currentView === 'soporte' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] min-h-[500px] gap-6">
            
            {/* Lista de Chats (Barra Lateral Izquierda) */}
            <div className="w-1/3 bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden flex flex-col">
               <div className="p-5 border-b border-stone-100 bg-stone-50">
                 <h2 className="font-black text-stone-900 text-lg flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-teal-600" /> Consultas Activas
                 </h2>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                 {activeChats.length === 0 ? (
                   <p className="text-center text-stone-400 text-sm mt-10 font-bold">No hay clientes registrados.</p>
                 ) : (
                   activeChats.map(user => (
                     <button 
                       key={user.id}
                       onClick={() => handleSelectChat(user)}
                       className={`w-full flex items-center p-3 rounded-2xl transition-all border ${
                         selectedChatUser?.id === user.id 
                           ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-sm' 
                           : 'bg-white border-transparent hover:bg-stone-50 text-stone-700'
                       }`}
                     >
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 mr-3 ${
                          selectedChatUser?.id === user.id ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-500'
                       }`}>
                         {user.name.substring(0, 2).toUpperCase()}
                       </div>
                       <div className="text-left min-w-0 flex-1">
                         <p className="font-black text-sm truncate">{user.name}</p>
                         <p className={`text-xs truncate ${selectedChatUser?.id === user.id ? 'text-teal-600 font-semibold' : 'text-stone-400'}`}>
                           {user.email}
                         </p>
                       </div>
                     </button>
                   ))
                 )}
               </div>
            </div>

            {/* Panel de Chat (Lado Derecho) */}
            <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden flex flex-col relative">
              {selectedChatUser ? (
                <>
                  <div className="p-5 border-b border-stone-100 bg-teal-600 text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 font-black">
                        {selectedChatUser.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-lg leading-tight">{selectedChatUser.name}</h3>
                        <p className="text-xs text-teal-100 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span> 
                          Sesión Segura Activa
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50 custom-scrollbar">
                    {supportMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400">
                        <MessageSquare className="w-12 h-12 mb-3 text-stone-200" />
                        <p className="font-bold text-sm">No hay mensajes en este chat.</p>
                      </div>
                    ) : (
                      supportMessages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-4 rounded-3xl max-w-[80%] text-sm font-medium leading-relaxed shadow-sm ${
                            msg.isAdmin 
                              ? 'bg-teal-600 text-white rounded-br-sm' 
                              : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm whitespace-pre-wrap'
                          }`}>
                            {msg.content}
                            <div className={`text-[9px] mt-1.5 text-right ${msg.isAdmin ? 'text-teal-200' : 'text-stone-400'}`}>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        placeholder={`Escribe a ${selectedChatUser.name.split(' ')[0]}...`} 
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

      {/* MODAL DE GESTIÓN AVANZADA DE USUARIO */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="bg-stone-50 border-b border-stone-100 p-6 flex justify-between items-start">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl shadow-inner shrink-0">
                    {selectedUser.name.substring(0, 2).toUpperCase()}
                 </div>
                 <div className="min-w-0 pr-2">
                   <h2 className="text-xl font-black text-stone-900 tracking-tight truncate">{selectedUser.name}</h2>
                   <div className="flex items-center gap-2 mt-1">
                     <p className="text-sm text-stone-500 font-medium truncate">{selectedUser.email}</p>
                     <button onClick={() => copyEmail(selectedUser.email)} className="p-1 text-stone-400 hover:text-indigo-600 transition-colors" title="Copiar correo">
                       {copied ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                     </button>
                   </div>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white hover:bg-stone-100 rounded-full shadow-sm border border-stone-200 text-stone-400 shrink-0"><X className="w-5 h-5" /></button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Métricas Actuales</h3>
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 mb-6 flex justify-between items-center">
                 <div>
                   <p className="text-xs font-bold text-stone-500 mb-1">Estado de Cuenta</p>
                   <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${selectedUser.status === 'ACTIVE' ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
                      {selectedUser.status}
                   </span>
                 </div>
                 <div className="text-right">
                   <p className="text-xs font-bold text-stone-500 mb-1">Vencimiento</p>
                   <p className="text-sm font-black text-stone-800">
                     {selectedUser.subscriptionEnd ? new Date(selectedUser.subscriptionEnd).toLocaleDateString() : 'N/A'}
                   </p>
                 </div>
              </div>

              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Acciones de Membresía</h3>
              <div className="space-y-3 mb-8">
                 <button 
                   onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE', 1)}
                   className="w-full py-3 px-4 bg-white border-2 border-indigo-100 hover:border-indigo-500 rounded-xl text-indigo-700 font-bold flex items-center justify-between transition-all"
                 >
                   <span className="flex items-center"><CalendarDays className="w-5 h-5 mr-3" /> Añadir 1 Mes (30 días)</span>
                   <Plus className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE', 12)}
                   className="w-full py-3 px-4 bg-white border-2 border-teal-100 hover:border-teal-500 rounded-xl text-teal-700 font-bold flex items-center justify-between transition-all"
                 >
                   <span className="flex items-center"><CheckCircle className="w-5 h-5 mr-3" /> Añadir 1 Año (365 días)</span>
                   <Plus className="w-4 h-4" />
                 </button>
              </div>

              <div className="pt-6 border-t border-stone-100">
                 {selectedUser.status === 'ACTIVE' ? (
                   <button 
                     onClick={() => handleStatusChange(selectedUser.id, 'BLOCKED')}
                     className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black flex items-center justify-center transition-colors"
                   >
                     <ShieldAlert className="w-5 h-5 mr-2" /> Restringir Acceso (Bloquear)
                   </button>
                 ) : (
                   <button 
                     onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE')}
                     className="w-full py-4 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-2xl font-black flex items-center justify-center transition-colors"
                   >
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