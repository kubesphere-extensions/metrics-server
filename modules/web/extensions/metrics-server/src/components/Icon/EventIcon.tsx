import React from 'react';

interface EventIconProps {
  size?: number;
}

const EventIcon = ({ size = 40 }: EventIconProps) => {
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
        d="M28.3334 11.6665L31.6667 14.9998V31.6665H15.0001L11.6667 28.3332L28.3334 11.6665Z"
        fill="#36435C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24.9999 8.3335L28.3333 11.6668L11.6666 28.3335L8.33325 25.0002V8.3335H24.9999Z"
        fill="#C1C9D1"
      />
      <path
        d="M20.8774 19.124H25.2612L19.1235 28.7695V20.877H14.7388L20.8774 11.2314V19.124Z"
        fill="white"
      />
      <path fill-rule="evenodd" clip-rule="evenodd" d="M25 5H35V15L25 5Z" fill="#36435C" />
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5 25L15 35H5V25Z" fill="#36435C" />
    </svg>
  );
};

export { EventIcon };
