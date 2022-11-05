import { deployments, ethers, getNamedAccounts } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MyTestCoin, MyTestCoin__factory } from '../typechain-types'
import { getNamedSigners } from '../utils/hardhat'
import { BigNumber } from './utils/types'
import { assert, expect } from 'chai'
import * as helpers from '@nomicfoundation/hardhat-network-helpers'

describe('MyTestCoin', function () {
  var deployer: SignerWithAddress
  var user: SignerWithAddress
  var userInitialBalance: BigNumber
  var myTestCoin: MyTestCoin
  let initSnapshot: string

  before(async () => {
    const accounts = await getNamedSigners(getNamedAccounts)
    deployer = accounts.deployer
    user = accounts.user

    await deployments.fixture(['MyTestCoin'])

    const MyTestCoinDeployment = await deployments.get('MyTestCoin')

    myTestCoin = MyTestCoin__factory.connect(MyTestCoinDeployment.address, deployer)

    // Send some tokens to user
    const initialSupplly = await myTestCoin.balanceOf(deployer.address)
    userInitialBalance = initialSupplly.div(2)

    await myTestCoin.transfer(user.address, userInitialBalance)

    initSnapshot = await ethers.provider.send('evm_snapshot', [])
  })

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [initSnapshot])
    initSnapshot = await ethers.provider.send('evm_snapshot', [])
  })

  it('Stake: regular', async () => {
    const currentBlock = await ethers.provider.getBlock(ethers.provider.blockNumber)
    const stackedAmount = userInitialBalance.div(2)
    const estimatedUserBalance = userInitialBalance.sub(stackedAmount)
    await myTestCoin.connect(user).stake(stackedAmount)

    const { amount, lastRewardTimestamp, creationTimestamp, claimedRewards } = await myTestCoin.stakeByUser(user.address)

    assert(amount.eq(stackedAmount), `stackedAmount != locked amount, ${stackedAmount} != ${amount}`)

    assert(
      lastRewardTimestamp.eq(0), 
      `lastRewardTimestamp != 0, ${lastRewardTimestamp} != 0`,
    )

    assert(
      creationTimestamp.sub(currentBlock.timestamp).abs().lte(60), // ~ +- 60 sec
      `creationTimestamp != block.timestamp, ${creationTimestamp} != ${currentBlock.timestamp}`,
    )

    assert(
      claimedRewards.eq(0), 
      `claimedRewards != 0, ${claimedRewards} != 0`,
    )

    const userBalance = await myTestCoin.balanceOf(user.address)
    assert(
      estimatedUserBalance.eq(userBalance),
      `estimatedUserBalance != userBalance, ${estimatedUserBalance} != ${userBalance}`,
    )
  })

  it('Stake: amount > balance', async () => {
    const stackedAmount = userInitialBalance.mul(2)
    expect(myTestCoin.connect(user).stake(stackedAmount)).to.be.revertedWith('Not enough balance')
  })

  it('Stake: amount == 0', async () => {
    const stackedAmount = 0
    expect(myTestCoin.connect(user).stake(stackedAmount)).to.be.revertedWith('Amount can not be zero')
  })

  // This test used 3.5 rewards periods: 1x time, 1.5x time, 1 time, sum = 3x full time period rewards
  // 3.5 rewards periods due to function call restriction
  it('Claim Rewards: regular', async () => {
    const stackedAmount = userInitialBalance.div(2)
    const REWARD_PERIOD = await myTestCoin.REWARD_PERIOD()
    await myTestCoin.connect(user).stake(stackedAmount)

    const userBalanceAfterStake = await myTestCoin.balanceOf(user.address)

    // First period 1x time
    {
      await helpers.time.increase(REWARD_PERIOD) // 1x period

      const estematedRewards = await myTestCoin.rewards(user.address)
      const beforeClaimBalance = await myTestCoin.balanceOf(user.address)

      await myTestCoin.connect(user).claimRewards()

      const afterClaimBalance = await myTestCoin.balanceOf(user.address)
      const rewards = afterClaimBalance.sub(beforeClaimBalance)

      assert(rewards.eq(estematedRewards), `rewards != estematedRewards, ${rewards} != ${estematedRewards}`)
    }

    // Second period x 1.5 time, get rewards by 1 period, and save 0.5 period to next time
    {
      const secondPeriod = REWARD_PERIOD.mul(15).div(10) // 1.5x period

      await helpers.time.increase(secondPeriod)

      const estematedRewards = await myTestCoin.rewards(user.address)
      const beforeClaimBalance = await myTestCoin.balanceOf(user.address)

      await myTestCoin.connect(user).claimRewards()

      const afterClaimBalance = await myTestCoin.balanceOf(user.address)
      const rewards = afterClaimBalance.sub(beforeClaimBalance)

      assert(
        rewards.eq(estematedRewards),
        `Second period rewards != estematedRewards, ${rewards} != ${estematedRewards}`,
      )
    }

    // Third period x 1 time. 0.5 from this period cant be claimed, but 0.5 from last period added to rewards
    {
      const thirdPeriod = REWARD_PERIOD // 1x period

      await helpers.time.increase(thirdPeriod)

      const estematedRewards = await myTestCoin.rewards(user.address)
      const beforeClaimBalance = await myTestCoin.balanceOf(user.address)

      await myTestCoin.connect(user).claimRewards()

      const afterClaimBalance = await myTestCoin.balanceOf(user.address)
      const rewards = afterClaimBalance.sub(beforeClaimBalance)

      assert(
        rewards.eq(estematedRewards),
        `Second period rewards != estematedRewards, ${rewards} != ${estematedRewards}`,
      )
    }

    // Finaly user get 3x time rewards
    const periodsCount = 3

    const REWARD_RATE_PER_PERIOD = await myTestCoin.REWARD_RATE_PER_PERIOD()
    const REWARD_DENOMINATOR = await myTestCoin.REWARD_DENOMINATOR()

    const userBalanceAfterAllRewards = await myTestCoin.balanceOf(user.address)

    const allEstematedRewards = stackedAmount.mul(REWARD_RATE_PER_PERIOD).div(REWARD_DENOMINATOR).mul(periodsCount)

    const allRewards = userBalanceAfterAllRewards.sub(userBalanceAfterStake)

    assert(
      allRewards.eq(allEstematedRewards),
      `allRewards != allEstematedRewards, ${allRewards} != ${allEstematedRewards}`,
    )
  })

  it('Claim Rewards: before expiry reward delay', async () => {
    const stackedAmount = userInitialBalance.div(2)
    const CLAIM_REWARDS_DELAY = await myTestCoin.CLAIM_REWARDS_DELAY()
    await myTestCoin.connect(user).stake(stackedAmount)

    // First regular claim
    await helpers.time.increase(CLAIM_REWARDS_DELAY.add(5 * 60)) // CLAIM_REWARDS_DELAY + 5 min
    await myTestCoin.connect(user).claimRewards()

    // Claim after < CLAIM_REWARDS_DELAY
    await helpers.time.increase(CLAIM_REWARDS_DELAY.sub(5 * 60)) // CLAIM_REWARDS_DELAY - 5 min
    await expect(myTestCoin.connect(user).claimRewards()).to.be.revertedWith('Claim rewards period has not ended')
  })

  it('Claim Rewards: without stake', async () => {
    await expect(myTestCoin.connect(user).claimRewards()).to.be.revertedWith("Can't claim rewards without a stake")
  })

  it('Withdraw: regular', async () => {
    const stackedAmount = userInitialBalance.div(2)
    const WITHDRAW_DELAY = await myTestCoin.WITHDRAW_DELAY()
    await myTestCoin.connect(user).stake(stackedAmount)

    const userBalanceAfterStake = await myTestCoin.balanceOf(user.address)

    await helpers.time.increase(WITHDRAW_DELAY) 

    await myTestCoin.connect(user).withdraw()

    const userBalanceAfterWithdraw = await myTestCoin.balanceOf(user.address)

    const withdrawedBalance = userBalanceAfterWithdraw.sub(userBalanceAfterStake)

    assert(withdrawedBalance.eq(stackedAmount), `withdrawedBalance != stackedAmount, ${withdrawedBalance} != ${stackedAmount}`)
  })

  it('Withdraw: before expiry', async () => {
    const stackedAmount = userInitialBalance.div(2)
    const WITHDRAW_DELAY = await myTestCoin.WITHDRAW_DELAY()
    await myTestCoin.connect(user).stake(stackedAmount)

    await helpers.time.increase(WITHDRAW_DELAY.sub(60)) // - 1 min 

    await expect(myTestCoin.connect(user).withdraw()).to.be.revertedWith('Blocking period has not expired')
  })

  it('Withdraw: without deposit', async () => {
    await expect(myTestCoin.connect(user).withdraw()).to.be.revertedWith("Can't withdraw without a stake")
  })
})
