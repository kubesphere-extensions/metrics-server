import React from 'react';

interface HpaIconProps {
  size?: number;
}

const HpaIcon = ({ size = 40 }: HpaIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.062 33.7396L29.931 33.7396L29.931 6.25977L10.062 33.7396Z"
        fill="#36435C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.062 33.7398L29.931 6.25977L10.062 6.25977L10.062 33.7398Z"
        fill="#C1C9D1"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.06545 27.2281L0.994385 20.157L8.06545 13.0859L8.06545 27.2281Z"
        fill="#36435C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M31.9346 27.2281L31.9346 13.0859L39.0056 20.157L31.9346 27.2281Z"
        fill="#36435C"
      />
    </svg>
  );
};

export { HpaIcon };
