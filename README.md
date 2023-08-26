# zest
Hybrid encryption powered by RSA and AES.

## What is Zest?
Zest is a simple encryption library designed to make your life easier, it handles the complicated encryption stuff, so you can focus on writing secure code.

## Example Usage
```js
const zest = require("zest-encryption");
// or (ESM)
import zest from 'zest-encryption';

const fs = require("fs");

// Encryption / decryption demo
const key = new zest.EncryptionKey();

const encrypted = key.encrypt("hi");
const decrypted = key.decrypt(encrypted);

if (decrypted === "hi") {
    console.log("It worked");
}

// Key export / import demo
fs.writeFileSync(".key", key.export());

const newKey = new zest.EncryptionKey(fs.readFileSync(".key").toString());
// or
const manuallyImported = new zest.EncryptionKey();

manuallyImported.import(fs.readFileSync(".key").toString());
```