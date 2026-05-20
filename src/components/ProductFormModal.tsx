import React from 'react';
import { X, CheckCircle2, Link as LinkIcon, UploadCloud, Loader2, Percent } from 'lucide-react';

interface ProductFormModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  isEditMode: boolean;
  formData: any;
  setFormData: any;
  handleSubmitProduct: (e: React.FormEvent) => void;
  error: string;
  success: boolean;
  imageUploadType: string;
  setImageUploadType: (val: string) => void;
  handleLocalImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isModalOpen, setIsModalOpen, isEditMode, formData, setFormData, handleSubmitProduct,
  error, success, imageUploadType, setImageUploadType, handleLocalImageUpload, loading
}) => {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-stone-100 flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">{isEditMode ? 'Editar' : 'Nuevo Producto'}</h2>
          <button onClick={() => setIsModalOpen(false)} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full"><X className="w-5 h-5 md:w-6 md:h-6 text-stone-500" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 md:p-8 bg-stone-50/50">
          <form onSubmit={handleSubmitProduct} className="space-y-5 md:space-y-6">
            {error && <div className="p-3 md:p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs md:text-sm font-bold rounded-xl md:rounded-2xl">{error}</div>}
            {success && <div className="p-3 md:p-4 bg-teal-50 border border-teal-100 text-teal-700 text-xs md:text-sm font-bold rounded-xl md:rounded-2xl flex items-center"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Guardado!</div>}
            <div>
              <div className="flex p-1 md:p-1.5 bg-stone-200/50 rounded-xl md:rounded-2xl mb-3 md:mb-4">
                <button type="button" onClick={() => setImageUploadType('url')} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-black rounded-lg md:rounded-xl transition-all ${imageUploadType === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-500'}`}>URL</button>
                <button type="button" onClick={() => setImageUploadType('upload')} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-black rounded-lg md:rounded-xl transition-all ${imageUploadType === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-stone-500'}`}>Subir</button>
              </div>
              {imageUploadType === 'url' ? (
                <div className="relative"><LinkIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-stone-400" /><input type="url" placeholder="https://..." className="w-full pl-9 md:pl-12 pr-4 py-3 md:py-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none text-xs md:text-sm font-medium focus:ring-2 focus:ring-indigo-500" value={formData.customImage} onChange={(e) => setFormData({...formData, customImage: e.target.value})} /></div>
              ) : (
                <label className="relative border-2 border-dashed border-stone-300 rounded-[20px] md:rounded-[24px] bg-white cursor-pointer py-6 md:py-8 flex flex-col items-center justify-center overflow-hidden">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLocalImageUpload} />
                  {formData.customImage && formData.customImage.startsWith('data:image') ? (<img src={formData.customImage} alt="Preview" className="absolute inset-0 w-full h-full object-contain bg-white p-2" />) : (<><UploadCloud className="w-8 h-8 md:w-10 md:h-10 text-indigo-400 mb-2 md:mb-3" /><span className="text-xs md:text-sm font-bold text-stone-500">Toca para buscar</span></>)}
                </label>
              )}
            </div>
            <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Nombre</label><input required className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            
            <div className="grid grid-cols-2 gap-3 md:gap-5">
              <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Costo Inversión ($)</label><input required type="number" step="0.01" className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-black text-rose-600 focus:ring-2 focus:ring-indigo-500" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} placeholder="Ej: 5.00"/></div>
              <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Precio Venta Base ($)</label><input required type="number" step="0.01" className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Ej: 10.00" /></div>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl md:rounded-2xl">
               <label className="flex items-center gap-2 text-[10px] md:text-xs font-black text-rose-700 mb-1.5 md:mb-2 uppercase tracking-widest"><Percent className="w-3 h-3 md:w-4 md:h-4"/> Precio en Promoción ($) - Opcional</label>
               <input type="number" step="0.01" className="w-full p-3 md:p-4 bg-white border border-rose-200 rounded-lg md:rounded-xl outline-none font-black text-rose-600 focus:ring-2 focus:ring-rose-500" value={formData.promoPrice} onChange={(e) => setFormData({...formData, promoPrice: e.target.value})} placeholder="Déjalo vacío si no hay oferta" />
            </div>

            <div className="flex items-center justify-between bg-white border border-stone-200 p-4 rounded-xl md:rounded-2xl">
              <div>
                <label className="block text-[10px] md:text-xs font-black text-stone-900 uppercase tracking-widest">Aplica IVA (16%)</label>
                <p className="text-[10px] text-stone-500 font-medium">Desmarca si el producto está exento.</p>
              </div>
              <input type="checkbox" checked={formData.applyIva} onChange={(e) => setFormData({...formData, applyIva: e.target.checked})} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
            </div>

            <div><label className="block text-[10px] md:text-xs font-black text-stone-500 mb-1.5 md:mb-2 uppercase tracking-widest">Stock Disponible</label><input required type="number" className="w-full p-3 md:p-4 bg-white border border-stone-200 rounded-xl md:rounded-2xl outline-none font-black text-stone-800 focus:ring-2 focus:ring-indigo-500" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} /></div>
            <button type="submit" disabled={loading} className="w-full py-3.5 md:py-4 mt-2 bg-indigo-600 text-white font-black text-sm md:text-lg rounded-xl md:rounded-2xl active:scale-95 transition-all">{loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin mx-auto" /> : 'Guardar Producto'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;