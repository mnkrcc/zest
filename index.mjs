// Zest - Hybrid encryption powered by RSA and AES
// This file provides functions for utilising Zest's encryption schemes

import crypto from "crypto";
import sha256 from "sha256";

function _generateRSAKeypair(modulusLength = 2048) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength,
    });

    const sk = privateKey.export({
        type: "pkcs1",
        format: "pem",
    }).toString();
    
    const pk = publicKey.export({
		type: "pkcs1",
		format: "pem",
	}).toString();

    return {
        privateKey,
        publicKey,
        exported: {
            private: sk,
            public: pk
        }
    }
}

function _generateAESKey() {
    // 32 bytes == 256 bit
    return crypto.randomBytes(32);
}

function _encryptWithRSA(plaintext, publicKey) {
    return crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(plaintext)
    ).toString("hex");
}

function _decryptWithRSA(ciphertext, privateKey) {
    return crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(ciphertext, "hex")
    );
}

function _encryptWithAES(plaintext, key, algorithm = "aes-256-cbc") {
    const iVec = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iVec);

    let encryptedData = cipher.update(plaintext, "utf-8", "hex");

    encryptedData += cipher.final("hex");

    return {
        _i: iVec.toString("hex"),
        e: encryptedData
    };
}

function _decryptWithAES(ciphertext, key, algorithm = "aes-256-cbc") {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ciphertext._i, "hex"));

    let decryptedData = decipher.update(ciphertext.e, "hex", "utf-8");

    decryptedData += decipher.final("utf8");

    return decryptedData;
}

function _signWithRSA(message, privateKey) {
    const signature = crypto.sign("sha256", Buffer.from(message), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });

    return signature.toString("hex");
}

function _verifySignatureWithRSA(signature, message, publicKey) {
    return crypto.verify("sha256", Buffer.from(message), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    }, signature);
}
class EncryptionKey {
    setKey(keyPayload) {
        this.id = sha256(JSON.stringify(keyPayload._RSA.exported.public) + sha256(keyPayload._AES.toString("hex") + ".mnkr")).slice(0, 16);
        this._key = keyPayload;
    }
    createKey(RSAModulusLength = 2048) {
        const RSAKeypair = _generateRSAKeypair(RSAModulusLength);
        const AESSecret = _generateAESKey();

        this.setKey({
            _RSA: RSAKeypair,
            _AES: AESSecret
        });
    }
    encrypt(plaintext) {
        // Generate random AES secret used for this encryption
        const tempAESSecret = _generateAESKey();

        // Encrypt temp AES key with the loaded RSA key
        const tempAESSecretSecured = _encryptWithRSA(tempAESSecret, this._key._RSA.publicKey);

        // Encrypt payload using the newly generated AES key
        const encryptedPayload = _encryptWithAES(plaintext, tempAESSecret);

        const encryptionPayload = {
            aesSecure: tempAESSecretSecured,
            payload: encryptedPayload
        }

        // Encrypt everything with this Zest EncryptionKey's AES key
        var finalPayload = _encryptWithAES(JSON.stringify(encryptionPayload), this._key._AES);

        // Combine the initialisation vector and encrypted payload
        finalPayload = finalPayload._i + finalPayload.e;

        return finalPayload;
    }
    decrypt(ciphertext) {
        // Extract the initialisation vector and encrypted payload
        const cipherIVec = Buffer.from(ciphertext.substring(0, 32), "hex");
        const cipherPayload = ciphertext.substring(32, ciphertext.length);

        // Decrypt the first-layer with the stored AES key
        const encryptedPayload = JSON.parse(_decryptWithAES({
            _i: cipherIVec,
            e: cipherPayload
        }, this._key._AES));

        // Decrypt the temp AES key with stored RSA key
        const tempAESSecret = _decryptWithRSA(encryptedPayload.aesSecure, this._key._RSA.privateKey);

        // Finally, decrypt the original payload
        const plaintext = _decryptWithAES(encryptedPayload.payload, tempAESSecret);

        return plaintext;
    }
    sign(message) {
        return _signWithRSA(message, this._key._RSA.privateKey);
    }
    verify(message, signature, publicKey) {
        if (!publicKey) publicKey = this._key._RSA.publicKey;

        return _verifySignatureWithRSA(Buffer.from(signature, "hex"), message, publicKey);
    }
    export() {
        const rsaSecuredAESSecret = _generateAESKey();
        const aesSecuredAESSecret = _generateAESKey();

        var encryptedRSA = _encryptWithAES(JSON.stringify(this._key._RSA.exported), rsaSecuredAESSecret);
        var encryptedAES = _encryptWithAES(this._key._AES.toString("hex"), aesSecuredAESSecret);

        encryptedRSA = encryptedRSA._i + encryptedRSA.e;
        encryptedAES = encryptedAES._i + encryptedAES.e;

        const exportedKeypair = Buffer.from(`${encryptedRSA}.${encryptedAES}.${rsaSecuredAESSecret.toString("hex")}.${aesSecuredAESSecret.toString("hex")}`).toString("hex");

        return exportedKeypair;
    }
    import(exportedKeypair) {
        // Get the original exported data including the AES secrets
        const exportedKeypairDecoded = Buffer.from(exportedKeypair, "hex").toString();

        const keypairSections = exportedKeypairDecoded.split(".");

        // Extract the keypair security keys
        const rsaSecuredAESSecret = Buffer.from(keypairSections[2], "hex");
        const aesSecuredAESSecret = Buffer.from(keypairSections[3], "hex");

        const encryptedRSA = keypairSections[0];
        const encryptedAES = keypairSections[1];

        const rsaEncCipherIVec = Buffer.from(encryptedRSA.substring(0, 32), "hex");
        const rsaEncCipherPayload = encryptedRSA.substring(32, encryptedRSA.length);
        
        const decryptedRSA = JSON.parse(_decryptWithAES({
            _i: rsaEncCipherIVec,
            e: rsaEncCipherPayload
        }, rsaSecuredAESSecret));

        const aesEncCipherIVec = Buffer.from(encryptedAES.substring(0, 32), "hex");
        const aesEncCipherPayload = encryptedAES.substring(32, encryptedAES.length);

        const decryptedAES = _decryptWithAES({
            _i: aesEncCipherIVec,
            e: aesEncCipherPayload
        }, aesSecuredAESSecret);

        const loadedRSAPrivateKey = crypto.createPrivateKey({
            key: decryptedRSA.private,
            format: "pem",
            type: "pkcs1"
        });

        const loadedRSAPublicKey = crypto.createPublicKey({
            key: decryptedRSA.public,
            format: "pem", 
            type: "pkcs1"
        });

        const RSAPayload = {
            privateKey: loadedRSAPrivateKey,
            publicKey: loadedRSAPublicKey,
            exported: {
                private: decryptedRSA.private,
                public: decryptedRSA.public
            }
        }

        const loadedAESKey = Buffer.from(decryptedAES, "hex");

        this.setKey({
            _RSA: RSAPayload,
            _AES: loadedAESKey
        });
    }
    constructor(loadKeyObject) {
        this.id = undefined;

        if (!loadKeyObject) {
            this.createKey();
        } else {
            this.import(loadKeyObject);
        }
    }
}

export default {
    EncryptionKey
}