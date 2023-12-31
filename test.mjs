import zest from "./index.js";

const key = new zest.EncryptionKey();

const testString = "Moniker Zest Encryption Test"

console.log("Testing encryption/decryption");

const encrypted = key.encrypt(testString);
const decrypted = key.decrypt(encrypted);

if (decrypted === testString) {
    console.log("Encryption/decryption test passed using test string: \"" + testString + "\"");
}

console.log("Testing key export/import");

const exportedKey = key.export();

const prevKeyId = key.id;

key.import(exportedKey);

if (key.decrypt(encrypted) === testString) {
    console.log("Key export/import test passed using test string: \"" + testString + "\"");
}

console.log("Testing default key importing");

const loadedKey = new zest.EncryptionKey(exportedKey);

if (loadedKey.decrypt(encrypted) === testString) {
    console.log("Default key import test passed using test string: \"" + testString + "\"");
}

console.log("Key ID test", (loadedKey.id === prevKeyId ? "passed" : "failed"), `using key ID: ${loadedKey.id}`);

const validVerify = key.verify("Test Message", (key.sign("Test Message")));
const invalidVerify = key.verify("Test Message", (key.sign("Different Message")));

console.log("Message signing test", (validVerify && !invalidVerify) ? "passed" : "failed");