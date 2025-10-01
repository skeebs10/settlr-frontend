import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock } from 'lucide-react';
import { Button } from './Button';

interface GraceWindowProps {
  isActive: boolean;
  endTime: Date;
  onUndo: () => Promise<void>;
  onComplete: () => void;
}

export function GraceWindow({ isActive, endTime, onUndo, onComplete }: GraceWindowProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const updateTime = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        onComplete();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isActive, endTime, onComplete]);

  const handleUndo = async () => {
    setLoading(true);
    try {
      await onUndo();
    } catch (error) {
      console.error('Undo failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isActive || timeLeft === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-yellow-900/90 backdrop-blur-sm border-t-2 border-yellow-500">
      <div className="container-settlr py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center text-yellow-100">
            <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Tab closed. Undo available for {timeLeft}s.</p>
              <p className="text-sm text-yellow-200">You can still make adjustments.</p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUndo}
            loading={loading}
            className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Undo Close
          </Button>
        </div>
      </div>
    </div>
  );
}