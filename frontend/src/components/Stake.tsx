import { FC, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import { useMyTestCoin } from '../hooks/useMyTestCoin'
import { ethers } from 'ethers'
import { CircularProgress } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import { LoadingButtonWithTooltip } from './LoadingButtonWithTooltip'

export const Stake: FC = () => {
  const [amount, setAmount] = useState<number>(0)
  const [isStakeLoading, setIsStakeLoading] = useState<boolean>(false)
  const [isStakeDisabled, setIsStakeDisabled] = useState<boolean>(false)

  const { contract, decimals, formated, userStake } = useMyTestCoin()

  useEffect(() => {
    setAmount(Number(formated))
  }, [formated])

  useEffect(() => {
    setIsStakeDisabled(!userStake.amount.eq(0))
  }, [userStake])

  const stake = async () => {
    setIsStakeLoading(true)
    const tx = await contract.stake(ethers.utils.parseUnits(amount.toString(), decimals))
    await tx.wait()
    setIsStakeLoading(false)
  }

  return (
    <Box component="span" sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Stake
          </Typography>
          <Typography variant="h5" component="div">
            Add new Stake
          </Typography>
          <Typography variant="body2">Block some of your funds to receive rewards</Typography>
        </CardContent>
        <div style={{ padding: '0 10px' }}>
          <TextField
            fullWidth
            label="Stake amount"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            InputProps={{
              endAdornment: <Button onClick={() => setAmount(Number(formated))}>MAX</Button>,
            }}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            error={amount === 0 && !isStakeDisabled}
            helperText={amount === 0 && !isStakeDisabled ? 'Can not be zero' : ' '}
          />
        </div>
        <CardActions>
          <LoadingButtonWithTooltip
            label="STAKE"
            isDisabled={isStakeDisabled}
            isLoading={isStakeLoading}
            disabledMessage="Already staked"
            onClick={stake}
          />
        </CardActions>
      </Card>
    </Box>
  )
}
