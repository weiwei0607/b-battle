import React, { useState } from 'react';
import { Sparkles, Camera, X } from 'lucide-react';

const CustomPersonaModal = ({ show, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [icon, setIcon] = useState("✨");
  const [previewImg, setPreviewImg] = useState(null);

  if (!show) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
        setIcon(reader.result); // 存入 Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!title || !prompt) {
      alert("請填寫完整的人格設定！");
      return;
    }
    const customId = `custom_${Date.now()}`;
    onSave(customId, {
      title,
      prompt,
      icon,
      intimacy: 100,
      level: 1
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[800] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2"><Sparkles className="text-[#D7C9B1]" /> 創造新的人格</h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">PRIME EXCLUSIVE</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-50 rounded-full text-stone-400"><X size={16}/></button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[2rem] bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden">
                {previewImg ? (
                  <img src={previewImg} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <span className="text-4xl">{icon}</span>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-stone-800 text-white p-2 rounded-xl shadow-lg cursor-pointer active:scale-90 transition-all">
                <Camera size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="flex gap-2">
              {['👤', '👺', '🧙', '🤖', '🦊'].map(emoji => (
                <button key={emoji} onClick={() => {setIcon(emoji); setPreviewImg(null);}} className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${icon === emoji ? 'bg-stone-800 border-stone-800 text-white' : 'bg-white border-stone-100'}`}>{emoji}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block px-1 tracking-widest">人格稱號</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：地獄廚神、溫柔管家..." 
              className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-bold text-sm outline-none focus:bg-white focus:border-[#D7C9B1] transition-all" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block px-1 tracking-widest">個性設定 (給 AI 的指令)</label>
            <textarea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)}
              placeholder="描述他該如何跟你說話？例如：你非常嚴格，會瘋狂嘲笑我的花錢行為..." 
              rows="4"
              className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-medium text-xs outline-none focus:bg-white focus:border-[#D7C9B1] transition-all resize-none" 
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-bold uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all"
          >
            誕生人格
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPersonaModal;
