import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import Auction from './contracts/Auction.json';

const AuctionContractAddress = '0xdBb32B4C45a1d153f513D69Ba5687a872f74c610';
const emptyAddress = '0x0000000000000000000000000000000000000000';

function App() {
 // Use hooks to manage component state
 const [account, setAccount] = useState('');
 const [amount, setAmount] = useState(0);
 const [myBid, setMyBid] = useState(0);
 const [isOwner, setIsOwner] = useState(false);
 const [highestBid, setHighestBid] = useState(0);
 const [highestBidder, setHighestBidder] = useState('');

 // Sets up a new Ethereum provider and returns an interface for interacting with the smart contract
 async function initializeProvider() {
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   const signer = provider.getSigner();
   return new ethers.Contract(AuctionContractAddress, Auction.abi, signer);
 }

 // Displays a prompt for the user to select which accounts to connect
 async function requestAccount() {
   const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
   setAccount(account[0]);
 }

 async function fetchHighestBid() {
   if (typeof window.ethereum !== 'undefined') {
     const contract = await initializeProvider();
     try {
       const highestBid = await contract.fetchHighestBid();
       const { bidAmount, bidder } = highestBid;

     // Convert bidAmount from Wei to Ether and round value to 4 decimal places
        setHighestBid(parseFloat(formatEther(bidAmount.toString())).toPrecision(4));
        setHighestBidder(bidder.toLowerCase());
     } catch (e) {
       console.log('error fetching highest bid: ', e);
     }
   }
 }

 async function fetchMyBid() {
   if (typeof window.ethereum !== 'undefined') {
     const contract = await initializeProvider();
     try {
       const myBid = await contract.bids(account);
       setMyBid(parseFloat(formatEther(myBid.toString())).toPrecision(4));
     } catch (e) {
       console.log('error fetching my bid: ', e);
     }
   }
 }

 async function fetchOwner() {
   if (typeof window.ethereum !== 'undefined') {
     const contract = await initializeProvider();
     try {
       const owner = await contract.getOwner();
       setIsOwner(owner.toLowerCase() === account);
     } catch (e) {
       console.log('error fetching owner: ', e);
     }
   }
 }

 async function submitBid(event) {
   event.preventDefault();
   if (typeof window.ethereum !== 'undefined') {
     const contract = await initializeProvider();
     try {
       // User inputs amount in terms of Ether, convert to Wei before sending to the contract.
       const wei = parseEther(amount);
       await contract.makeBid({ value: wei });
       // Wait for the smart contract to emit the LogBid event then update component state
       contract.on('LogBid', (_, __) => {
         fetchMyBid();
         fetchHighestBid();
       });
     } catch (e) {
       console.log('error making bid: ', e);
     }
   }
 }

 async function withdraw() {
   if (typeof window.ethereum !== 'undefined') {
     const contract = await initializeProvider();
     // Wait for the smart contract to emit the LogWithdrawal event and update component state
     contract.on('LogWithdrawal', (_) => {
       fetchMyBid();
       fetchHighestBid();
     });
     try {
       await contract.withdraw();
     } catch (e) {
       console.log('error withdrawing fund: ', e);
     }
   }
 }

 useEffect(() => {
   requestAccount();
 }, []);

 useEffect(() => {
   if (account) {
     fetchOwner();
     fetchMyBid();
     fetchHighestBid();
   }
 }, [account]);

 return (
   <div style={{ textAlign: 'center', width: '50%', margin: '0 auto', marginTop: '100px' }}>
     {isOwner ? (
       <button type="button" onClick={withdraw}>
         Withdraw
       </button>
     ) : (
       ""
     )}
     <div
       style={{
         textAlign: 'center',
         marginTop: '20px',
         paddingBottom: '10px',
         border: '1px solid black'
       }}>
       <p>Connected Account: {account}</p>
       <p>My Bid: {myBid}</p>
       <p>Auction Highest Bid Amount: {highestBid}</p>
       <p>
         Auction Highest Bidder:{' '}
         {highestBidder === emptyAddress
           ? 'null'
           : highestBidder === account
           ? 'Me'
           : highestBidder}
       </p>
       {!isOwner ? (
         <form onSubmit={submitBid}>
           <input
             value={amount}
             onChange={(event) => setAmount(event.target.value)}
             name="Bid Amount"
             type="number"
             placeholder="Enter Bid Amount"
           />
           <button type="submit">Submit</button>
         </form>
       ) : (
         ""
       )}
     </div>
   </div>
 );
}

export default App;