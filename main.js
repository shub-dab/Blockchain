const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const {Blockchain, Transaction} = require('./blockchain');

const myKey = ec.keyFromPrivate('28dfc31500b5ce3aa866f082b4040e8af72497f70381921fd0157ff306134ad5');
const myWalletAddress = myKey.getPublic('hex');  // my public key

let dabCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);  // first two arguments are public keys
tx1.signTransaction(myKey);
dabCoin.addTransaction(tx1);

console.log('\n Starting the miner...');
dabCoin.minePendingTransactions(myWalletAddress);

console.log('Balance of Dab is ', dabCoin.getBalanceOfAddress(myWalletAddress));

