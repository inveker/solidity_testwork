import { deployments, ethers, getNamedAccounts } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe('MyTestCoin', function () {
  var owner: SignerWithAddress
  var user: SignerWithAddress
  var myTestCoin: MyTestCoin
  let initSnapshot: string

  before(async () => {
    const accounts = await ethers.getSigners()
    owner = accounts[0]
    user = accounts[1]

    await deployments.fixture(['MyTestCoin'])

    const MyTestCoinDeployment = await deployments.get('MyTestCoin')

    myTestCoin = NeuronToken__factory.connect(NeuronTokenDeployment.address, deployer)

    initSnapshot = await ethers.provider.send('evm_snapshot', [])
  })

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [initSnapshot])
    initSnapshot = await ethers.provider.send('evm_snapshot', [])
  })

  it('a', async () => {
    const NeuronTokenDeployment = await deployments.get('NeuronToken')
  })
})
