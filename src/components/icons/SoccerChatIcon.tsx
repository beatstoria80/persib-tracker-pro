'use client';

import React from 'react';

export function SoccerChatIcon({
  className = 'w-5 h-5',
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Speech Chat Bubble Outline */}
      <path
        d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5309 20 9.14172 19.6675 7.92383 19.0754L3 21L4.63004 16.9248C3.61205 15.3905 3 13.5298 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central Soccer Ball Pentagon Motif */}
      <polygon
        points="12,8 14.3,9.7 13.4,12.4 10.6,12.4 9.7,9.7"
        fill="currentColor"
      />
      {/* Seam Lines Radiating to Ball Perimeter */}
      <path
        d="M12 8V5M14.3 9.7L17 8.5M13.4 12.4L15.5 15M10.6 12.4L8.5 15M9.7 9.7L7 8.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
