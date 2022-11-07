import { BigNumber, ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { MY_TEST_COIN } from '../constants/addresses'
import { MyTestCoin__factory } from '../typechain-types'

interface IUserStake {
  amount: BigNumber
  creationTimestamp: BigNumber
  lastRewardTimestamp: BigNumber
  claimedRewards: BigNumber
}

export function useMyTestCoin() {
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const contract = MyTestCoin__factory.connect(MY_TEST_COIN, signer!)
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from('0'))
  const [rewards, setRewards] = useState<BigNumber>(BigNumber.from('0'))
  const [rewardsFormated, setRewardsFormated] = useState<string>('0')
  const [symbol, setSymbol] = useState<string>('')
  const [withdrawDelay, setWithdrawDelay] = useState<BigNumber>(BigNumber.from('0'))
  const [userStake, setUserStake] = useState<IUserStake>({
    amount: BigNumber.from('0'),
    creationTimestamp: BigNumber.from('0'),
    lastRewardTimestamp: BigNumber.from('0'),
    claimedRewards: BigNumber.from('0'),
  })
  const [decimals, setDecimals] = useState<number>(0)
  const [formated, setFormated] = useState<string>('0')

  useEffect(() => {
    async function closure() {
      const tokenBalance = await contract.balanceOf(address!)
      const tokenDecimals = await contract.decimals()
      const userRewards = await contract.rewards(address!)
      setWithdrawDelay(await contract.WITHDRAW_DELAY())
      setBalance(tokenBalance)
      setDecimals(tokenDecimals)
      setFormated(ethers.utils.formatUnits(tokenBalance, tokenDecimals))
      setUserStake(await contract.stakeByUser(address!))
      setRewards(userRewards)
      setRewardsFormated(ethers.utils.formatUnits(userRewards, tokenDecimals))
      setSymbol(await contract.symbol())
    }
    closure()
  }, [signer])

  return {
    contract,
    balance,
    decimals,
    formated,
    userStake,
    rewards,
    rewardsFormated,
    symbol,
    withdrawDelay
  }
}
