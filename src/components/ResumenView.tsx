import React from 'react';
import { RefreshCw, ShieldAlert, AlertCircle, CheckCircle2, Package } from 'lucide-react';

interface ResumenViewProps {
  erpData: any;
  fetchErpDashboard: () => void;
  companyInfo: any;
  productsList: any[];
}

const ResumenView: React.FC<ResumenViewProps> = ({ erpData, fetchErpDashboard, companyInfo, productsList }) => {
  if (!erpData) {
    return (
      <div className="p-10 text-center bg-white rounded-3xl border border-stone-200">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-50 mx-auto mb-4" />
        <p className="text-stone-500 font-bold">Cargando datos contables...</p>
      </div>
    );
  }

  const stockCritico = productsList.filter(p => p.stock <= 3);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight">Finanzas y Auditoría</h1>
          <p className="text-stone-500 mt-1 text-sm md:text-lg font-medium">ERP Corporativo de {companyInfo.name}</p>
        </div>
        <button onClick={fetchErpDashboard} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm"><span className="text-stone-500 text-xs font-bold uppercase">Ingreso Bruto</span><p className="text-2xl font-black text-stone-900 mt-1">${erpData.finances.totalRevenue.toFixed(2)}</p></div>
        <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-sm"><span className="text-teal-600 text-xs font-bold uppercase">Ganancia Neta</span><p className="text-2xl font-black text-teal-700 mt-1">${erpData.finances.totalProfit.toFixed(2)}</p></div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm"><span className="text-rose-600 text-xs font-bold uppercase">Costo Inversión</span><p className="text-2xl font-black text-rose-700 mt-1">${erpData.finances.totalCosts.toFixed(2)}</p></div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm"><span className="text-amber-600 text-xs font-bold uppercase">Impuestos</span><p className="text-2xl font-black text-amber-700 mt-1">${(erpData.finances.totalIva + erpData.finances.totalIgtf).toFixed(2)}</p></div>
      </div>

      {/* REGISTRO DE AUDITORÍA */}
      <div className="bg-white rounded-[24px] border border-stone-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center"><ShieldAlert className="w-5 h-5 mr-2 text-stone-400" /><h2 className="font-bold text-stone-900">Registro de Auditoría (Logs)</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="bg-stone-50 border-b text-stone-500 font-semibold"><th className="p-3">Acción</th><th className="p-3">Módulo</th><th className="p-3">Usuario</th><th className="p-3">Fecha</th></tr></thead>
            <tbody>
              {erpData.recentAudits?.map((log: any) => (
                <tr key={log.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="p-3 font-bold text-indigo-600">{log.action}</td>
                  <td className="p-3 text-stone-600">{log.entity}</td>
                  <td className="p-3 text-stone-600">{log.userName}</td>
                  <td className="p-3 text-stone-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PANEL DE STOCK CRÍTICO */}
      <div className="bg-white rounded-[24px] border border-rose-200 shadow-sm overflow-hidden mb-6 mt-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="p-4 border-b border-rose-100 bg-rose-50 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-rose-500" />
            <h2 className="font-bold text-rose-900">Alerta de Stock Crítico (3 o menos)</h2>
          </div>
          <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">{stockCritico.length}</span>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          {stockCritico.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle2 className="w-8 h-8 text-teal-400 mb-2" />
              <p className="text-stone-500 text-center font-bold text-sm">Todo el inventario está en niveles saludables.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stockCritico.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-rose-100 rounded-xl bg-white shadow-sm hover:border-rose-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-stone-300" />}
                    </div>
                    <div><p className="font-black text-stone-800 text-xs line-clamp-1">{p.name}</p><p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{p.category}</p></div>
                  </div>
                  <span className={`font-black text-xs px-2.5 py-1 rounded-lg flex-shrink-0 ${p.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>{p.stock} unid.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => <RefreshCw className={`${className} animate-spin`} />;

export default ResumenView;