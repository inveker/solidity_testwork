import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  await deploy('MyTestCoin', {
    contract: 'MyTestCoin',
    from: deployer,
    args: [
      ethers.utils.parseEther('1000000'), // _initialSupply
      60 * 60, // _claimRewardsDelay = 1 hours
      60 * 60 * 24, // _withdrawDelay = 1 days
      60 * 60, // _rewardPeriod = 1 hours
      1000, // _rewardRatePerPeriod = 10%
    ],
  })
}

deploy.tags = ['MyTestCoin']
export default deploy
