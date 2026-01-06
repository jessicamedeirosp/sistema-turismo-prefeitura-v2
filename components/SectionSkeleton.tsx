import React from 'react';

export function SectionSkeleton({ height = 250 }) {
  return (
    <div className="bg-gray-100 rounded-xl animate-pulse w-full mb-8" style={{ height }} />
  );
}
