import { useEffect, useState } from 'react';
import { Contract, ethers } from 'ethers';
import erc20ABI from '../ABIs/erc20.json';
import tokensConfig from '../configs/tokens.json';

declare global {
  interface Window {
    ethereum: any;
  }
}
type Provider = ethers.providers.Web3Provider;
interface ITokenBalance {
  name: string;
  amount: number;
  unit: string;
}
const Home = () => {
  const [metamaskEnabled, setMetamaskEnabled] = useState(false);
  const [provider, setProvider] = useState<Provider>();
  const [balance, setBalance] = useState('0.0');
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [tokens, setTokens] = useState<ITokenBalance[]>([]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(async (addr: string) => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const bigNumber = await provider.getBalance(addr[0]);
          const newBL = ethers.utils.formatEther(bigNumber);
          setProvider(provider);
          setBalance(newBL);
          setMetamaskEnabled(true);
          setAddress(addr[0]);
        });
    }
  }, []);

  useEffect(() => {
    if (provider && address) {
      setTokens([]);
      const getToken = async (address: string, tokenAddress: string) => {
        const options = {
          address,
          provider,
        };
        const contract = new Contract(tokenAddress, erc20ABI, options.provider);
        const balance = await contract.balanceOf(options.address);
        return ethers.utils.formatEther(balance);
      };
      tokensConfig.map(async (token) => {
        const amount = await getToken(address, token.address);
        const tokenBalance: ITokenBalance = {
          amount: +amount,
          name: token.name,
          unit: token.unit,
        };
        setTokens((prev) => [...prev, tokenBalance]);
      });
    }
  }, [address, provider]);

  return (
    <div>
      {!metamaskEnabled ? (
        'Please Install and Enable Metamask'
      ) : (
        <>
          {provider && (
            <div>
              <h3>Your Balance</h3>
              <span>{balance} KUB</span>
              {tokens.map((token, index) => (
                <div key={index}>
                  <span>{`${token.amount} ${token.unit}`} </span>
                  <br />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
