"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Loader2, MessageSquare, Package, Sparkles } from 'lucide-react';
import { addProductReview } from '../../../../utils/reviewAction';

export default function ReviewModal({ isOpen, onClose, orderItem, orderId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safety check
  if (!orderItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await addProductReview({
          productId: orderItem.productId, 
          orderId: orderId,
          rating,
          comment
      });

      if (res.success) {
          alert("Terima kasih atas ulasan Anda!"); // Bisa diganti Toast nanti
          if (onReviewSubmitted) onReviewSubmitted(); 
          onClose();
      } else {
          alert(res.message);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim ulasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white dark:bg-[#111] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col"
          >
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-[#111]/50">
                <div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <Sparkles size={12} /> Review Product
                    </span>
                    <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">Write a Review</h3>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                
                {/* Product Info Card */}
                <div className="flex gap-4 p-4 mb-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-white/10 shrink-0 flex items-center justify-center">
                        {orderItem.image_url ? (
                            <img 
                                src={orderItem.image_url} 
                                className="w-full h-full object-cover" 
                                alt={orderItem.name}
                            />
                        ) : (
                            <Package className="text-gray-400" size={24} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-gray-900 dark:text-white truncate text-lg leading-tight">{orderItem.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-black/30 px-2 py-0.5 rounded border border-gray-200 dark:border-white/10">
                                {orderItem.variant}
                            </span>
                            <span className="text-xs text-gray-400">x{orderItem.quantity} pcs</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Rating Section */}
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">How was the quality?</p>
                        <div className="flex gap-3 p-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="focus:outline-none"
                            >
                                <Star 
                                    size={32}
                                    className={`transition-all duration-300 ${star <= rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'text-gray-300 dark:text-gray-700 fill-transparent'}`} 
                                    strokeWidth={1.5}
                                />
                            </motion.button>
                        ))}
                        </div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {rating === 5 ? "Perfect!" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Bad" : "Terrible"}
                        </p>
                    </div>

                    {/* Comment Section */}
                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                            <MessageSquare size={14} /> Your Experience
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us more about the material, fit, or style..."
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            rows={4}
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 dark:hover:bg-gray-200 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Review"}
                    </button>
                </form>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}