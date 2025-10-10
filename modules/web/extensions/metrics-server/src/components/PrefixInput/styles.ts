import styled from 'styled-components';

export const PrefixInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #abb4be;
  border-radius: 4px;
  width: 100%;
  height: 32px;
  .kubed-select-selector {
    height: 100% !important;
    border: none;
    border-left: 1px solid #abb4be;
    border-radius: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .input-wrapper {
    width: 100%;
    height: 100% !important;
    border: none;
    border-left: 1px solid #abb4be;
    border-radius: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

export const PreFixLabel = styled.span`
  font-weight: 400;
  flex-shrink: 0;
  padding: 0 12px;
`;

export const Unit = styled.span`
  padding-right: 10px;
  display: inline-flex;
  align-items: center;
  height: 100%;
  background: #fff;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
`;
