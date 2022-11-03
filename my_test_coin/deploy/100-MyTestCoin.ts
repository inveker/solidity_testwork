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
    args: [ethers.utils.parseEther('1000000')],
  })
}

deploy.tags = ['MyTestCoin']
export default deploy
