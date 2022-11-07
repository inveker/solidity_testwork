import * as helpers from '@nomicfoundation/hardhat-network-helpers'

async function main() {
    const time = Number(process.env.TIME)
    if(!time) throw Error('!process.env.TIME')
    await helpers.time.increase(time)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
