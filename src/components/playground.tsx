import { useEffect, useState } from 'react';
import { Contract, ethers } from 'ethers';
import storageDataABI from '../ABIs/storage-data.json';
import { getListOfTokensOwnedByAddress, IToken } from '../services/token';

declare global {
  interface Window {
    ethereum: any;
  }
}
type Provider = ethers.providers.Web3Provider;
const PlayGround = () => {
  const [metamaskEnabled, setMetamaskEnabled] = useState(false);
  const [provider, setProvider] = useState<Provider>();
  const [balance, setBalance] = useState('0.0');
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [tokens, setTokens] = useState<IToken[]>([]);

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
    if (address) {
      const fetchTokens = async (address: string) => {
        const response = await getListOfTokensOwnedByAddress(address);
        if (response) {
          const tokens: IToken[] = response;
          setTokens(tokens);
        }
      };
      fetchTokens(address);
    }
  }, [address]);

  const handleTestCallContract = async () => {
    const signer = provider?.getSigner();
    const options = {
      address: '0x31CA753Ce11D5346d17607efBE2CC3f28B9BeE12',
      provider: signer,
    };
    const contract = new Contract(
      options.address,
      storageDataABI,
      options.provider
    );
    // await contract.addValue(1);
    const count = await contract.viewCount();
    console.log(ethers.utils.formatUnits(count, 18));
  };

  const convertBalance = (token: IToken) => {
    return ethers.utils.formatUnits(token.balance, +token.decimals);
  };
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
                  <span>{`${convertBalance(token)} ${token.symbol}`} </span>
                  <br />
                </div>
              ))}
              <button onClick={handleTestCallContract}>
                Test Call Contract
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlayGround;
