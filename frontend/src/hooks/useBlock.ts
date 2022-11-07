import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { useProvider } from 'wagmi'

export function useBlock() {
  const provider = useProvider()
  const [block, setBlock] = useState<ethers.providers.Block | undefined>()

  useEffect(() => {
    (async () => {
      setBlock(await provider.getBlock(await provider.getBlockNumber()))
    })()
  }, [provider])

  return block
}
