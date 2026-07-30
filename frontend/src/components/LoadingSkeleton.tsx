import React from 'react';

export const TableSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-10 bg-gray-100 rounded-lg flex-1"></div>
            <div className="h-10 bg-gray-100 rounded-lg w-24"></div>
            <div className="h-10 bg-gray-100 rounded-lg w-32"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100/50 animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      <div className="h-32 bg-gray-50 rounded-xl"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-100 rounded-lg w-20"></div>
        <div className="h-8 bg-gray-100 rounded-lg w-20"></div>
      </div>
    </div>
  );
};

export const GridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
