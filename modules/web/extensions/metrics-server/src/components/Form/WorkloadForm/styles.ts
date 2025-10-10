import styled from 'styled-components';

export const FormWrapper = styled.div`
  padding: 20px;
  position: relative;
  margin-bottom: 20px;
`;

export const FormContent = styled.div`
  background: #f9fbfd;
  padding: 12px;
  border-radius: 4px;
  position: relative;
  margin-bottom: 28px;
`;

export const RadioBox = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid;
  display: inline-flex;
  transition: background-color 0.3s ease-in-out;
  border-color: #ccd3db;
`;
export const RadioItem = styled.div<{ checked: boolean; disabled: boolean }>`
  margin-bottom: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #ccd3db;
  transition: all 0.3s ease-in-out;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  ${({ disabled }) =>
    disabled &&
    `
    cursor: not-allowed;
  `}
  &:hover {
    border-color: #79879c;
    box-shadow: 0 4px 8px 0 rgba(36, 46, 66, 0.2);
    ${({ checked }) =>
      !checked &&
      `
      ${RadioBox} {
        background: #eff4f9;
        
      }
    `}
  }
  ${({ checked }) =>
    checked &&
    `
    ${RadioBox} {
      border-color: #55bc8a;
      border-width: 4px;
    }
  `}
`;

export const RadioItemContent = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  justify-content: space-between;
  color: #79879c;
`;
export const RadioItemContentName = styled.div`
  color: #242e42;
  font-weight: 600;
`;

export const Tips = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #c7deef;
  color: #326e93;
  border-radius: 4px;
  margin: 12px 0;
`;

export const LoadMore = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  color: #79879c;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

export const ListHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const FormHeader = styled.div`
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  align: center;
  font-size: 14px;
  font-weight: 600;
`;

export const BackButton = styled.span`
  cursor: pointer;
  &:hover {
    .kubed-icon {
      color: #55bc8a;
      fill: #90e0c5;
    }
  }
`;

export const FormFooter = styled.div`
  width: calc(100% - 40px);
  position: absolute;
  bottom: 0;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;
  background: #242e42;
  border-radius: 4px;
`;

export const FormFooterItem = styled.span`
  cursor: pointer;
  padding: 10px 20px;
  transition: all 0.3s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #36435c;
  }
`;
