import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from '@kubed/icons';
import styled from 'styled-components';
const ToggleWrapper = styled.div`
  border: 1px solid #ccd3db;
  border-radius: 4px;
  padding: 12px;
`;
const ToggleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
`;
const ToggleDescription = styled.div`
  font-size: 12px;
  color: #666;
  padding-left: 24px;
  margin-bottom: 12px;
`;
const ToggleContent = styled.div<{ isOpen: boolean }>`
  transition: height 0.3s ease-in-out;
  visibility: visible;
  ${({ isOpen }) =>
    !isOpen &&
    `
    height: 0;
    overflow: hidden;
    visibility: hidden;
  `}
`;
type ToggleProps = {
  children: React.ReactNode;
  label: string;
  description: string;
};
const Toggle = ({ children, label, description }: ToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ToggleWrapper>
      <ToggleHeader onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        <span>{label}</span>
      </ToggleHeader>
      <ToggleDescription>{description}</ToggleDescription>
      <ToggleContent isOpen={isOpen}>
        <>{children}</>
      </ToggleContent>
    </ToggleWrapper>
  );
};

export { Toggle };
