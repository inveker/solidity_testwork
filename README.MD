# Before install

1. Export test account to your wallet

privateKey: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
publicKey: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

2. Add test network to your wallet

Network name: hardhat
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH

# Install

1. Clone this repository
2. In root project dir execute commands

```shell
npm i
```

```shell
npm run node
```

After first "eth_blockNumber" open new terminal

```shell
npm run frontend
```

After "No issues found." can test application

# Scripts

Increase blockchain timestamp to 1 hour

```shell
npm run timeHour
```

Increase blockchain timestamp to 30 minutes

```shell
npm run timeHalfHour
```

Increase blockchain timestamp to 1 day

```shell
npm run timeDay
```