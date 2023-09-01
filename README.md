# Zest 🔐
Sophisticated hybrid encryption leveraging the power of RSA and AES technologies.

## Introduction
Zest is a hybrid encryption library, developed by the team at Moniker ([github.com/mnkrcc](https://github.com/mnkrcc)), to simplify encryption for developers by abstracting away complicated methods.

## Features
- **Hybrid Encryption**: Seamlessly combines the strengths of RSA and AES encryption algorithms to deliver a robust and secure encryption solution.
- **Effortless Key Management**: Automates key generation, export, and import, making key management a hassle-free process.
- **Zero Additional Dependencies**: Leverages native NodeJS packages, eliminating the necessity for any external dependencies.

## Example Usage
```js
const zest = require("zest-encryption");
// or (ESM)
import zest from 'zest-encryption';

const fs = require("fs");

// Encryption / decryption demo
const key = new zest.EncryptionKey();

key.createKey();

const encryptedMessage = key.encrypt("Hello, World!");
const decryptedMessage = key.decrypt(encryptedMessage);

if (decryptedMessage === "Hello, World!") {
    console.log("Encryption and decryption successful!");
}

// Key export / import demo
fs.writeFileSync(".key", key.export());

const importedKey = new zest.EncryptionKey(fs.readFileSync(".key").toString());
// or
const manuallyImportedKey = new zest.EncryptionKey();

manuallyImportedKey.import(fs.readFileSync(".key").toString());
```

## Notes
- **Default Key Generation**: A new encryption key is automatically generated whenever a new instance of `zest.EncryptionKey` is instantiated. This implies that invoking `key.createKey()` is not mandatory.
- **RSA Modulus Length**: The default RSA modulus length is 2048 bits. However, this can be customized by invoking the `key.createKey()` method.

## License
Zest is released under the MIT license. For more information, please refer to the [license file](https://github.com/mnkrcc/zest/blob/main/LICENSE) in the repository.

## Links
- [NPM Package](https://www.npmjs.com/package/zest-encryption)
- [NPM Runkit](https://npm.runkit.com/zest-encryption)
- [GitHub Repository](https://github.com/mnkrcc/zest)
