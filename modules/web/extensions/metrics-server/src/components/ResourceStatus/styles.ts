import styled from 'styled-components';

export const StatusWrapper = styled.div`
  display: flex;
  gap: 12px;
`;

export const CardItem = styled.div`
  padding: 12px;
  background: #f9fbfd;
  flex: 1;
  border-radius: 4px;
`;

export const ScaleCard = styled.div`
  margin-top: 12px;
  display: flex;
  .replica-card {
    height: 140px;
    > div {
      padding: 0;
      box-shadow: none;
      > div {
        height: 100%;
        > div {
          height: 100%;
        }
      }
    }
  }
`;
