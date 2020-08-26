const EC = require('elliptic').ec;   // this library allows us to generate public and private keys

const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');   // hex format
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private key: ', privateKey);

console.log();
console.log('Public key: ', publicKey);