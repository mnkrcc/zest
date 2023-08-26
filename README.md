# Zest
Hybrid encryption powered by RSA and AES.

## What is Zest?
Zest is a simple encryption library designed to make your life easier, it handles the complicated encryption stuff, so you can focus on writing secure code.

Zest uses native NodeJS packages so it does not require anything else to function.

## Example Usage
```js
const zest = require("zest-encryption");
// or (ESM)
import zest from 'zest-encryption';

const fs = require("fs");

// Encryption / decryption demo
const key = new zest.EncryptionKey();

key.createKey();

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

## Notes
When a new instance of `zest.EncryptionKey` is created, a new encryption key is created by default. This means that `key.createKey()` is not required to be called.

An RSA modulus length of 2048 is used by default, this can be overridden by using `key.createKey()`.