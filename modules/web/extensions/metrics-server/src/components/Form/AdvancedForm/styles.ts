import styled from 'styled-components';

export const FormContent = styled.div`
  padding: 12px;
  background: #f9fbfd;
  border-radius: 4px;
  & .form-item-wrapper {
    margin-bottom: 0;
    flex: 1;
  }
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
