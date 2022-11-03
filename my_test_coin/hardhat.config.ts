import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'hardhat-abi-exporter'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.9',
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: 'https://mainnet.infura.io/v3/32c869b2294046f4931f3d8b93b2dae0',
        // blockNumber: 15778388
      },
      accounts: {
        count: 2,
        accountsBalance: '1000000000000000000000000000',
      },
      loggingEnabled: true,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  },
  abiExporter: {
    path: './abi'
  }
}

export default config
