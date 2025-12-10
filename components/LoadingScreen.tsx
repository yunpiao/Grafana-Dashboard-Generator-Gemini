import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  stepName: string;
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ stepName, message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 size={24} className="text-primary-600 animate-pulse" />
        </div>
      </div>
      <h3 className="mt-6 text-xl font-bold text-slate-800">{stepName}</h3>
      <p className="mt-2 text-slate-500 max-w-md text-center">{message}</p>
    </div>
  );
};
