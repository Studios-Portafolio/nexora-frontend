import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Edit, Trash2, Image as ImageIcon, Loader2, Store, ChefHat } from 'lucide-react';

interface InventarioViewProps {
  filteredProducts: any[];
  isUploadingExcel: boolean;
  handleExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openCreateModal: () => void;
  openEditModal: (product: any) => void;
  handleDeleteProduct: (id: string) => void;
}

const InventarioView: React.FC<InventarioViewProps> = ({
  filteredProducts,
  isUploadingExcel,
  handleExcelUpload,
  openCreateModal,
  openEditModal,
  handleDeleteProduct
}) => {
  // 🔥 PESTAÑAS: Tienda vs Restaurante 🔥
  const [activeTab, setActiveTab] = useState<'tienda' | 'cocina'>('tienda');

  const isKitchenItem = (category: string) => {
    const c = (category || '').toLowerCase();
    return c.includes('cocina') || c.includes('plato') || c.includes('comida') || c.includes('pizza') || c.includes('hamburguesa');
  };

  const displayedProducts = filteredProducts.filter(p => activeTab === 'cocina' ? isKitchenItem(p.category) : !isKitchenItem(p.category));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Administración</h1>
          <p className="text-stone-500 mt-1 text-xs md:text-sm font-medium">Gestiona tus productos y platos</p>
        </div>
        <div className="flex space-x-2 md:space-x-3 w-full md:w-auto">
          <input type="file" accept=".xlsx, .xls, .csv" className="hidden" id="excel-upload" onChange={handleExcelUpload} />
          <label htmlFor="excel-upload" className="flex-1 md:flex-none bg-white border border-stone-200 text-stone-700 justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold flex items-center cursor-pointer active:scale-[0.98] shadow-sm text-xs md:text-sm hover:bg-stone-50">
            {isUploadingExcel ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1.5 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5 mr-1.5 text-teal-600" />} Importar
          </label>
          <button onClick={openCreateModal} className={`flex-1 md:flex-none text-white justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black flex items-center shadow-lg active:scale-[0.98] text-xs md:text-sm transition-colors ${activeTab === 'cocina' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1.5" /> Agregar {activeTab === 'cocina' ? 'Plato' : 'Producto'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-stone-200/50 p-1.5 rounded-2xl w-max">
        <button onClick={() => setActiveTab('tienda')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'tienda' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
          <Store className="w-4 h-4" /> Inventario Tienda
        </button>
        <button onClick={() => setActiveTab('cocina')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'cocina' ? 'bg-white text-rose-500 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
          <ChefHat className="w-4 h-4" /> Menú Restaurante
        </button>
      </div>

      <div className="bg-white rounded-[20px] md:rounded-[32px] border border-stone-200 shadow-sm overflow-x-auto transition-all">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-[10px] md:text-xs uppercase tracking-widest text-stone-500 font-black">
              <th className="p-3 md:p-5 w-16 md:w-20">Img</th>
              <th className="p-3 md:p-5">{activeTab === 'cocina' ? 'Plato / Comida' : 'Producto'}</th>
              <th className="p-3 md:p-5 hidden sm:table-cell">Cat</th>
              <th className="p-3 md:p-5">Stock</th>
              <th className="p-3 md:p-5">Costo</th>
              <th className="p-3 md:p-5">Venta</th>
              <th className="p-3 md:p-5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="text-xs md:text-sm font-medium">
            {displayedProducts.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-stone-500">No hay elementos aquí.</td></tr>
            ) : (
              displayedProducts.map((product) => (
                <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50/80">
                  <td className="p-2 md:p-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
                      {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" /> : <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-stone-300" />}
                    </div>
                  </td>
                  <td className="p-3 md:p-5 font-bold text-stone-900">
                    {product.name} {product.applyIva && <span className="text-[9px] bg-stone-200 px-1 rounded text-stone-600 ml-1">IVA</span>}
                  </td>
                  <td className="p-3 md:p-5 hidden sm:table-cell">
                    <span className="bg-stone-100 px-2 py-1 rounded text-[9px] md:text-[10px] font-bold uppercase">{product.category}</span>
                  </td>
                  <td className="p-3 md:p-5">
                    {product.stock === 0 ? <span className="text-rose-600 font-black">0</span> : <span className="text-stone-700 font-black">{product.stock}</span>}
                  </td>
                  <td className="p-3 md:p-5 font-bold text-stone-500">
                    ${product.cost?.toFixed(2) || '0.00'}
                  </td>
                  <td className="p-3 md:p-5 font-black text-indigo-600">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-3 md:p-5 text-center">
                    <div className="flex items-center justify-center space-x-1 md:space-x-2">
                      <button onClick={() => openEditModal(product)} className="p-1.5 md:p-2 text-stone-400 hover:text-indigo-600 bg-stone-50 rounded-lg md:rounded-xl"><Edit className="w-3 h-3 md:w-4 md:h-4" /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 md:p-2 text-stone-400 hover:text-rose-600 bg-stone-50 rounded-lg md:rounded-xl"><Trash2 className="w-3 h-3 md:w-4 md:h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventarioView;