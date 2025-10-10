import styled from 'styled-components';

export const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const TextItemTitle = styled.div`
  display: flex;
  align-items: center;

  & > span:last-child {
    margin-left: 6px;
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
  }
`;

export const TextItem = styled.div`
  margin-bottom: 8px;

  ul {
    color: #abb4be;

    li {
      line-height: 20px;
    }
  }
`;

export const TooltipContent = styled.div`
  .width-full {
    width: 100%;
  }
`;

export const ToolTipTitle = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  margin-bottom: 8px;
  margin-top: 8px;
`;
