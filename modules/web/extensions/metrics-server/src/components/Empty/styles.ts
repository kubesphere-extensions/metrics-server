import styled from 'styled-components';

export const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

export const EmptyIcon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 6px;

  width: 60px;
  height: 60px;

  background: ${({ theme }) => theme.palette.accents_1};
  border-radius: 100px 0px 100px 100px;
`;

export const EmptyTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  & div:first-child {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    color: ${({ theme }) => theme.palette.accents_8};
  }
  & div:nth-of-type(2) {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    color: ${({ theme }) => theme.palette.colors.dark[0]};
  }
`;

export const EmptyAction = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;
