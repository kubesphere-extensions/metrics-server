import styled from 'styled-components';

export const AddButton = styled.div`
  padding: 11px 12px;
  border-radius: 4px;
  border: 1px dashed #ccd3db;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  &:hover {
    border-color: #79879c;
    box-shadow: 0 4px 8px 0 rgba(36, 46, 66, 0.2);
  }
`;

export const CardTitle = styled.div`
  font-weight: 600;
  color: #242e42;
`;

export const CardDescription = styled.div`
  color: #79879c;
`;
