import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import api from '../api';

const BannerForm = ({ type, onSave, onDiscard }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    banner_type: type,
    button_text: 'Shop Now',
    link: '/products',
    is_active: true
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!formData.title || !formData.image_url) {
        alert("Please fill in Title and Image URL");
        return;
      }
      await api.post('/hero-banners/', formData);
      alert("Banner added successfully!");
      onSave();
    } catch (err) {
      console.error("Error saving banner", err);
      alert("Failed to save banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full bg-white rounded-[3rem] border border-slate-50 p-10 shadow-2xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Add {type.replace('_', ' ')} Banner</h3>
        <button onClick={onDiscard} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={24}/></button>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner Title</label>
            <input 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Summer Collection" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder-slate-300 shadow-inner" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtitle</label>
            <input 
              value={formData.subtitle} 
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              placeholder="e.g. Up to 50% Off" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder-slate-300 shadow-inner" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner Image URL (Landscape)</label>
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
             <input 
               value={formData.image_url} 
               onChange={(e) => setFormData({...formData, image_url: e.target.value})}
               placeholder="Paste high-res image link here..." 
               className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 mb-6 outline-none text-xs text-blue-600 font-bold placeholder-slate-300 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm" 
             />
             <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/50 shadow-inner">
                {formData.image_url ? (
                  <img src={formData.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-300">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" strokeWidth={1} />
                    <p className="text-[10px] uppercase tracking-widest font-black">Live Preview</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t border-slate-50">
          <button onClick={onDiscard} className="px-8 py-3.5 text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">Discard Form</button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Publish Banner'}
          </button>
        </div>
      </div>
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/[0.02] rounded-full pointer-events-none" />
    </div>
  );
};

export default BannerForm;
