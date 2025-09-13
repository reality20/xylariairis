
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="mb-8 text-left flex-shrink-0">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white relative">
        Xylaria Iris
        <span className="absolute top-0 -right-4 text-xs font-medium bg-purple-500 text-white px-2 py-0.5 rounded-full -translate-y-2">v4</span>
      </h1>
      <p className="mt-2 text-lg text-gray-300">
        AI Suite for Visual Creation &amp; Enhancement
      </p>
    </header>
  );
};
