"use client"

import React from 'react';
import { useLoader } from '../app/context/LoaderContext';

const SpinningRingsLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      <div
        className="absolute inset-2 border-4 border-transparent border-r-purple-500 rounded-full animate-spin"
        style={{
          animationDirection: "reverse",
          animationDuration: "1.5s",
        }}
      ></div>
      <div
        className="absolute inset-4 border-4 border-transparent border-b-pink-500 rounded-full animate-spin"
        style={{
          animationDuration: "2s",
        }}
      ></div>
      <div
        className="absolute inset-6 border-4 border-transparent border-l-cyan-500 rounded-full animate-spin"
        style={{
          animationDirection: "reverse",
          animationDuration: "2.5s",
        }}
      ></div>
    </div>
  </div>
);

const GlobalLoader: React.FC = () => {
  const { isLoading } = useLoader();

  if (!isLoading) return null;

  return <SpinningRingsLoader />;
};

export default GlobalLoader;