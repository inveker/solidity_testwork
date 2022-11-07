import { FC, ReactNode } from 'react'
import { useBlockNumber, useNetwork } from 'wagmi'

export const ChainUpdateListener: FC<{ children: ReactNode }> = ({ children }) => {
  const { chain } = useNetwork()

  const blockNumber = useBlockNumber({
    chainId: chain?.id,
    watch: true,
  })

  return <div key={blockNumber.data}>{children}</div>
}
