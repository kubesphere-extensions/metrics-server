import styled from 'styled-components';

export const Container = styled.div`
  display: inline-flex;
`;

export const Item = styled.div`
  width: 20px;
  height: 20px;
  background: #f9fbfd;
  border-radius: 50%;
  text-align: center;
  line-height: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  &:not(:last-child) {
    margin-right: 4px;
    position: relative;

    &::after {
      width: 8px;
      height: 4px;
      background: #f9fbfd;
      content: '';
      position: absolute;
      top: 50%;
      right: 0;
      transform: translate3d(100%, -50%, 0);
    }

    &::before {
      left: -4px;
    }
  }
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
