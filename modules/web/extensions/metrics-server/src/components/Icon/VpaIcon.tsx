import React from 'react';

interface VpaIconProps {
  size?: number;
}

const VpaIcon = ({ size = 40 }: VpaIconProps) => {
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
        d="M6.25991 28.9351L6.25991 11.0651L33.7397 11.0651L6.25991 28.9351Z"
        fill="#C1C9D1"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.26 28.9351L33.74 11.0651L33.74 28.9351L6.26 28.9351Z"
        fill="#36435C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.2281 30.9343L20.157 38.0054L13.0859 30.9343L27.2281 30.9343Z"
        fill="#36435C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.2281 9.06591L13.0859 9.06592L20.157 1.99485L27.2281 9.06591Z"
        fill="#36435C"
      />
    </svg>
  );
};

export { VpaIcon };
