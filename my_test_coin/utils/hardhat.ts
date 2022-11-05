import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, getNamedAccounts } from 'hardhat'

/// This utility is used to get SignerWithAddress objects by key from namedAccounts
/// return promise of object where the key is the name of the account, and the value is the SignerWithAddress object
///
/// Example:
/// ```typescript
///
/// const {deployer}: SignerWithAddress = await getNamedSigners()
///
///```
export async function getNamedSigners(): Promise<Record<string, SignerWithAddress>> {
  const accounts = await getNamedAccounts()
  const result: Record<string, SignerWithAddress> = {}
  for (const [key, value] of Object.entries(accounts)) {
    result[key] = await ethers.getSigner(value)
  }
  return result
}
