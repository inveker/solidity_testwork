import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'hardhat-abi-exporter'
import 'hardhat-gas-reporter'

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
      chainId: 31337,
      accounts: {
        count: 2,
        accountsBalance: '1000000000000000000000000000',
      },
      loggingEnabled: true,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  abiExporter: {
    path: './abi',
  },
  gasReporter: {
    enabled: true,
  },
}

export default config
