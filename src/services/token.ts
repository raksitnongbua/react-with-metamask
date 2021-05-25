export const BASE_API = 'https://testnet.bkcscan.com/api';
export interface IToken {
  balance: string;
  contractAddress: string;
  decimals: string;
  name: string;
  symbol: string;
  type: string;
}
export const getListOfTokensOwnedByAddress = async (
  address: string
): Promise<IToken[] | undefined> => {
  try {
    const response: any = await fetch(
      `${BASE_API}?module=account&action=tokenlist&address=${address}`
    );
    if (response.status === 200) {
      const resJSON = await response.json();
      return resJSON.result.map((token: any) => token as IToken);
    } else {
      return undefined;
    }
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
