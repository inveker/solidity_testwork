import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, getNamedAccounts } from 'hardhat'

/// This utility is used to get SignerWithAddress objects by key from namedAccounts
/// [getAccounts] - a function from the hardhat-deploy library to get public keys by key
/// return promise of object where the key is the name of the account, and the value is the SignerWithAddress object
///
/// Example:
/// ```typescript
///
/// import { getNamedAccounts } from 'hardhat'
///
/// const {deployer}: SignerWithAddress = await getNamedSigners(getNamedAccounts)
///
///```
export async function getNamedSigners(
  getAccounts: typeof getNamedAccounts,
): Promise<Record<string, SignerWithAddress>> {
  const accounts = await getAccounts()
  const result: Record<string, SignerWithAddress> = {}
  for (const [key, value] of Object.entries(accounts)) {
    result[key] = await ethers.getSigner(value)
  }
  return result
}
