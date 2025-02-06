import React from 'react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  return (
    <div
      className={`flex items-center p-4 rounded-lg ${
        type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
      }`}
    >
      {type === 'success' ? (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M18.364 5.636a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728z"
          />
        </svg>
      )}
      <p>{message}</p>
    </div>
  );
}