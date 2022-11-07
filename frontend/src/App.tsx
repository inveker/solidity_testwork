import Box from "@mui/material/Box";
import { ClaimRewards } from "./components/ClaimRewards";
import { Withdraw } from "./components/Withdraw";
import { Stake } from "./components/Stake";
import { Header } from "./components/Header";
import { WalletConnector } from "./components/WalletConnector";
import styled from "@emotion/styled";
import { useAccount } from "wagmi";
import { UnauthorizedPlaceholder } from "./components/UnauthorizedPlaceholder";

const BodyWrapper = styled.div`
  margin: 20px auto 0;
  width: 300px;
`;

export default function App() {
  const { isConnected } = useAccount();

  return (
    <WalletConnector>
      <Box sx={{ flexGrow: 1 }}>
        <Header />
        {!isConnected ? (
          <UnauthorizedPlaceholder />
        ) : (
          <BodyWrapper>
            <Stake />
            <ClaimRewards />
            <Withdraw />
          </BodyWrapper>
        )}
      </Box>
    </WalletConnector>
  );
}
