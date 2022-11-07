import { FC, useEffect, useState } from 'react'
import { Box, Typography, Card, CardActions, CardContent } from '@mui/material'
import { useMyTestCoin } from '../hooks/useMyTestCoin'
import { LoadingButtonWithTooltip } from './LoadingButtonWithTooltip'
import { useBlock } from '../hooks/useBlock'

export const ClaimRewards: FC = () => {
  const { contract, userStake, rewards, rewardsFormated, symbol } = useMyTestCoin()
  const [isClaimLoading, setIsClaimLoading] = useState<boolean>(false)
  const [isClaimDisabled, setIsClaimDisabled] = useState<boolean>(false)
  const [disabledMessage, setDisabledMessage] = useState<string>('')
  const block = useBlock()

  useEffect(() => {
    const hasStake = userStake.amount.gt(0)
    const canClaim = rewards.gt(0)
    setIsClaimDisabled(!(hasStake && canClaim))
    if (!hasStake) {
      setDisabledMessage('Not has stake')
    } else if (!canClaim) {
      setDisabledMessage('Claim delay not expiry')
    } else {
      setDisabledMessage('')
    }
  }, [userStake, block, rewards])

  const claimRewards = async () => {
    setIsClaimLoading(true)
    const tx = await contract.claimRewards()
    await tx.wait()
    setIsClaimLoading(false)
  }

  return (
    <Box component="span" sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Reward
          </Typography>
          <Typography variant="h5" component="div">
            Claim Rewards
          </Typography>
          <Typography variant="body2">Take the rewards that are credited to your deposit</Typography>
          <Typography variant="body2" style={{ marginTop: '10px' }}>
            Your rewards:
            <b>
              {rewardsFormated} {symbol}
            </b>
          </Typography>
        </CardContent>
        <CardActions>
          <LoadingButtonWithTooltip
            label="CLAIM REWARDS"
            isDisabled={isClaimDisabled}
            isLoading={isClaimLoading}
            disabledMessage={disabledMessage}
            onClick={claimRewards}
          />
        </CardActions>
      </Card>
    </Box>
  )
}
