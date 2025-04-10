import CryptoJS from 'react-native-crypto-js';

// Old Key for legacy messages
const OLD_ENCRYPTION_KEY = "1457205c-9353-11ee-b9d1-0242ac120002";

// Secret passphrase for deriving keys
const SECRET_PASSPHRASE = "MySuperSecretPassphrase12345";

/**
 * Generate room-specific key (Base64)
 */
function generateRoomKey(roomId) {
    const wordArray = CryptoJS.enc.Utf8.parse(roomId); // Convert string to WordArray
    const base64RoomId = CryptoJS.enc.Base64.stringify(wordArray); // Convert to Base64
    const finalKey = base64RoomId + OLD_ENCRYPTION_KEY; // Append old key
  //  console.log("Generated Key:", finalKey);
    return finalKey;
}


export function encryptMessage(roomId, message) {
    const roomKey = generateRoomKey(roomId);  // Always generate key based on roomId


    return CryptoJS.AES.encrypt(message, roomKey).toString();
}

/**
 * Decrypt message with room-specific key, fallback to old key if needed
 */
// export function decryptMessage(roomId, encryptedMessage) {
   

//     let roomKey;

//     if (roomId) {
//         roomKey = generateRoomKey(roomId); // Use the room-specific key if roomId is provided
//         console.log('roomId decryptMessage====================================',roomId);
//     } else {
//         roomKey = OLD_ENCRYPTION_KEY;  // Use the old key if no roomId is provided
//         console.log('roomKey in else====================================');
//     }

//     // First attempt: Decrypt using the room-specific key or the old key (if no roomId)
//     try {
//         const bytes = CryptoJS.AES.decrypt(encryptedMessage, roomKey);
//         const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//         if (decrypted) {
//             return decrypted;  // Successfully decrypted with roomKey or old key
//         }
//     } catch (e) {
//         console.log("Failed to decrypt using room key (or old key if no roomId):", e);
//     }

//     // Fallback: Attempt to decrypt with the old encryption key if roomKey fails
//     try {
//         const bytes = CryptoJS.AES.decrypt(encryptedMessage, OLD_ENCRYPTION_KEY);
//         const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//         if (decrypted) {
//             console.log('decrypted sucess====================================',decrypted);
//             return decrypted;  // Successfully decrypted with the old key
//         }
//     } catch (e) {
//         console.log("Failed to decrypt using old key:", e);
//     }

//     return null; // Decryption failed
// }


export function decryptMessage(roomId, encryptedMessage) {
    let decrypted = null;

    if (roomId) {
        const roomKey = generateRoomKey(roomId);  // Room-specific key for new messages
      //  console.log('decryptMessage using roomId:', roomId);

        try {
            const bytes = CryptoJS.AES.decrypt(encryptedMessage, roomKey);
            decrypted = bytes.toString(CryptoJS.enc.Utf8);

            if (decrypted) {
              //  console.log('Decryption successful with room key:', decrypted);
                return decrypted;
            }
        } catch (error) {
           // console.warn('Decryption failed with room key, trying old key...', error);
        }
    }

    // Fallback to OLD_ENCRYPTION_KEY if room-specific key fails (for old messages)
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, OLD_ENCRYPTION_KEY);
        decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (decrypted) {
            //console.log('Decryption successful with old key:', decrypted);
            return decrypted;
        }
    } catch (error) {
       // console.error('Decryption failed with old key:', error);
    }

   // console.error('Decryption failed completely — message unreadable.');
    return null;  // Nothing worked — message is unreadable.
}



