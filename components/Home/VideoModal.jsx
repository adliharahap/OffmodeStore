import { Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const VideoModal = ({ isOpen, onClose, videoUrl }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // 'hidden' mematikan scroll bar dan mencegah scrolling
            document.body.style.overflow = 'hidden';
        } else {
            // 'unset' atau 'auto' mengembalikan fungsi scroll
            document.body.style.overflow = 'unset';
        }

        // Cleanup function: Pastikan scroll kembali normal jika komponen di-unmount tiba-tiba
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Autoplay logic: Trigger play saat modal ter-render (isOpen = true)
    useEffect(() => {
        if (isOpen && videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.log("Autoplay prevented:", error);
                });
            }
        }
    }, [isOpen]);

    // Toggle Mute internal modal
    const toggleMute = (e) => {
        e.stopPropagation(); // Mencegah klik tembus ke backdrop
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Jika tidak open, jangan render apapun (unmount component)
    // Ini otomatis men-stop video karena elemen video dihapus dari DOM
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop Blur Gelap */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500 ease-in-out"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Container Modal */}
            <div className="relative w-full max-w-6xl aspect-video bg-black shadow-2xl overflow-hidden animate-scale-in border border-white/10">

                {/* Tombol Close */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 text-white/70 hover:text-white transition-transform hover:rotate-90 duration-300 p-2 mix-blend-difference"
                >
                    <X size={32} strokeWidth={1} />
                </button>

                {/* Video Element */}
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src={videoUrl}
                    loop
                    muted={isMuted} // Controlled by state
                    playsInline
                    poster="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                >
                    Browser Anda tidak mendukung tag video.
                </video>

                {/* Controls Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 md:p-10 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500">
                    <div className="pointer-events-auto flex items-end justify-between">
                        <div>
                            <h3 className="text-white text-xl md:text-2xl font-serif italic tracking-wide">
                                The Midnight Collection
                            </h3>
                            <p className="text-white/60 text-xs font-sans mt-1 tracking-widest uppercase">
                                Campaign Film 2025
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={toggleMute}
                                className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-colors border border-white/20"
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};