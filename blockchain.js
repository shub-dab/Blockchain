const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;  // we can add timestamp to differentiate between transaction happening at the same time
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
    }

    signTransaction(signingKey) {     // we will just sign the generated hash

        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'based64');
        this.signature = sig.toDER('hex');
    }

    isValid() {                                        // verify if the transaction is correctly signed
        if(this.fromAddress === null) return true;     // transaction of the mining reward is valid

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signaure in this transaction!');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;        // when the block is created
        this.transactions = transactions;  // transactions 
        this.previousHash = previousHash;  // hash of previous block
        this.hash = this.calculateHash();  // hash of current block
        this.nonce = 0;
    }

    calculateHash() {                      // we will use sha-256 
        return SHA256(this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {                // implementing proof of work
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('Block mined: ' + this.hash);
    }

    hasValidTransactions() {
        for(const tx of this.transactions) {
            if(!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}

class Blockchain {
    constructor() {              
        this.chain = [this.createGenesisBlock()];    // chain is array of blocks
        this.difficulty = 2;
        this.pendingTransactions = [];               // in every blockchain, only one block can be created in a fixed time interval
        this.miningReward = 100;                     // 100 units of cryptocurrency awarded
    }

    createGenesisBlock() {         // first block of blockchain
        return new Block('01/08/2020', 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);


        let block = new Block(Date.now(), this.pendingTransactions);    // in reality, there are way too many transactions, so miners need to pick the transactions which they want to include
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];                // resetting the pending transactions array   
    }

    addTransaction(transaction) {
        if(!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to the chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {       // calculating balance from all the transactions
        let balance = 0;

        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance = balance - trans.amount;
                }

                if(trans.toAddress === address) {
                    balance = balance + trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid() {           // verify the integrity of blockchain
        for(let i=1; i<this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransactions()) {
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;