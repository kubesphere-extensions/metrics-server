import styled from 'styled-components';

export const SheetContentChildrenWrapper = styled.div`
  display: grid;
  grid-template-rows: 60px 1fr;
  height: 100%;
  .kubed-modal-title > div {
    min-height: 40px;
  }
  .container-log-card {
    width: 100%;
    overflow: auto;
  }
`;

export const Content = styled.div`
  padding: 20px;
  background-color: ${props => props.theme.palette.accents_1};
  height: 100%;
  overflow: auto;
  .detail-page-content {
    padding: 0;
  }
`;

export const Overlay = styled.div<{ open?: boolean }>`
  position: fixed;
  inset: 0;
  background-color: ${({ open }) => (open ? '#242e42b2' : 'transparent')};
  z-index: 998;
  transition: background-color 0.3s;
`;
