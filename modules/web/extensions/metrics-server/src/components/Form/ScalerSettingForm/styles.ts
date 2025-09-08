import styled from 'styled-components';

export const Field = styled.div`
  border: 1px solid #abb4be;
  border-radius: 4px;
  padding: 12px;
`;

export const FieldTitle = styled.div`
  padding-left: 4px;
  font-weight: 600;
`;

export const FieldContent = styled.div`
  padding: 12px;
  background: #f9fbfd;
  border-radius: 4px;
`;

export const FieldDescription = styled.div`
  padding-left: 4px;
  font-size: 12px;
  color: #79879c;
  margin-bottom: 8px;
`;

export const FieldItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #ccd3db;
  padding: 6px 12px;
  border-radius: 60px;
  background: #f0f4f9;
  & + & {
    margin-top: 8px;
  }
`;

export const FieldIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
`;
