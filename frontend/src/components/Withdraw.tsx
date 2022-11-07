import { FC, useEffect, useState } from "react";
import {Button, Box, Typography, Card, CardActions, CardContent} from "@mui/material";
import { useMyTestCoin } from "../hooks/useMyTestCoin";
import { ethers } from "ethers";
import { useBlock } from "../hooks/useBlock";
import { LoadingButtonWithTooltip } from "./LoadingButtonWithTooltip";

export const Withdraw: FC = () => {
  const { contract, userStake, rewards, symbol, decimals, withdrawDelay } = useMyTestCoin()
  const [withdrawAmountFormated, setWithdrawAmountFormated] = useState<string>('0')
  const [isLoadingWithdraw, setIsLoadingWithdraw] = useState<boolean>(false)
  const [canWithdraw, setCanWithdraw] = useState<boolean>(false)
  const [disabledMessage, setDisabledMessage] = useState<string>('')
  const block = useBlock()

  useEffect(() => {
    setWithdrawAmountFormated(ethers.utils.formatUnits(userStake.amount.add(rewards), decimals))
  }, [userStake, rewards, decimals])

  useEffect(() => {
    if(block) {
      const isExpired = userStake.creationTimestamp.add(withdrawDelay).lt(block!.timestamp)
      const hasStake = userStake.amount.gt(0)
      setCanWithdraw(hasStake && isExpired)
  
      if(!hasStake) {
        setDisabledMessage('Not has staked tokens')
      } else if(!isExpired) {
        setDisabledMessage('Locked period not expireds')
      } else {
        setDisabledMessage('')
      }
    }
  }, [block, userStake])

  const withdraw =  async () => {
    setIsLoadingWithdraw(true)
    const tx = await contract.withdraw()
    await tx.wait()
    setIsLoadingWithdraw(false)
  }

  return (
    <Box
      component="span"
      sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
    >
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Withdraw
          </Typography>
          <Typography variant="h5" component="div">
            Withdraw your locked deposit
          </Typography>
          <Typography variant="body2">
            Withdraw Funds You Locked When Staking
          </Typography>
          
          <Typography variant="body2" style={{ marginTop: '10px' }}>
            Can withdraw:
            <b>
              {withdrawAmountFormated} {symbol}
            </b>
          </Typography>
        </CardContent>
        <CardActions>
        <LoadingButtonWithTooltip
            label="WITHDRAW"
            isDisabled={!canWithdraw}
            isLoading={isLoadingWithdraw}
            disabledMessage={disabledMessage}
            onClick={withdraw}
          />
        </CardActions>
      </Card>
    </Box>
  );
};
