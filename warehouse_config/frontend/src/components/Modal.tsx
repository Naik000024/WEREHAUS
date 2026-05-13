import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={onClose}
            ></div>

            {/* MODAL WINDOW */}
            <div className="relative w-full max-w-md bg-[#0d1117] border border-neon-cyan shadow-[0_0_30px_rgba(0,242,255,0.15)] rounded-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* HEADER */}
                <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors text-xs font-mono"
                    >
                        [X]
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6 text-gray-300 font-mono text-xs leading-relaxed">
                    {children}
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t border-gray-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-neon-cyan/10 border border-neon-cyan px-6 py-2 text-neon-cyan text-[10px] font-black uppercase hover:bg-neon-cyan hover:text-black transition-all"
                    >
                        Close_Terminal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;