import styled from 'styled-components';

export const SheetContentChildrenWrapper = styled.div`
  height: 100%;
  .kubed-modal-title > div {
    min-height: 40px;
  }
  .container-log-card {
    width: 100%;
    overflow: auto;
  }
`;

export const AlertContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  & .kubed-icon {
    color: #fff;
    fill: #326e93;
  }
`;

export const Content = styled.div`
  padding: 16px;
  background-color: ${props => props.theme.palette.accents_1};
  height: 100%;
  overflow: auto;
`;

export const Overlay = styled.div<{ open?: boolean }>`
  position: fixed;
  inset: 0;
  background-color: ${({ open }) => (open ? '#242e42b2' : 'transparent')};
  z-index: 998;
  transition: background-color 0.3s;
`;
