'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoricalEvent {
  event: string;
  description: string;
  insanityRating: number;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [insanityLevel, setInsanityLevel] = useState(0);
  const [showInsaneMessage, setShowInsaneMessage] = useState(false);

  useEffect(() => {
    if (insanityLevel > 7) {
      setShowInsaneMessage(true);
      const timer = setTimeout(() => setShowInsaneMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [insanityLevel]);

  const getBodyBackgroundColor = (rating: number) => {
    // For actual CSS colors (used in body)
    if (rating === 0) return '#ffffff';
    if (rating <= 3) return '#bbf7d0'; // green-200
    if (rating <= 5) return '#fef08a'; // yellow-200
    if (rating <= 7) return '#fed7aa'; // orange-200
    if (rating <= 9) return '#fecaca'; // red-200
    return '#fca5a5'; // red-300
  };

  const getEventColors = (rating: number) => {
    if (rating <= 3) return 'bg-green-200 hover:bg-green-300 border-green-400 hover:border-green-500';
    if (rating <= 5) return 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400 hover:border-yellow-500';
    if (rating <= 7) return 'bg-orange-200 hover:bg-orange-300 border-orange-400 hover:border-orange-500';
    if (rating <= 9) return 'bg-red-200 hover:bg-red-300 border-red-400 hover:border-red-500';
    return 'bg-red-300 hover:bg-red-400 border-red-500 hover:border-red-600';
  };

  useEffect(() => {
    // Update CSS variable for background color
    document.documentElement.style.setProperty('--page-background', getBodyBackgroundColor(insanityLevel));
  }, [insanityLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEvents([]);
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setEvents(data.events);
      if (data.events && data.events.length > 0) {
        setInsanityLevel(data.events[0].insanityRating);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const getInsanityEmoji = (rating: number) => {
    if (rating === 0) return '🫨';
    if (rating <= 3) return '😌';
    if (rating <= 6) return '😅';
    if (rating <= 8) return '😱';
    return '🤯';
  };

  return (
    <main
      className={`min-h-screen p-8 transition-colors duration-1000 flex items-center justify-center bg-[var(--page-background)]`}
    >
      <div className="w-full max-w-2xl relative">
        <AnimatePresence>
          {showInsaneMessage && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.5 }}
              className="absolute left-0 right-0 -top-20 text-center text-4xl pointer-events-none"
            >
              🤯 That&apos;s INSANE! 🤯
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold mb-8 text-center italic"
        >
          How insane is this? {getInsanityEmoji(insanityLevel)}
        </motion.h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What happened?"
              className="w-full p-4 border rounded-none mb-4 text-lg shadow-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF0100] focus:border-[#FF0100] focus:outline-none"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-[#FF0100] text-white px-6 py-3 rounded-none font-semibold text-lg shadow-lg hover:bg-[#FF0100] disabled:bg-gray-400 transition-colors duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    🤔
                  </motion.span>
                  <span>Analyzing...</span>
                </div>
              ) : (
                "Rate Insanity!"
              )}
            </motion.button>
          </div>
        </form>

        <AnimatePresence>
          {events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`p-6 rounded-none shadow-lg transition-all duration-300 hover:shadow-xl ${
                    getEventColors(event.insanityRating)
                  } ${index === 0 ? 'border-4' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      {event.event} {getInsanityEmoji(event.insanityRating)}
                    </h2>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`px-4 py-2 rounded-full text-white font-bold shadow-md ${
                        event.insanityRating > 6
                          ? "bg-red-500"
                          : event.insanityRating > 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {event.insanityRating}/10
                    </motion.span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
