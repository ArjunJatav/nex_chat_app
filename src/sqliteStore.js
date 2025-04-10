import { Platform } from "react-native";
import CryptoJS from "react-native-crypto-js";
import SQLite from "react-native-sqlite-storage";
import { EncryptionKey } from "./Constant/Key";
import { socket } from "./socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decryptMessage, encryptMessage } from "./utils/CryptoHelper";

const db = SQLite.openDatabase({ name: "chatDB", location: "default" });

export const updateroominfo = (name, image, roomId, allow, owner, isPublic) => {
  let roomAllow = allow ? allow : "public";
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM RoomSql WHERE roomId = ? LIMIT 1",
      [roomId],
      (tx, res) => {
        let roomsLength = res.rows.length;
        try {
          if (roomsLength > 0) {
            tx.executeSql(
              `UPDATE RoomSql SET
            roomName = ?,
            roomImage = ?,
            allow = ?,
            isPublic = ?
            WHERE roomId = ?`,
              [name, image, roomAllow, isPublic, roomId],
              null, // You can pass null or undefined if you want to explicitly indicate no callback.
              (error) => {
                console.log("updateroominfo error : ", error);
              }
            );
          } else {
            tx.executeSql(
              "INSERT OR REPLACE INTO RoomSql (roomId, roomName, roomImage, roomType, archive, lastMessage, messageType, unseenMessageCount, time, lastMessageId, isUserExitedFromGroup, friendId, isNotificationAllowed, owner, sId, allow,isPublic) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?,?,?, ?, ?, ?,?,?,?)",
              [
                roomId,
                name,
                image,
                "multiple",
                0,
                // CryptoJS.AES.encrypt(
                //   "Admin Added You",
                //   EncryptionKey
                // ).toString(),
                encryptMessage(roomId, "Admin Added You"),
                "notify",
                0,
                new Date().toISOString(),
                93,
                0,
                null,
                1,
                owner,
                null,
                roomAllow,
                isPublic,
              ],
              () => {
                getRoomMembers(roomId);
              },
              (err) => {
                console.log("updateroominfo error : ", err);
              }
            );
          }
        } catch (error) {
          console.log("updateroominfo error :", error);
        }
      },
      (err) => {
        console.log("updateroominfo error : ", err);
      }
    );
  });
};

export const getTableData = async (tablename, callback) => {
  await db.transaction(async (tx) => {
    await tx.executeSql(
      `SELECT DISTINCT rl.id, rl.*, ct.name AS contactName, latestMessage.message as lastMessage, latestMessage.createdAt as lastMessageTime, latestMessage.message_type as lastMessageType, latestMessage.mId as lastMessageId, latestMessage.isDeletedForAll as isLatestMessageDeleted
       FROM RoomSql AS rl
       LEFT JOIN (SELECT roomId, mId, message, message_type, createdAt,isDeletedForAll, MAX(createdAt) FROM Chatmessages GROUP BY roomId) as latestMessage ON rl.roomId = latestMessage.roomId
       LEFT JOIN ContactTable AS ct ON substr(replace(rl.roomName, '.0', ''), -10) = substr(replace(ct.phone_number, '.0', ''), -10) WHERE rl.isHide = '0' GROUP BY rl.id`,
      [],
      async (_, results) => {
        try {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            let contactName = results.rows.item(i).contactName;
            // console.log("romifooo",results.rows.item(i))
            let roomName = results.rows.item(i).roomName?.replace(".0", "");
            temp.push({
              ...results.rows.item(i),
              roomName: roomName,
              contactName: contactName,
            });
            // }
          }

          callback(temp);
        } catch (error) {
          console.log(">>>>>Errrr", error);
        }
        // Pass retrieved data to the callback
      },
      (error) => {
        console.error("Error fetching data:", error);
        callback([]); // Handle errors by passing an empty array or specific error indicator
      }
    );
  });
};

export const getCurrentMemberData = async (userId, roomId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM RoomMembers WHERE roomId = ? AND userId = ? LIMIT 1",
      [roomId, userId],
      (tx, res) => {
        callback(res.rows.item(0));
      },
      (err) => {
        console.log("getCurrentMemberData error : ", err);
      }
    );
  });
};

export const searchRooms = (name, callback) => {
  db.transaction((tx) => {
    if (name == "") {
      tx.executeSql(
        "SELECT *,Replace(roomName, '.0', '') as roomName FROM RoomSql as rl LEFT JOIN ContactTable as ct ON substr(replace(ct.phone_number, '.0', ''), -10) = substr(replace(rl.roomName, '.0', ''), -10) WHERE rl.isUserExitedFromGroup = '0' AND rl.isHide = '0' ",
        [],
        (tx, res) => {
          const searchRoomsList = [];
          for (let i = 0; i < res.rows.length; i++) {
            searchRoomsList.push(res.rows.item(i));
          }

          callback(searchRoomsList);
          return;
        },
        (err) => {
          console.log("err:", err);
        }
      );
    } else {
      tx.executeSql(
        `SELECT *,Replace(roomName, '.0', '') as roomName FROM RoomSql LEFT JOIN ContactTable as ct ON substr(replace(ct.phone_number, '.0', ''), -10) = substr(replace(rl.roomName, '.0', ''), -10)  WHERE roomName = ?`,
        [name],
        (tx, res) => {
          const searchRoomsList = [];
          for (let i = 0; i < res.rows.length; i++) {
            searchRoomsList.push(res.rows.item(i));
          }
          callback(searchRoomsList);
          return;
        }
      );
    }
  });
};

export const deleteRoomId = async (selectedRoomId) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM Chatmessages WHERE roomId = ?",
      [selectedRoomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Error deleting room from SQLite:", error);
      }
    );
  });
};

export const blockRoom = async (selectedRoomId, isblock, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET isUserExitedFromGroup = ? WHERE roomId = ?",
      [!isblock, selectedRoomId],
      (_, results) => {
        if (results.rows.length > 0) {
          callback(true); //
        } else {
          callback(false); //
        }
      },
      (error) => {
        console.error("Error updating isblock:", error);
      }
    );
  });
};

export const muteroom = (selectedRoomId, isblock) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET isNotificationAllowed = ? WHERE roomId = ?",
      [!isblock, selectedRoomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Error updating isblock:", error);
      }
    );
  });
};

export const deletechatroom = async (selectedRoomId, isdelete) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET isChatListDelete = ? WHERE roomId = ?",
      [isdelete, selectedRoomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Error updating isblock:", error);
      }
    );
  });
};

export const pinchatroom = async (selectedRoomId, ispin) => {
  console.log("pin>>>>>>>>", ispin);
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET ispin = ? WHERE roomId = ?",
      [ispin, selectedRoomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Error updating isblock:", error);
      }
    );
  });
};

export const checkPinStatus = (selectedRoomId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT ispin FROM RoomSql WHERE roomId = ?",
      [selectedRoomId],
      (_, results) => {
        if (results.rows.length > 0) {
          const isPin = results.rows.item(0).ispin;
          callback(isPin); // Return the value of ispin through the callback
        } else {
          callback(false); // Return false if no entry is found for the roomId
        }
      },
      (error) => {
        console.error("Error fetching pin status:", error);
        callback(false); // Return false in case of an error
      }
    );
  });
};

export const archiveRoom = (selectedRoomId, isArchive) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET archive = ? WHERE roomId = ?",
      [isArchive, selectedRoomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Error updating archive:", error);
      }
    );
  });
};

export const removeCount = (roomId) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET unseenMessageCount = ? WHERE roomId = ?",
      [0, roomId],
      null // You can pass null or undefined if you want to explicitly indicate no callback.
    );
  });
};

export const newMessageInsertList = (
  insertdata,
  isupdate,
  phoneNumber,
  unseenCount,
  callback
) => {
  db.transaction((tx) => {
    if (isupdate) {
      if (globalThis.userChatId == insertdata.fromUser) {
        isupdate = false;
      }
      //  console.log("insertdata========", insertdata);
      tx.executeSql(
        `UPDATE RoomSql SET roomId = ?, archive = ?, lastMessage = ?, messageType = ?, time = ?, lastMessageId = ?, isUserExitedFromGroup = ? WHERE roomId = ?`,
        [
          insertdata.roomId,
          insertdata.isArchived ? 1 : 0,
          insertdata.message,
          insertdata.message_type,
          insertdata.messageTime,
          insertdata._id,
          0,
          insertdata.roomId,
        ],
        (tx, results) => {
          callback(results);
        },
        (error) => {
          console.error("Failed to create table:", error);
        }
      );
    } else {
      let sId = "";
      if (insertdata.roomType == "single") {
        let first = Number.parseInt(String(insertdata.phoneNumber).substr(-10));
        let second = Number.parseInt(String(phoneNumber).substr(-10));
        if (first > second) {
          sId = second + "_" + first;
        } else {
          sId = first + "_" + second;
        }
      }

      tx.executeSql(
        `INSERT OR REPLACE INTO RoomSql (roomId, roomName, roomImage, roomType, archive, lastMessage, messageType, unseenMessageCount, time, lastMessageId, isUserExitedFromGroup, friendId, isNotificationAllowed, owner, sId, allow, isPublic,premium) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?,?,?, ?, ?, ?,?,?,?,?)`,
        [
          insertdata?.roomId,
          insertdata?.roomName
            ? insertdata?.roomName
            : insertdata?.phoneNumber && insertdata?.phoneNumber !== 0
            ? String(insertdata?.phoneNumber).replace(".0", "")
            : insertdata?.roomName,
          insertdata?.roomImage,
          insertdata?.roomType,
          insertdata?.isArchived ? 1 : 0,
          insertdata?.message,
          insertdata?.message_type,
          unseenCount ? unseenCount : 0,
          insertdata?.messageTime,
          insertdata?._id,
          0,
          insertdata?.friendId,
          insertdata?.isNotificationAllowed ?? 1,
          insertdata?.owner || insertdata?.fromUser,
          sId,
          insertdata?.allow ? insertdata?.allow : "public",
          insertdata?.isPublic ? insertdata?.isPublic : 0,
          insertdata?.premium ? 1 : 0,
        ],
        (tx, results) => {
          callback(results);
        },
        (error) => {
          console.error("Failed to create table:", error);
        }
      );
    }
  });
};

export const getAllPublicGroups = (callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM RoomSql WHERE isPublic = 1",
        [],
        (tx, res) => {
          const publicGroups = [];
          for (let i = 0; i < res.rows.length; i++) {
            publicGroups.push(res.rows.item(i));
          }
          callback(publicGroups);
        }
      );
    });
  } catch (error) {
    console.log("errr", error);
  }
};

export const checkMessageAlreadyExist = (messageId, callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT mId from Chatmessages WHERE mId = ?",
        [messageId],
        (tx, res) => {
          if (res.rows.length > 0) {
            callback(true);
          } else {
            callback(false);
          }
        },
        (err) => {
          console.log("errr", err);
        }
      );
    });
  } catch (error) {
    console.log("errr", error);
  }
};

export const createRoomIfNotExist = (roomId, data, callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT roomId from RoomSql WHERE roomId = ?",
        [roomId],
        (tx, res) => {
          if (res.rows.length > 0) {
            callback();
          } else {
            newMessageInsertList(data, false, globalThis.phoneNumber, 1, () => {
              callback();
            });
          }
        }
      );
    });
  } catch (error) {
    console.log("errr", error);
  }
};

export const clearChatRooms = async () => {
  db.transaction((tx) => {
    tx.executeSql(
      "DROP TABLE IF EXISTS rooms",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop table", error);
      }
    );

    tx.executeSql(
      "DROP TABLE IF EXISTS table_user",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop allChats", error);
      }
    );
    tx.executeSql(
      "DROP TABLE IF EXISTS allUsers",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop allUsers", error);
      }
    );
    tx.executeSql(
      "DROP TABLE IF EXISTS wokiibotchat",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop wokiibotchat", error);
      }
    );
    tx.executeSql(
      "DROP TABLE IF EXISTS roombackground",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop roombackground", error);
      }
    );
    tx.executeSql(
      "DROP TABLE IF EXISTS RoomSql",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop RoomSql", error);
      }
    );
    tx.executeSql(
      "DROP TABLE IF EXISTS RoomMembers",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop RoomMembers", error);
      }
    );
    tx.executeSql(
      "DROP TABLE IF EXISTS Chatmessages",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop Chatmessages", error);
      }
    );

    tx.executeSql(
      "DROP TABLE IF EXISTS PendingMessages",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop Chatmessages", error);
      }
    );

    tx.executeSql(
      "DROP TABLE IF EXISTS ContactTable",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop ContactTable", error);
      }
    );
    tx.executeSql(
      "DROP TABLE IF EXISTS blockusers",
      [],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.error("Failed to drop blockusers", error);
      }
    );
  });
};

// export const backupChatData = async () => {
//   // List of tables to backup
//   const tables = [
//     "rooms",
//     "table_user",
//     "allUsers",
//     "wokiibotchat",
//     "roombackground",
//     "RoomSql",
//     "RoomMembers",
//     "Chatmessages",
//     "PendingMessages",
//     "ContactTable",
//     "blockusers",
//   ];

//   const backup = {};

//   await db.transaction(async (tx) => {
//     for (const table of tables) {
//       const result = await new Promise((resolve, reject) => {
//         tx.executeSql(
//           `SELECT * FROM ${table}`,
//           [],
//           (tx, resultSet) => resolve(resultSet.rows._array),
//           (tx, error) => reject(error)
//         );
//       });
//       backup[table] = result;
//     }
//   });
//   console.log("backkkuppp",backup)
//   await AsyncStorage.setItem("dataBackup", JSON.stringify(backup));
// };

// export const backupChatData = async() =>{
//     const tables = [
//       "rooms",
//       "table_user",
//       "allUsers",
//       "wokiibotchat",
//       "roombackground",
//       "RoomSql",
//       "RoomMembers",
//       "Chatmessages",
//       "PendingMessages",
//       "ContactTable",
//       "blockusers",
//     ];
//   db.transaction((tx) => {
//     for()
//   })
//   }

export const backupChatData = async (tableNames, callback) => {
  const dataBackup = {};
  let remainingTables = tableNames.length;

  const processTable = (index) => {
    if (index >= tableNames.length) {
      // All tables processed
      callback(dataBackup);
      return;
    }

    const tableName = tableNames[index];

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${tableName}`,
        [],
        (tx, results) => {
          const rows = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          dataBackup[tableName] = rows;
          remainingTables -= 1;

          if (remainingTables === 0) {
            // Processed all tables
            callback(dataBackup);
          } else {
            // Process next table
            processTable(index + 1);
          }
        },
        (error) => {
          console.error(`Error fetching data from ${tableName}:`, error);
          remainingTables -= 1;

          if (remainingTables === 0) {
            // Processed all tables, including those with errors
            callback(dataBackup);
          } else {
            // Process next table
            processTable(index + 1);
          }
        }
      );
    });
  };

  processTable(0); // Start processing from the first table
};

export const insertDataIntoTables = (dataBackup) => {
  db.transaction((tx) => {
    Object.keys(dataBackup).forEach((tableName) => {
      dataBackup[tableName].forEach((row) => {
        // Adjust the column names and values based on your table schema
        const columns = Object.keys(row).join(", ");
        const values = Object.values(row);
        const placeholders = values.map(() => "?").join(", ");

        tx.executeSql(
          `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
          values,
          (tx, results) => {
            console.log(`Data inserted into ${tableName}:`, results);
          },
          (error) => {
            console.error(`Insert Error for ${tableName}:`, error);
          }
        );
      });
    });
  });
};

// isExclusive:userPremium ? true : false,
// isPaid : false
export const insertChannelInfo = (paramsOfSend, callback) => {
  console.log("params in insert channel info:", paramsOfSend);
  db.transaction((tx) => {
    try {
      let obj = { ...paramsOfSend };
     // console.log("sql obj====================================", obj);

      const unseenCount = 0;
      tx.executeSql(
        "INSERT OR REPLACE INTO ChannelInformation (owner,channelName,channelDescription,channelImage,channelType,channelLink,Subcribers,NotificationAllowed,channelId,lastMessage,lastMessageId,lastMessageType,lastMessageTime,time,unseenMessageCount,isExclusive,isPaid,isHide) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          obj.ownerId,
          obj.channelName,
          obj.channelDes,
          obj.image,
          obj.type,
          obj.link,
          obj.subs,
          obj.notifiAllow,
          obj.channelId,
          obj.lastMessage,
          obj.lastMessageId,
          obj.lastMessageType,
          obj.lastMessageTime,
          obj.time,
          unseenCount,
          obj.isExclusive,
          obj.isPaid,
          obj.isHide || 0,
        ],
        (res) => {
         // console.log("Channel Data inserted successfully.", res);
          callback(true);
        }
      );
    } catch (error) {
      console.log("errr", error);
    }
  });
};

// `SELECT *,
//               (SELECT COUNT(*)
//                FROM ChannelInformation
//                WHERE owner = ?) AS ownerCount
//        FROM ChannelInformation
//        ORDER BY lastMessageTime DESC`
// `ID INTEGER PRIMARY KEY AUTOINCREMENT,owner VARCHAR,channelName VARCHAR,channelDescription VARCHAR,channelImage STRING,channelType STRING,channelLink STRING,Subcribers INTEGER,NotificationAllowed BOOLEAN,channelId VARCHAR UNIQUE,lastMessage STRING,lastMessageId VARCHAR, lastMessageType VARCHAR, lastMessageTime VARCHAR,time VARCHAR,unseenMessageCount INTEGER,isExclusive BOOLEAN ,isPaid BOOLEAN

// id INTEGER PRIMARY KEY AUTOINCREMENT, mId VARCHAR UNIQUE,channelId VARCHAR,fromUser VARCHAR,userName VARCHAR,phoneNumber VARCHAR,message VARCHAR,message_type VARCHAR,attachment VARCHAR,parent_message VARCHAR,isForwarded INTEGER,createdAt INTEGER,updatedAt INTEGER,localPath VARCHAR DEFAULT '[]',reactions VARCHAR DEFAULT '[]'

//  DISTINCT rl.id, rl.*, ct.name AS contactName, latestMessage.message as lastMessage, latestMessage.createdAt as lastMessageTime, latestMessage.message_type as lastMessageType, latestMessage.mId as lastMessageId, latestMessage.isDeletedForAll as isLatestMessageDeleted
// `
export const getChannelInfo = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT 
        ci.*, 
        latestMessage.message as lastMessage, 
        latestMessage.createdAt as lastMessageTime, 
        latestMessage.message_type as lastMessageType,
        (SELECT COUNT(*) 
         FROM ChannelInformation 
         WHERE owner = ?) as ownerCount
      FROM 
        ChannelInformation as ci
      LEFT JOIN 
        (SELECT 
           cm.channelId, 
           cm.message, 
           cm.message_type, 
           cm.createdAt 
         FROM 
           ChannelMessages cm
         WHERE 
           cm.isDeletedForAll = 0 
           AND cm.createdAt = (
             SELECT MAX(createdAt) 
             FROM ChannelMessages 
             WHERE channelId = cm.channelId 
               AND isDeletedForAll = 0
           )
         GROUP BY 
           cm.channelId
        ) as latestMessage 
      ON 
        ci.channelId = latestMessage.channelId
      WHERE 
        ci.isHide = 0`,
      [globalThis.chatUserId], // Pass the globalThis.chatUserId as a parameter to the query
      (tx, results) => {
        const rows = results.rows;
        let channels = [];
        let count = 0;

        for (let i = 0; i < rows.length; i++) {
          channels.push({ ...rows.item(i), canJoin: false });
        }

        if (rows.length > 0) {
          count = rows.item(0).ownerCount; // Get the ownerCount from the first row
        }

        callback(channels, count); // Pass the retrieved data and count to the callback function
      },
      (tx, error) => {
        console.log("Failed to retrieve channel data:", error);
        callback([], 0); // Pass an empty array and 0 count to the callback function in case of error
      }
    );
  });
};

export const getMyChannelInfo = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * 
       FROM ChannelInformation 
       WHERE owner = ? 
       ORDER BY lastMessageTime ASC`, // Filter channels by owner ID and sort by lastMessageTime
      [globalThis.chatUserId], // Pass the globalThis.chatUserId as a parameter to the query
      (tx, results) => {
        const rows = results.rows;
        let channels = [];

        for (let i = 0; i < rows.length; i++) {
          channels.push(rows.item(i));
        }
        callback(channels); // Pass the retrieved data to the callback function
      },
      (tx, error) => {
        console.error("Failed to retrieve channel data:", error);
        callback([]); // Pass an empty array to the callback function in case of error
      }
    );
  });
};

export const getChannelInfoById = (channelId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * 
       FROM ChannelInformation 
       WHERE channelId = ?`, // Query to fetch data for the given channelId
      [channelId], // Pass the channelId as a parameter to the query
      (tx, results) => {
        const rows = results.rows;
        let channelInfo = null;

        if (rows.length > 0) {
          // Extract the first (and likely only) result
          channelInfo = rows.item(0);
        }

        console.log("Retrieved Channel Data:", channelInfo);
        callback(channelInfo); // Pass the retrieved data to the callback function
      },
      (tx, error) => {
        console.error("Failed to retrieve channel data:", error);
        callback(null); // Pass null in case of error
      }
    );
  });
};

export const checkChannelExists = (channelId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT EXISTS(SELECT 1 FROM ChannelInformation WHERE channelId = ?) AS channelExists`, // Query to check if channelId exists
      [channelId], // Pass the channelId as a parameter to the query
      (tx, results) => {
        const exists = results.rows.item(0).channelExists === 1; // Check if the result is 1 (exists) or 0 (does not exist)
        console.log(`Channel with ID ${channelId} exists: `, exists);
        callback(exists); // Pass the result to the callback function
      },
      (tx, error) => {
        console.error("Failed to check channel existence:", error);
        callback(false); // Pass false to the callback function in case of error
      }
    );
  });
};

export const updateChannelInfo = (channelId, paramsOfSend, callback) => {
  console.log("in updateChannelInfo", channelId, paramsOfSend);
  db.transaction((tx) => {
    try {
      let obj = { ...paramsOfSend };

      tx.executeSql(
        "UPDATE ChannelInformation SET owner = ?, channelName = ?, channelDescription = ?, channelImage = ?, channelType = ?, channelLink = ?, Subcribers = ?, NotificationAllowed = ?, isExclusive = ? WHERE channelId = ?",
        [
          obj.ownerId,
          obj.channelName,
          obj.channelDes,
          obj.image,
          obj.type,
          obj.link,
          obj.subs,
          obj.notifiAllow,
          obj.isExclusive,
          channelId, // Use the provided channelId for the WHERE clause
        ],
        (tx, res) => {
          if (res.rowsAffected > 0) {
            console.log("Updated Channel Information:", res.rows.item(0));
            callback(true);
          } else {
            console.log("No channel found with the given channelId.");
            callback(false);
          }
        },
        (tx, error) => {
          console.error("Failed to update channel data:", error);
          callback(false);
        }
      );
    } catch (error) {
      console.error("Update transaction error:", error);
      callback(false);
    }
  });
};

export const insertChatList = ({ paramsOfSend }) => {
  // console.log("paramsOfSend====================================", paramsOfSend);
  db.transaction((tx) => {
    try {
      let checkMid = paramsOfSend.mId;
      let obj = { ...paramsOfSend };
      if (!checkMid) {
        obj["mId"] = obj._id;
      }

      tx.executeSql(
        "SELECT COUNT(id) as count from Chatmessages WHERE mId = ?",
        [obj._id],
        (tx, res) => {
          if (res.rows.item(0).count > 0) {
            return;
          }
          let disappearMsgTime = null;
          if (obj._id) {
            disappearMsgTime = Date.now() + obj.disappearTime * 60000;
          }

          tx.executeSql(
            "SELECT localPath FROM Chatmessages WHERE mId = ?",
            [obj.mId],
            (tx, res) => {
              let localPaths = "[]";
              if (res.rows.length > 0) {
                localPaths = res.rows.item(0).localPath;
              }

              if (obj.localPath) {
                localPaths = JSON.stringify(obj.localPath);
              }

              tx.executeSql(
                "INSERT OR REPLACE INTO Chatmessages (mId,roomId,fromUser,userName, phoneNumber,message,message_type,attachment,isBroadcastMessage,isDeletedForAll,parent_message,isForwarded,storyId,isStoryRemoved,resId,broadcastMessageId,seenCount,deliveredCount,status,createdAt,updatedAt,unreadCount,shouldDisappear, disappearTime, disappearMsgTime, localPath,reactions) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                  obj?.mId,
                  obj?.roomId,
                  obj?.fromUser || "skdjfksdkfk",
                  obj?.userName || "",
                  String(obj?.currentUserPhoneNumber || obj?.phoneNumber)
                    .replace(" ", "")
                    .substr(-10),
                  obj?.message,
                  obj?.message_type,
                  JSON.stringify(obj?.attachment),
                  obj?.broadcastMessageId ? 1 : 0,
                  obj?.isDeletedForAll ? 1 : 0,
                  JSON?.stringify(obj?.parent_message),
                  obj?.isForwarded ? 1 : 0,
                  obj?.storyId || "",
                  obj?.isStoryRemoved ? 1 : 0,
                  obj?.resId,
                  obj?.broadcastMessageId || "",
                  obj?.seenCount || 0,
                  obj?.deliveredCount || 0,
                  "sent",
                  new Date(obj.createdAt || obj.messageTime).getTime(),
                  new Date(obj.updatedAt || obj.messageTime).getTime(),
                  obj?.unreadCount || 0,
                  obj?.shouldDisappear ? 1 : 0,
                  obj?.disappearTime || 0,
                  disappearMsgTime || 0,
                  localPaths,
                  JSON?.stringify(obj?.reactions) || "[]",
                ],
                (_, results) => {
                  tx.executeSql(
                    "SELECT * FROM Chatmessages WHERE id = ? ",
                    [results.insertId],
                    (tx, res2) => {}
                  );
                  if (checkMid && obj._id) {
                    tx.executeSql(
                      "UPDATE Chatmessages SET mId = ? WHERE mId = ?",
                      [obj._id, obj.mId],
                      (tx, res) => {}
                    );
                  }
                  let isupdate = 1;
                  if (obj.roomId) {
                    console.log(
                      "obj.roomId====================================",
                      obj
                    );

                    if (obj.fromUser == globalThis.userChatId) {
                      isupdate = 0;
                    }

                    tx.executeSql(
                      `UPDATE RoomSql
                   SET lastMessage = ?,
                       messageType = ?,
                       time = ?,
                       lastMessageId = ?,
                       unseenMessageCount = COALESCE(unseenMessageCount, 0) ${
                         isupdate && obj.message_type !== "notify" ? "+ 1" : ""
                       } ,
                       premium = ?
                   WHERE roomId = ?`,
                      [
                        obj.message,
                        obj.message_type,
                        new Date(obj.createdAt || obj.messageTime),
                        obj._id,
                        obj.premium,
                        obj.roomId,
                      ],
                      (tx, res) => {
                        console.log("Update successful", res);
                      },
                      (err) => {
                        console.log("Error updating RoomSql:", err);
                      }
                    );
                  }
                },
                (error) => {
                  console.error("Failed to insert data:", error);
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.log("Insert Chat List error : ", error);
    }
  });
};

// export const insertChatList = ({ paramsOfSend }) => {
//   console.log("paramsOfSend====================================", paramsOfSend);

//   db.transaction((tx) => {
//     try {
//       let checkMid = paramsOfSend.mId || paramsOfSend._id;
//       let obj = { ...paramsOfSend };

//       if (!checkMid) {
//         obj["mId"] = Math.floor(Math.random() * 9000) + 1000; // Generate a fallback ID
//       }

//       tx.executeSql(
//         "SELECT COUNT(id) as count FROM Chatmessages WHERE mId = ?",
//         [String(obj.mId)],
//         (tx, res) => {
//           if (res.rows.item(0).count > 0) {
//             console.log("Duplicate mId detected, skipping insert.");
//             // obj.mId = obj._id;

//             tx.executeSql("UPDATE Chatmessages SET mId = ? WHERE mId = ?", [obj._id, obj.mId], ()=>{
//               console.log("updated mId")
//             })

//           }
//           else {
//             let disappearMsgTime = null;
//             if (obj.disappearTime) {
//               disappearMsgTime = Date.now() + obj.disappearTime * 60000;
//             }

//             tx.executeSql(
//               "INSERT OR REPLACE INTO Chatmessages " +
//                 "(mId, roomId, fromUser, userName, phoneNumber, message, message_type, attachment, isBroadcastMessage, " +
//                 "isDeletedForAll, parent_message, isForwarded, storyId, isStoryRemoved, resId, broadcastMessageId, " +
//                 "seenCount, deliveredCount, status, createdAt, updatedAt, unreadCount, shouldDisappear, disappearTime, " +
//                 "disappearMsgTime, localPath, reactions) " +
//                 "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//               [
//                 obj.mId,
//                 obj.roomId,
//                 obj.fromUser || "unknownUser",
//                 obj.userName || "Unknown",
//                 String(obj.phoneNumber || obj.currentUserPhoneNumber)
//                   .replace(" ", "")
//                   .substr(-10),
//                 obj.message,
//                 obj.message_type,
//                 JSON.stringify(obj.attachment || []),
//                 obj.isBroadcastMessage ? 1 : 0,
//                 obj.isDeletedForAll ? 1 : 0,
//                 JSON.stringify(obj.parent_message || {}),
//                 obj.isForwarded ? 1 : 0,
//                 obj.storyId || "",
//                 obj.isStoryRemoved ? 1 : 0,
//                 obj.resId,
//                 obj.broadcastMessageId || "",
//                 obj.seenCount || 0,
//                 obj.deliveredCount || 0,
//                 "sent",
//                 new Date(obj.createdAt || Date.now()).getTime(),
//                 new Date(obj.updatedAt || Date.now()).getTime(),
//                 obj.unreadCount || 0,
//                 obj.shouldDisappear ? 1 : 0,
//                 obj.disappearTime || 0,
//                 disappearMsgTime || 0,
//                 obj.localPath || "[]",
//                 JSON.stringify(obj.reactions || []),
//               ],
//               (_, results) => {
//                 console.log("Insert successful, ID:", results.insertId);
//                 getChats(obj.roomId)

//                 if (obj.roomId) {
//                   let isUpdate = obj.fromUser !== globalThis.userChatId;
//                   tx.executeSql(
//                     `UPDATE RoomSql
//                      SET lastMessage = ?,
//                          messageType = ?,
//                          time = ?,
//                          lastMessageId = ?,
//                          unseenMessageCount = COALESCE(unseenMessageCount, 0) ${
//                            isUpdate && obj.message_type !== "notify" ? "+ 1" : ""
//                          }
//                      WHERE roomId = ?`,
//                     [
//                       obj.message,
//                       obj.message_type,
//                       new Date(obj.createdAt || Date.now()).getTime(),
//                       obj.mId,
//                       obj.roomId,
//                     ],
//                     (tx, res) => {
//                       console.log("RoomSql update successful");
//                     },
//                     (err) => {
//                       console.error("RoomSql update error:", err);
//                     }
//                   );
//                 }
//               },
//               (error) => {
//                 console.error("Failed to insert Chatmessages:", error);
//               }
//             );
//           }

//         },
//         (error) => {
//           console.error("Failed to execute SELECT query:", error);
//         }
//       );
//     } catch (error) {
//       console.error("Insert Chat List error:", error);
//     }
//   });
// };

export const updateMessageAndChannelInfo = (mId, updates, callback) => {
  const { newMId, newAttachment, newLastMessageType } = updates;

  db.transaction((tx) => {
    // Step 1: Find the row in ChannelMessages where mId matches
    tx.executeSql(
      "SELECT * FROM ChannelMessages WHERE mId = ?",
      [mId],
      (tx, res) => {
        if (res.rows.length > 0) {
          // Step 2: Update the ChannelMessages table with new mId and attachment
          const query1 = `
            UPDATE ChannelMessages 
            SET mId = ?, attachment = ?
            WHERE mId = ?
          `;
          const values1 = [
            newMId || mId,
            JSON.stringify(newAttachment || res.rows.item(0).attachment),
            mId,
          ];

          tx.executeSql(query1, values1, (tx, res) => {
            if (res.rowsAffected > 0) {
              // Step 3: Update the ChannelInformation table where lastMessageId matches the original mId
              const query2 = `
                UPDATE ChannelInformation 
                SET lastMessageId = ?, lastMessageType = ?
                WHERE lastMessageId = ?
              `;
              const values2 = [newMId || mId, newLastMessageType, mId];

              tx.executeSql(query2, values2, (tx, res) => {
                if (res.rowsAffected > 0) {
                  callback(true); // Both updates were successful
                } else {
                  callback(false); // Failed to update ChannelInformation
                }
              });
            } else {
              callback(false); // Failed to update ChannelMessages
            }
          });
        } else {
          callback(false); // No matching mId found in ChannelMessages
        }
      }
    );
  });
};

//insert-channel-list
export const insertChannelList = (paramsOfSend, callback) => {
  console.log("STEP 1 TO INSERT CHANNEL LIST", paramsOfSend);
  db.transaction((tx) => {
    try {
      console.log("in try", paramsOfSend);
      let checkMid = paramsOfSend.mId;
      let obj = { ...paramsOfSend };
      const id = obj.mId || obj.lastMessageId;
      if (!checkMid) {
        obj["mId"] = id;
      }
      console.log("STEP 2 TO INSERT CHANNEL LIST");
      tx.executeSql(
        "SELECT COUNT(id) as count FROM ChannelMessages WHERE mId = ?",
        [id],
        (tx, res) => {
          if (res.rows.item(0).count > 0) {
            return;
          }

          let attachments = "[]";

          if (obj.attachment) {
            attachments = JSON.stringify(obj.attachment);
          }
          console.log(
            "STEP 3 TO INSERT CHANNEL LIST",
            obj?.mId || obj.lastMessageId,
            obj?.channelId,
            obj?.fromUser || "skdjfksdkfk",
            obj?.userName || "",
            String(obj?.currentUserPhoneNumber || obj?.phoneNumber)
              .replace(" ", "")
              .substr(-10),
            obj?.message,
            obj?.message_type || obj?.lastMessageType,
            attachments,
            JSON?.stringify(obj?.parent_message),
            obj?.isForwarded ? 1 : 0,
            obj.createdAt || obj.lastMessageTime,
            new Date(obj.updatedAt || obj.lastMessageTime).getTime()
            // localPaths,
          );

          tx.executeSql(
            "SELECT localPath FROM ChannelMessages WHERE mId = ?",
            [id],
            (tx, res) => {
              console.log("STEP 4 TO INSERT CHANNEL LIST", obj.localPath);
              let localPaths = "[]";
              if (res.rows.length > 0) {
                localPaths = res.rows.item(0).localPath;
              }

              if (obj.localPath) {
                localPaths = JSON.stringify(obj.localPath);
              }

              // let attachments = "[]";

              // if (obj.attachment) {
              //   attachments = JSON.stringify(obj.attachment);
              // }

              console.log(
                "aallll",
                obj?.mId || obj.lastMessageId,
                obj?.channelId,
                obj?.fromUser || "skdjfksdkfk",
                obj?.userName || "",
                String(obj?.currentUserPhoneNumber || obj?.phoneNumber)
                  .replace(" ", "")
                  .substr(-10),
                obj?.message,
                obj?.message_type || obj?.lastMessageType,
                attachments,
                JSON?.stringify(obj?.parent_message),
                obj?.isForwarded ? 1 : 0,
                obj.createdAt || obj.lastMessageTime,
                new Date(obj.updatedAt || obj.lastMessageTime).getTime(),
                localPaths,
                obj.isDeletedForAll
              );

              tx.executeSql(
                "INSERT OR REPLACE INTO ChannelMessages (mId,channelId,fromUser,userName,phoneNumber,message,message_type,attachment,parent_message,isForwarded,createdAt,updatedAt,localPath,isDeletedForAll) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                  obj?.mId || obj.lastMessageId,
                  obj?.channelId,
                  obj?.fromUser || "skdjfksdkfk",
                  obj?.userName || "",
                  String(obj?.currentUserPhoneNumber || obj?.phoneNumber)
                    .replace(" ", "")
                    .substr(-10),
                  obj?.message,
                  obj?.message_type || obj?.lastMessageType,
                  attachments,
                  JSON?.stringify(obj?.parent_message),
                  obj?.isForwarded ? 1 : 0,
                  obj.createdAt || obj.lastMessageTime,
                  new Date(obj.updatedAt || obj.lastMessageTime).getTime(),
                  localPaths,
                  obj.isDeletedForAll,
                ],
                (_, results) => {
                  // if (checkMid && obj.lastMessageId) {
                  //   console.log("STEP 6 TO INSERT CHANNEL LIST");
                  //   // tx.executeSql(
                  //   //   "UPDATE ChannelMessages SET mId = ? WHERE mId = ?",
                  //   //   [obj.lastMessageId, obj.mId],
                  //   //   (tx, res) => {}
                  //   // );
                  // }
                  let isupdate = 1;
                  if (obj.channelId) {
                    console.log("first if of sqlite");
                    if (
                      obj.fromUser == globalThis.userChatId ||
                      globalThis.isChannelDetailOpen == "yes"
                    ) {
                      console.log("second if of sqlite");
                      isupdate = 0;
                    }
                    console.log("STEP 6 TO INSERT CHANNEL LIST", obj.channelId);

                    tx.executeSql(
                      "SELECT COUNT(*) as count FROM ChannelInformation WHERE channelId = ?",
                      [obj.channelId],
                      (tx, res) => {
                        console.log("in if ");
                        console.log(
                          "STEP 7 TO INSERT CHANNEL LIST",
                          typeof res.rows.item(0).count
                        );
                        const msgType =
                          obj?.message_type || obj?.lastMessageType;
                        if (res.rows.item(0).count > 0) {
                          console.log(
                            "IF IT AS CHANNEL iD",
                            obj.message,
                            obj.lastMessageType || obj.message_type,
                            new Date(
                              obj.lastMessageTime || obj.updatedAt
                            ).getTime(),
                            obj.time || new Date().getTime(),
                            obj.lastMessageId || obj.mId,
                            obj.channelId
                          );
                          // ChannelId exists, perform an update
                          tx.executeSql(
                            `UPDATE ChannelInformation 
                               SET lastMessage = ?, 
                                   lastMessageType = ?, 
                                   lastMessageTime = ?,
                                   time = ?, 
                                   lastMessageId = ?, 
                                   unseenMessageCount = COALESCE(unseenMessageCount, 0) ${
                                     isupdate && msgType != "notify"
                                       ? "+ 1"
                                       : ""
                                   } 
                               WHERE channelId = ?`,
                            [
                              obj.message,
                              obj.lastMessageType || obj.message_type,
                              new Date(
                                obj.lastMessageTime || obj.updatedAt
                              ).getTime(),
                              obj.time || new Date().getTime(),
                              obj.lastMessageId || obj.mId,
                              obj.channelId,
                            ],
                            (tx, res) => {
                              callback(true);
                              console.log("Update successful");
                            },
                            (err) => {
                              callback(false);
                              console.log(
                                "Error updating ChannelInformation:",
                                err
                              );
                            }
                          );
                        } else {
                          console.log("in else ");
                          // ChannelId does not exist, perform an insert
                          tx.executeSql(
                            `INSERT OR REPLACE INTO ChannelInformation 
                              (owner, channelName, channelDescription, channelImage, channelType, channelLink, 
                               Subcribers, NotificationAllowed, channelId, lastMessage, lastMessageId, 
                               lastMessageType, lastMessageTime, time, unseenMessageCount ,isExclusive,isPaid,isHide) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?)`,
                            [
                              obj.fromUser,
                              obj.channelName,
                              obj.channelDescription,
                              obj.channelImage,
                              obj.channelType,
                              obj.channelLink,
                              obj.subscribers,
                              obj.NotificationAllowed,
                              obj.channelId,
                              obj.message,
                              obj.mId || obj.lastMessageId,
                              obj?.message_type || obj?.lastMessageType,
                              new Date(
                                obj.lastMessageTime || obj.updatedAt
                              ).getTime(),
                              obj.time || new Date().getTime(),
                              (isupdate && obj?.message_type) ||
                              obj?.lastMessageType !== "notify"
                                ? 1
                                : 0, // Initial unseenMessageCount
                              obj.isExclusive,
                              obj.isPaid,
                              obj.isHide,
                            ],
                            (tx, res) => {
                              callback(true);
                              console.log("Insert successful");
                            },
                            (err) => {
                              callback(false);
                              console.log(
                                "Error inserting into ChannelInformation:",
                                err
                              );
                            }
                          );
                        }
                      },
                      (err) => {
                        callback(false);
                        console.log("Error checking ChannelInformation:", err);
                      }
                    );
                  }
                },
                (error) => {
                  console.error("Failed to insert data:", error);
                }
              );
            },
            (tx, error) => {
              console.log("Error in SELECT localpath query:", error);
            }
          );
        },
        (tx, error) => {
          console.log("Error in SELECT COUNT(id) query:", error);
        }
      );
    } catch (error) {
      console.log("Insert Chat List error : ", error);
    }
  });
};

export const insertChannelMessage = (msgObj, callback) => {
  try {
    db.transaction((tx) => {
      // Initialize variables
      let localPaths = "[]";
      let attachments = "[]";
      let reactions = "[]";

      // Prepare data
      if (msgObj.attachment) {
        attachments = JSON.stringify(msgObj.attachment);
      }
      if (msgObj.reactions) {
        reactions = JSON.stringify(msgObj.reactions.reactions);
      }

      //console.log("Reactions >>>>>>>>>!>!>>!>!>!>>", reactions);

      // Debugging output
      // console.log("msgObj:", msgObj);

      // Check if message already exists
      tx.executeSql(
        "SELECT localPath FROM ChannelMessages WHERE mId = ?",
        [msgObj?.mId || msgObj.lastMessageId],
        (tx, res) => {
          if (res.rows.length > 0) {
            localPaths = res.rows.item(0).localPath;
          }

          // Handle localPath
          if (msgObj.localPath) {
            localPaths = JSON.stringify(msgObj.localPath);
          }

          // Insert or replace into database
          tx.executeSql(
            "INSERT OR REPLACE INTO ChannelMessages (mId, channelId, fromUser, userName, phoneNumber, message, message_type, attachment, parent_message, isForwarded, createdAt, updatedAt, localPath, reactions,isDeletedForAll) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
              msgObj?.mId || msgObj.lastMessageId,
              msgObj?.channelId,
              msgObj?.fromUser || "skdjfksdkfk",
              msgObj?.userName || "",
              msgObj?.currentUserPhoneNumber || "",
              msgObj?.message,
              msgObj?.lastMessageType,
              attachments,
              JSON.stringify(msgObj?.parent_message || {}),
              msgObj?.isForwarded ? 1 : 0,
              new Date(msgObj.createdAt || Date.now()).getTime(),
              new Date(msgObj.updatedAt || Date.now()).getTime(),
              localPaths,
              reactions,
              msgObj?.isDeletedForAll,
            ],
            (_, results) => {
              // console.log("Insert/Replace result:", results);
              callback(true);
            },
            (_, error) => {
              console.error("Insert/Replace error:", error);
              callback(false);
            }
          );
        },
        (_, error) => {
          console.error("Select error:", error);
          callback(false);
        }
      );
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    callback(false);
  }
};

export const insertChannelMessagesAll = (msgObjs, ownername, callback) => {
  console.log("msgObjsmsgObjs", msgObjs);
  try {
    db.transaction(
      (tx) => {
        let errorOccurred = false;

        // Map over the messages array
        const messageInserts = msgObjs.map((msgObj) => {
          return new Promise((resolve, reject) => {
            let localPaths = "[]";
            let attachments = "[]";
            let reactions = "[]";

            // Prepare data
            if (msgObj.attachment) {
              attachments = JSON.stringify(msgObj.attachment);
            }
            if (msgObj.reactions) {
              reactions = JSON.stringify(msgObj.reactions.reactions);
            }

            // Debugging output
            // console.log("Inserting msgObj:", msgObj);

            // Check if message already exists
            tx.executeSql(
              "SELECT localPath FROM ChannelMessages WHERE mId = ?",
              [msgObj?.mId || msgObj.lastMessageId],
              (tx, res) => {
                if (res.rows.length > 0) {
                  localPaths = res.rows.item(0).localPath;
                }

                // Handle localPath
                if (msgObj.localPath) {
                  localPaths = JSON.stringify(msgObj.localPath);
                }

                // Insert or replace into database
                tx.executeSql(
                  "INSERT OR REPLACE INTO ChannelMessages (mId, channelId, fromUser, userName, phoneNumber, message, message_type, attachment, parent_message, isForwarded, createdAt, updatedAt, localPath, reactions,isDeletedForAll) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                  [
                    msgObj?._id,
                    msgObj?.channelId,
                    ownername,
                    msgObj?.userName || "",
                    msgObj?.currentUserPhoneNumber || "",
                    msgObj?.message,
                    msgObj?.message_type,
                    attachments,
                    JSON.stringify(msgObj?.parent_message || {}),
                    msgObj?.isForwarded ? 1 : 0,
                    new Date(msgObj.createdAt || Date.now()).getTime(),
                    new Date(msgObj.updatedAt || Date.now()).getTime(),
                    localPaths,
                    reactions,
                    msgObj?.isDeletedForAll,
                  ],
                  (_, results) => {
                    // console.log("Insert/Replace result:", results);
                    resolve();
                  },
                  (_, error) => {
                    console.error("Insert/Replace error:", error);
                    errorOccurred = true;
                    reject(error);
                  }
                );
              },
              (_, error) => {
                console.error("Select error:", error);
                errorOccurred = true;
                reject(error);
              }
            );
          });
        });

        // Wait for all promises to resolve
        Promise.all(messageInserts)
          .then(() => {
            if (!errorOccurred) {
              callback(true);
            } else {
              callback(false);
            }
          })
          .catch((error) => {
            console.error("Transaction error:", error);
            callback(false);
          });
      },
      (err) => {
        console.error("Transaction error:", err);
        callback(false);
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    callback(false);
  }
};

export const updateMessage = async (data, status) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM Chatmessages WHERE mId = ?`,
      [data?.result?.mId || data?.mId],
      (_, result) => {
        if (result.rows.length > 0) {
          tx.executeSql(
            "UPDATE Chatmessages SET status= ?, roomId = ?, mId = ? WHERE mId = ?",
            [status, data?.roomId, data?._id, data?.mId],
            () => {
              console.log("");
            },
            (error) => {
              console.log("", error);
            }
          );
        }
      }
    );
  });
};

export const updateMessagebyId = async (data, status) => {
  await db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM table_user WHERE resId = ?`,
      [data?.result?.resId || data?.resId],
      (_, result) => {
        if (result.rows.length > 0) {
          tx.executeSql(
            "UPDATE table_user SET status = ? WHERE message_id = ?",
            [status, data?._id],
            () => {
              console.log("");
            },
            (error) => {
              console.log("", error);
            }
          );
        }
      }
    );
  });
};

export const getAllChatTableData = async (
  tablename,
  roomId,
  skip,
  page,
  roomType,
  callback
) => {
  console.log("roomId sql====================================", roomId);

  let pageNumber = page ? page : 0;
  let paginationString = "";
  paginationString += pageNumber ? ` LIMIT ${pageNumber}` : "";
  paginationString += skip ? ` OFFSET ${skip}` : "";

  db.transaction((tx) => {
    // Create the indexes for optimization if they don't exist

    // code added by Puru

    tx.executeSql(
      "CREATE INDEX IF NOT EXISTS idx_roomId ON Chatmessages(roomId)",
      [],
      () => {
        console.log("");
      },
      (error) => {
        console.error("Failed to create index on roomId:", error);
      }
    );

    tx.executeSql(
      "CREATE INDEX IF NOT EXISTS idx_createdAt ON Chatmessages(createdAt)",
      [],
      () => {
        console.log("");
      },
      (error) => {
        console.error("Failed to create index on createdAt:", error);
      }
    );

    tx.executeSql(
      `SELECT DISTINCT  cm.*, COALESCE(rm.roomId, cm.roomId) as roomId, ct.name as contactName, ct.phone_number as contactPhoneNumber
FROM Chatmessages as cm
LEFT JOIN ContactTable as ct
ON substr(replace(cm.phoneNumber, '.0', ''), -10) = substr(replace(ct.phone_number, '.0', ''), -10)
LEFT JOIN RoomMembers as rm
ON rm.userId = cm.fromUser AND rm.roomId = cm.roomId
WHERE cm.roomId = ? GROUP BY cm.id
ORDER BY cm.createdAt DESC ${paginationString}`,
      [roomId],
      (tx, results) => {
        try {
          let temp = [];
          let disapperIds = [];
          for (let i = 0; i < results.rows.length; ++i) {
            try {
              let finalStatus = "sent";
              let localPaths = [];
              if (results?.rows?.item(i)?.localPath.length > 2) {
                localPaths = JSON.parse(results.rows.item(i).localPath);
              }

              console.log(
                "results.rows.item(i)====================================",
                results.rows.item(i)
              );

              // decryptMessage(newroomID, data?.result?.message),
              // const decryptedMessage = CryptoJS.AES.decrypt(
              //   results.rows.item(i).message,
              //   EncryptionKey
              // ).toString(CryptoJS.enc.Utf8);

              const decryptedMessage = decryptMessage(
                results.rows.item(i).roomId,
                results.rows.item(i).message
              );

              let attach = [];
              if (
                results.rows.item(i).message_type == "location" &&
                JSON.parse(results.rows.item(i).attachment).length
              ) {
                attach.push(
                  JSON.parse(JSON.parse(results.rows.item(i).attachment)[0])
                );
              } else if (
                results?.rows?.item(i)?.message_type == "contact" ||
                (results?.rows?.item(i)?.message_type == "story" &&
                  JSON.parse(results?.rows?.item(i).attachment).length)
              ) {
                attach.push(
                  JSON.parse(JSON.parse(results.rows.item(i).attachment)[0])
                );
              } else {
                attach = JSON.parse(results.rows.item(i).attachment);
              }

              let parentMessage = results.rows.item(i).parent_message
                ? JSON.parse(results.rows.item(i).parent_message)
                : {};
              if (
                parentMessage.message_type === "location" ||
                parentMessage.message_type === "contact" ||
                (parentMessage.message_type === "story" &&
                  parentMessage.attachment)
              ) {
                parentMessage.attachment[0] = JSON.parse(
                  parentMessage.attachment[0]
                );
              }
              const finalMessage = {
                system:
                  results.rows.item(i).message_type == "notify" ||
                  results.rows.item(i).message_type == "broadcast_notify"
                    ? true
                    : false,
                _id: results.rows.item(i).mId,
                unreadCount: results.rows.item(i).unreadCount,
                messageId: results.rows.item(i).mId, // Generate a unique ID based on the current length of messages
                text: decryptedMessage,
                resId: results.rows.item(i).resId,
                messageType: results.rows.item(i).message_type,
                createdAt: new Date(results.rows.item(i).createdAt).getTime(),
                status: finalStatus,
                attachment: attach,
                localPaths: localPaths,
                storyId: results.rows.item(i).storyId,
                image:
                  results.rows.item(i).messageType == "image"
                    ? localPaths || attach
                    : [],
                video:
                  results.rows.item(i).messageType == "video"
                    ? localPaths || attach
                    : [],
                audio:
                  results.rows.item(i).messageType == "audio"
                    ? localPaths || attach
                    : [],
                isForwarded:
                  results.rows.item(i).isForwarded == "0" ? false : true,
                isDeletedForAll:
                  results.rows.item(i).isDeletedForAll == "0" ? false : true,
                parent_message: parentMessage,
                shouldDisappear: results.rows.item(i).shouldDisappear,
                disappearTime: results.rows.item(i).disappearTime,
                disappearMsgTime: results.rows.item(i).disappearMsgTime,
                user: {
                  _id:
                    results.rows.item(i).message_type == "notify" ||
                    results.rows.item(i).message_type == "broadcast_notify"
                      ? results.rows.item(i).id
                      : results.rows.item(i).fromUser,
                  name:
                    roomType == "single" ? "" : results.rows.item(i).userName,
                  phone_number:
                    results.rows.item(i).contactPhoneNumber ||
                    results.rows.item(i).phoneNumber,
                  avatar:
                    results.rows.item(i).image ||
                    "https://tokeecorp.com/backend/public/images/user-avatar.png",
                },
                reactions: JSON.parse(results.rows.item(i).reactions || "[]"),
              };
              if (results.rows.item(i).shouldDisappear == 1) {
                if (results.rows.item(i).disappearMsgTime) {
                  if (results.rows.item(i).disappearMsgTime < Date.now()) {
                    disapperIds.push(results.rows.item(i).mId);
                    continue;
                  } else {
                    temp.push(finalMessage);
                  }
                } else {
                  let Time =
                    new Date(results.rows.item(i).createdAt).getTime() +
                    results.rows.item(i).disappearTime * 60000;
                  tx.executeSql(
                    "UPDATE Chatmessages SET disappearMsgTime = ? WHERE id = ?",
                    [Time, results.rows.item(i).id]
                  );
                  finalMessage["disappearMsgTime"] = Time;
                  temp.push(finalMessage);
                  //update disapper time with addone in current time
                }
              } else {
                temp.push(finalMessage);
              }
            } catch (error) {
              console.log("message have error : ", error);
            }
          }
          callback({ temp, disapperIds });
        } catch (error) {
          console.log("getAllChatTableData error : ", error);
        }
      },

      (error) => {
        console.error("Error fetching data:", error);
        callback([]);
      }
    );
  });
};

export const getAllMembersData = async (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM allUsers`,
      [],
      (_, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        callback(temp);
      },
      (error) => {
        console.error("Error fetching data:", error);
        callback([]); // Handle errors by passing an empty array or specific error indicator
      }
    );
  });
};

export const createTableUser = async () => {
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS RoomSql (id INTEGER PRIMARY KEY AUTOINCREMENT, roomId VARCHAR UNIQUE, roomName VARCHAR, aliasName VARCHAR, aliasImage VARCHAR, roomImage VARCHAR, roomType VARCHAR, archive INTEGER, lastMessage VARCHAR, messageType VARCHAR, unseenMessageCount INTEGER DEFAULT 0, time VARCHAR, lastMessageId VARCHAR, isUserExitedFromGroup INTEGER, friendId VARCHAR, isNotificationAllowed INTEGER, owner VARCHAR, sId VARCHAR, allow VARCHAR DEFAULT 'public', isLock INTEGER DEFAULT 0, isPublic BOOLEAN DEFAULT 0, isHide INTEGER DEFAULT 0, isChatListDelete INTEGER DEFAULT 0, ispin INTEGER DEFAULT 0, premium BOOLEAN, isDiamonds BOOLEAN)",
      [],
      (tx) => {
        // Table created successfully, now create indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_roomId ON RoomSql(roomId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on roomId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_lastMessageId ON RoomSql(lastMessageId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on lastMessageId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_friendId ON RoomSql(friendId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on friendId:", error);
          }
        );

        // Add more indexes as necessary based on your query patterns
      },
      (error) => {
        console.error("Failed to create RoomSql table:", error);
      }
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Chatmessages (id INTEGER PRIMARY KEY AUTOINCREMENT, mId VARCHAR UNIQUE, roomId VARCHAR, fromUser VARCHAR, userName VARCHAR, phoneNumber VARCHAR, message VARCHAR, message_type VARCHAR, attachment VARCHAR, isBroadcastMessage INTEGER, isDeletedForAll INTEGER, parent_message VARCHAR, isForwarded INTEGER, storyId INTEGER, isStoryRemoved INTEGER, resId INTEGER, broadcastMessageId VARCHAR, seenCount INTEGER, deliveredCount INTEGER, unreadCount INTEGER DEFAULT 0, status VARCHAR DEFAULT '', createdAt INTEGER, updatedAt INTEGER, shouldDisappear INTEGER DEFAULT 0, disappearTime INTEGER DEFAULT NULL, disappearMsgTime INTEGER DEFAULT NULL, localPath VARCHAR DEFAULT '[]',reactions VARCHAR DEFAULT '[]')",
      [],
      (tx) => {
        // Table created successfully, now create indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_roomId ON Chatmessages(roomId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on roomId:", error);
          }
        );
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_mId ON Chatmessages(mId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on mId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_fromUser ON Chatmessages(fromUser)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on fromUser:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_createdAt ON Chatmessages(createdAt)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on createdAt:", error);
          }
        );

        // Add more indexes as necessary
      },
      (error) => {
        console.error("Failed to create Chatmessages table:", error);
      }
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS PendingMessages (id INTEGER PRIMARY KEY AUTOINCREMENT, mId VARCHAR, roomId VARCHAR, fromUser VARCHAR, message VARCHAR, message_type VARCHAR, attachment VARCHAR, isBroadcastMessage INTEGER, isDeletedForAll INTEGER, parent_message VARCHAR, isForwarded INTEGER, storyId INTEGER, isStoryRemoved INTEGER, resId INTEGER, broadcastMessageId VARCHAR, seenCount INTEGER, deliveredCount INTEGER, createdAt INTEGER, updatedAt INTEGER)",
      [],
      (tx) => {
        // Table created successfully, now create indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_roomId ON PendingMessages(roomId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on roomId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_fromUser ON PendingMessages(fromUser)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on fromUser:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_createdAt ON PendingMessages(createdAt)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on createdAt:", error);
          }
        );

        // Add more indexes as necessary based on your query patterns
      },
      (error) => {
        console.error("Failed to create table: PendingMessages", error);
      }
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS RoomMembers (member_id INTEGER PRIMARY KEY AUTOINCREMENT, mongoId VARCHAR UNIQUE, userId VARCHAR, name VARCHAR, image VARCHAR, phone_number VARCHAR, roomId VARCHAR, isAdmin BOOLEAN, joinedOn INTEGER, premium BOOLEAN, isDiamonds BOOLEAN)",
      [],
      (tx) => {
        // Create indexes for optimization
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_userId ON RoomMembers(userId)",
          [],
          null,
          (error) => {
            console.error("Failed to create index on userId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_roomId ON RoomMembers(roomId)",
          [],
          null,
          (error) => {
            console.error("Failed to create index on roomId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_phone_number ON RoomMembers(phone_number)",
          [],
          null,
          (error) => {
            console.error("Failed to create index on phone_number:", error);
          }
        );

        // Additional indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_isAdmin ON RoomMembers(isAdmin)",
          [],
          null,
          (error) => {
            console.error("Failed to create index on isAdmin:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_joinedOn ON RoomMembers(joinedOn)",
          [],
          null,
          (error) => {
            console.error("Failed to create index on joinedOn:", error);
          }
        );
      },
      (error) => {
        console.error("Failed to create table:", error);
      }
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS ContactTable (cid INTEGER PRIMARY KEY AUTOINCREMENT, phone_number VARCHAR UNIQUE, name VARCHAR)",
      [],
      (tx) => {
        // Table created successfully, now create indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_phone_number ON ContactTable(phone_number)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on phone_number:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_name ON ContactTable(name)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on name:", error);
          }
        );
      },
      (error) => {
        console.error("Failed to create table: ContactTable", error);
      }
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY AUTOINCREMENT,roomId VARCHAR, roomName VARCHAR,roomImage VARCHAR, roomType VARCHAR,archive INTEGER,lastMessage VARCHAR,messageType VARCHAR,unseenMessageCount INTEGER,time VARCHAR,lastMessageId VARCHAR,isUserExitedFromGroup INTEGER,friendId VARCHAR,isNotificationAllowed INTEGER)",
      [],
      () => {
        console.log("");
      },
      (error) => {
        console.error("Failed to create Table chat list:", error);
      }
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS table_user (user_id INTEGER PRIMARY KEY AUTOINCREMENT, resId BIGINT, userName VARCHAR, userImage VARCHAR, roomId VARCHAR, roomName VARCHAR, roomImage VARCHAR, roomType VARCHAR, roomOwnerId VARCHAR, roomMembers VARCHAR, parent_message_id VARCHAR, parent_message VARCHAR, message_type VARCHAR, attachment TEXT, isNotificationAllowed INTEGER, archive INTEGER, fromUser VARCHAR, createdAt VARCHAR, deletedFor INTEGER, deliveredCount VARCHAR, isBroadcastMessage INTEGER, isDeletedForAll INTEGER, isForwarded INTEGER, message TEXT, seenCount INTEGER, status VARCHAR, updatedAt VARCHAR, messageTime VARCHAR, lastMessage VARCHAR, broadcastMessageId VARCHAR, seenBy VARCHAR, isUserExitedFromGroup INTEGER, time VARCHAR, undeliveredMessageCount VARCHAR, unseenMessageCount INTEGER, message_id VARCHAR, friendId VARCHAR)",
      [],
      (tx) => {
        // Table created successfully, now create indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_roomId ON table_user(roomId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on roomId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_userName ON table_user(userName)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on userName:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_friendId ON table_user(friendId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on friendId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_createdAt ON table_user(createdAt)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on createdAt:", error);
          }
        );

        // Add more indexes as necessary based on your query patterns
      },
      (error) => {
        console.error("Failed to create table:", error);
      }
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS allUsers (user_id INTEGER PRIMARY KEY AUTOINCREMENT,_id VARCHAR,name VARCHAR,phone_number VARCHAR)", // Define your table schema here
      [],
      () => {
        console.log("");
      },
      (error) => {
        console.error("Failed to create table:", error);
      }
    );

    //by-dinki
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS ChannelInformation (ID INTEGER PRIMARY KEY AUTOINCREMENT,owner VARCHAR,channelName VARCHAR,channelDescription VARCHAR,channelImage STRING,channelType STRING,channelLink STRING,Subcribers INTEGER,NotificationAllowed BOOLEAN,channelId VARCHAR UNIQUE,lastMessage STRING,lastMessageId VARCHAR, lastMessageType VARCHAR, lastMessageTime VARCHAR,time VARCHAR,unseenMessageCount INTEGER,isExclusive BOOLEAN ,isPaid BOOLEAN,isHide INTEGER DEFAULT 0)", // Define your table schema here
      [],
      () => {
        console.log("Channel table created successfully.");
      },
      (error) => {
        console.error("Failed to create channel table:", error);
      }
    );

    //by-piyush
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS ChannelRoomMembers (member_id INTEGER PRIMARY KEY AUTOINCREMENT, mongoId VARCHAR UNIQUE, userId VARCHAR, name VARCHAR, image VARCHAR, channelId VARCHAR,joinedOn INTEGER, premium BOOLEAN)",
      [],
      (tx) => {
        // Create indexes for optimization
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_userId ON ChannelRoomMembers(userId)",
          [],
          null,
          (error) => {
            console.error("Failed to create index on userId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_channelId ON ChannelRoomMembers(channelId)",
          [],
          null,
          (error) => {
            console.error("Failed to create index on channelId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_joinedOn ON ChannelRoomMembers(joinedOn)",
          [],
          null,
          (error) => {
            console.error("Failed to create index on joinedOn:", error);
          }
        );
      },
      (error) => {
        console.error("Failed to create table:", error);
      }
    );

    //by-dinki
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS ChannelMessages (id INTEGER PRIMARY KEY AUTOINCREMENT, mId VARCHAR UNIQUE,channelId VARCHAR,fromUser VARCHAR,userName VARCHAR,phoneNumber VARCHAR,message VARCHAR,message_type VARCHAR,attachment VARCHAR,parent_message VARCHAR,isForwarded INTEGER,createdAt INTEGER,updatedAt INTEGER,localPath VARCHAR DEFAULT '[]',reactions VARCHAR DEFAULT '[]',isDeletedForAll INTEGER)", // Define your table schema here
      [],
      () => {
        console.log("Channel messages table created successfully.");
      },
      (error) => {
        console.error("Failed to create channel table:", error);
      }
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS wokiibotchat (user_id INTEGER PRIMARY KEY AUTOINCREMENT, resId VARCHAR, content VARCHAR, user VARCHAR)",
      [],
      (tx) => {
        // Table created successfully, now create indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_resId ON wokiibotchat(resId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on resId:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_user ON wokiibotchat(user)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on user:", error);
          }
        );

        // Add more indexes as necessary based on your query patterns
      },
      (error) => {
        console.error("Failed to create table: wokiibotchat", error);
      }
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS roombackground (id INTEGER PRIMARY KEY AUTOINCREMENT, roomId VARCHAR, image VARCHAR)",
      [],
      (tx) => {
        // Table created successfully, now create indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_roomId ON roombackground(roomId)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on roomId:", error);
          }
        );

        // Add more indexes as necessary based on your query patterns
      },
      (error) => {
        console.error("Failed to create table: roombackground", error);
      }
    );

    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS blockusers (id INTEGER PRIMARY KEY AUTOINCREMENT, fromuser VARCHAR, touser VARCHAR)",
      [],
      (tx) => {
        // Table created successfully, now create indexes
        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_fromuser ON blockusers(fromuser)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on fromuser:", error);
          }
        );

        tx.executeSql(
          "CREATE INDEX IF NOT EXISTS idx_touser ON blockusers(touser)",
          [],
          () => {
            console.log("");
          },
          (error) => {
            console.error("Failed to create index on touser:", error);
          }
        );
      },
      (error) => {
        console.error("Failed to create table: blockusers", error);
      }
    );
  });
};

export const updateroombackground = (roomId, imageUrl) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM roombackground WHERE roomId = ?",
      [roomId],
      (_, result) => {
        if (result.rows.length > 0) {
          tx.executeSql(
            "UPDATE roombackground SET image = ? WHERE roomId = ?",
            [imageUrl, roomId],
            () => {
              console.log("");
            },
            (_, updateError) => {
              console.error("Failed to update existing record:", updateError);
            }
          );
        } else {
          // Record doesn't exist, perform an INSERT
          tx.executeSql(
            "INSERT INTO roombackground (roomId, image) VALUES (?, ?)",
            [roomId, imageUrl],
            () => {
              console.log("");
            },
            (_, insertError) => {
              console.log("", insertError);
            }
          );
        }
      },
      (_, error) => {
        console.log("", error);
      }
    );
  });
};

//member remove from channel
export const exitChannelFromTable = (channelId, callback) => {
  db.transaction((tx) => {
    // First, check if the record exists
    tx.executeSql(
      "SELECT * FROM ChannelInformation WHERE channelId = ?",
      [channelId],
      (_, result) => {
        if (result.rows.length > 0) {
          // If the record exists, delete it
          tx.executeSql(
            "DELETE FROM ChannelInformation WHERE channelId = ?",
            [channelId],
            () => {
              console.log(
                `Record with channelId ${channelId} has been deleted.`
              );
              callback(true); // Success callback
            },
            (_, deleteError) => {
              console.error("Failed to delete the record:", deleteError);
              callback(false); // Failure callback
            }
          );
        } else {
          console.log("No record found for the provided channelId.");
          callback(false); // Failure callback since the record doesn't exist
        }
      },
      (_, error) => {
        console.error("Failed to fetch the channel information:", error);
        callback(false); // Failure callback due to fetch error
      }
    );
  });
};

export const decreaseSubscribers = (channelId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM ChannelInformation WHERE channelId = ?",
      [channelId],
      (_, result) => {
        if (result.rows.length > 0) {
          const currentSubscribers = result.rows.item(0).Subcribers;
          if (currentSubscribers > 0) {
            tx.executeSql(
              "UPDATE ChannelInformation SET Subcribers = Subcribers - 1 WHERE channelId = ?",
              [channelId],
              () => {
                console.log("Subscribers count decreased by 1");
                callback(true);
              },
              (_, updateError) => {
                console.error(
                  "Failed to decrease subscribers count:",
                  updateError
                );
                callback(false);
              }
            );
          } else {
            console.log("Subscribers count is already at 0.");
            callback(false);
          }
        } else {
          console.log("No record found for the provided channelId.");
          callback(false);
        }
      },
      (_, error) => {
        console.error("Failed to fetch the channel information:", error);
        callback(false);
      }
    );
  });
};

export const increaseSubscribers = (channelId, callback) => {
  console.log("channel id", channelId);
  db.transaction((tx) => {
    // Check if the record exists
    tx.executeSql(
      "SELECT * FROM ChannelInformation WHERE channelId = ?",
      [channelId],
      (_, result) => {
        if (result.rows.length > 0) {
          console.log("result.rows.length", result.rows.item(0));
          // Increase the subscribers count by 1
          tx.executeSql(
            "UPDATE ChannelInformation SET Subcribers = Subcribers + 1 WHERE channelId = ?",
            [channelId],
            () => {
              console.log("Subscribers count increased by 1");
              callback(true);
            },
            (_, updateError) => {
              console.error(
                "Failed to increase subscribers count:",
                updateError
              );
              callback(false);
            }
          );
        } else {
          console.log("No record found for the provided channelId.");
          callback(false);
        }
      },
      (_, error) => {
        console.error("Failed to fetch the channel information:", error);
        callback(false);
      }
    );
  });
};

export const removeRoomBackground = (roomId) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM roombackground WHERE roomId = ?",
      [roomId],
      () => {
        console.log("");
      },
      (_, error) => {
        console.error("Failed to delete record:", error);
      }
    );
  });
};

export const getRoomBackgroundByRoomId = (roomId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM roombackground WHERE roomId = ?",
      [roomId],
      (tx, results) => {
        console.log("", tx);
        if (results.rows.length > 0) {
          const roomData = results.rows.item(0);
          callback(roomData); // Pass the room data to the callback function
        } else {
          callback(null); // If no data found for roomId, pass null to the callback
        }
      },
      (tx, error) => {
        console.error("Failed to fetch data:", error);
        callback(null); // Pass null to the callback in case of an error
      }
    );
  });
};

export const updateChatbot = (messages) => {
  db.transaction((tx) => {
    messages.forEach((message) => {
      tx.executeSql(
        "INSERT INTO wokiibotchat (resId, content, user) VALUES (?, ?, ?)",
        [message.resId, message.content, JSON.stringify(message.user)],
        () => {
          console.log("");
        },
        (error) => {
          console.error("Failed to insert data:", error);
        }
      );
    });
  });
};

export const getChatbotMessages = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM wokiibotchat",
      [],
      (tx, results) => {
        console.log("", tx);
        const len = results.rows.length;
        const messages = [];
        for (let i = 0; i < len; i++) {
          messages.push(results.rows.item(i));
        }
        callback(messages); // Pass the fetched messages to the callback function
      },
      (tx, error) => {
        console.log("", tx);
        console.error("Failed to fetch data:", error);
      }
    );
  });
};

export const getLastChatbotMessage = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM wokiibotchat ORDER BY resId DESC LIMIT 1",
      [],
      (tx, results) => {
        console.log("", tx);
        if (results.rows.length > 0) {
          const lastMessage = results.rows.item(0);
          callback(lastMessage); // Pass the last message to the callback function
        } else {
          callback(null); // If no messages found, pass null to the callback
        }
      },
      (tx, error) => {
        console.log("", tx);
        console.error("Failed to fetch data:", error);
        callback(null); // Pass null to the callback in case of an error
      }
    );
  });
};

export const updategroupmembers = (chathistory) => {
  db.transaction((tx) => {
    // Create table if it doesn't exist
    chathistory.forEach((data) => {
      tx.executeSql(
        `SELECT * FROM allUsers WHERE _id = ?`,
        [data._id],
        (_, selectResults) => {
          if (selectResults.rows.length === 0) {
            tx.executeSql(
              "INSERT INTO allUsers (_id,name,phone_number) VALUES (?,?,?)", // Define your INSERT statement here
              [data?._id, data?.name, data?.phone_number],
              (_, insertResults) => {
                console.log("", insertResults);
              },
              (error) => {
                console.error("Failed to insert data:", error);
              }
            );
          }
        }
      );
    });
  });
};

// Function to delete a message by resId
export const deleteMessageByResId = async (resIdsToDelete) => {
  db.transaction((tx) => {
    resIdsToDelete.forEach((resId) => {
      tx.executeSql(
        "DELETE FROM Chatmessages WHERE mId = ?",
        [resId],
        () => {
          console.log("");
        },
        (_, error) => {
          console.error("Error deleting message:", error);
        }
      );
    });
  });
};

export const updatedeleteforall = async (message, messageIds, callback) => {
  db.transaction((tx) => {
    messageIds.forEach((messageId) => {
      tx.executeSql(
        "UPDATE Chatmessages SET message = ?, isDeletedForAll = ? WHERE mId = ?",
        [message, 1, messageId],
        (_, result) => {
          callback(result);
        },
        (error) => {
          console.error("Error updating message:", error);
        }
      );
    });
  });
};

export const deleteMessagesForAll = async (messageIds, callback) => {
  db.transaction((tx) => {
    // Convert array of IDs to a comma-separated string for the SQL query
    const placeholders = messageIds.map(() => "?").join(", ");

    tx.executeSql(
      `DELETE FROM ChannelMessages WHERE mId IN (${placeholders})`,
      messageIds, // Provide the array directly
      (_, result) => {
        callback(result); // Invoke the callback with the result of the deletion
      },
      (error) => {
        console.error("Error deleting messages:", error); // Log any errors
      }
    );
  });
};

export const updatereactions = async (messageId, reactions, callback) => {
  db.transaction((tx) => {
    let reactionsstring = JSON.stringify(reactions);
    tx.executeSql(
      "UPDATE ChannelMessages SET reactions = ? WHERE mId = ?",
      [reactionsstring, messageId],
      (_, result) => {
        console.log("yesss updatee reaction", reactionsstring, messageId);
        callback(result);
      },
      (error) => {
        console.error("Error updating message:", error);
      }
    );
  });
};

export const updatereactionsonnormal = async (
  messageId,
  reactions,
  callback
) => {
  db.transaction((tx) => {
    let reactionsstring = JSON.stringify(reactions);
    tx.executeSql(
      "UPDATE Chatmessages SET reactions = ? WHERE mId = ?",
      [reactionsstring, messageId],
      (_, result) => {
        console.log("yesss updatee reaction", reactionsstring, messageId);
        callback(result);
      },
      (error) => {
        console.error("Error updating message:", error);
      }
    );
  });
};

export const updatereactionsforother = async (
  messageId,
  isAdd,
  reaction,
  user,
  callback
) => {
  console.log("piyushhhhh", messageId, isAdd, reaction, user);

  db.transaction((tx) => {
    // Step 1: Retrieve the current reactions
    tx.executeSql(
      "SELECT reactions FROM ChannelMessages WHERE mId = ?",
      [messageId],
      (_, result) => {
        // Log the result to check the output
        console.log("Query Result:", result);

        // Access result rows
        const results = result.rows;

        if (results.length === 0) {
          console.error("Message not found or no reactions exist.");
          return;
        }

        let reactions;
        try {
          reactions = JSON.parse(results.item(0).reactions);
        } catch (parseError) {
          console.error("Error parsing reactions JSON:", parseError);
          return;
        }

        console.log("Current Reactions:", reactions);

        // Step 2: Modify the reactions
        const reactionIndex = reactions.findIndex((r) => r.emoji === reaction);

        if (reactionIndex === -1) {
          if (isAdd) {
            // Add new reaction logic
            reactions.push({
              emoji: reaction,
              count: 1,
              users: [
                {
                  userId: user,
                  reactionTime: new Date().toISOString(),
                },
              ],
            });
          } else {
            console.error("Reaction emoji not found, but isAdd is false.");
            return;
          }
        } else {
          if (isAdd) {
            // Add reaction logic
            const reactionItem = reactions[reactionIndex];
            const userIndex = reactionItem.users.findIndex(
              (u) => u.userId === user
            );

            if (userIndex === -1) {
              reactionItem.users.push({
                userId: user,
                reactionTime: new Date().toISOString(),
              });
              reactionItem.count = reactionItem.users.length;
            }
          } else {
            // Remove user
            let updatedUsers = reactions[reactionIndex].users.filter(
              (u) => u.userId !== user
            );

            if (updatedUsers.length === 0) {
              // Remove emoji if no users are left
              reactions.splice(reactionIndex, 1);
            } else {
              reactions[reactionIndex].users = updatedUsers;
              reactions[reactionIndex].count = updatedUsers.length;
            }
          }
        }

        // Convert the updated reactions back to a JSON string
        const updatedReactionsString = JSON.stringify(reactions);

        // Log the updated reactions for debugging
        console.log("Updated Reactions:", updatedReactionsString);

        // Step 3: Update the database
        tx.executeSql(
          "UPDATE ChannelMessages SET reactions = ? WHERE mId = ?",
          [updatedReactionsString, messageId],
          (_, result) => {
            console.log(
              "Successfully updated reaction",
              updatedReactionsString,
              messageId
            );
            callback(result);
          },
          (error) => {
            console.error("Error updating message:", error);
          }
        );
      },
      (error) => {
        console.error("Error retrieving reactions:", error);
      }
    );
  });
};

export const updatereactionsforothernormal = async (
  messageId,
  isAdd,
  reaction,
  user,
  callback
) => {
  console.log("piyushhhhh", messageId, isAdd, reaction, user);
  db.transaction((tx) => {
    // Step 1: Retrieve the current reactions
    tx.executeSql(
      "SELECT reactions FROM Chatmessages WHERE mId = ?",
      [messageId],
      (_, result) => {
        // Log the result to check the output
        console.log("Query Result:", result);

        // Access result rows
        const results = result.rows;

        if (results.length === 0) {
          console.error("Message not found or no reactions exist.");
          return;
        }

        let reactions;
        try {
          reactions = JSON.parse(results.item(0).reactions);
        } catch (parseError) {
          console.error("Error parsing reactions JSON:", parseError);
          return;
        }

        console.log("Current Reactions:", reactions);

        // Step 2: Modify the reactions
        const reactionIndex = reactions.findIndex((r) => r.emoji === reaction);

        if (reactionIndex === -1) {
          if (isAdd) {
            // Add new reaction logic
            reactions.push({
              emoji: reaction,
              count: 1,
              users: [
                {
                  userId: user,
                  reactionTime: new Date().toISOString(),
                },
              ],
            });
          } else {
            console.error("Reaction emoji not found, but isAdd is false.");
            // return;
          }
        } else {
          if (isAdd) {
            // Add reaction logic
            const reactionItem = reactions[reactionIndex];
            const userIndex = reactionItem.users.findIndex(
              (u) => u.userId === user
            );

            if (userIndex === -1) {
              reactionItem.users.push({
                userId: user,
                reactionTime: new Date().toISOString(),
              });
              reactionItem.count = reactionItem.users.length;
            }
          } else {
            // Remove user
            let updatedUsers = reactions[reactionIndex].users.filter(
              (u) => u.userId !== user
            );

            if (updatedUsers.length === 0) {
              // Remove emoji if no users are left
              reactions.splice(reactionIndex, 1);
            } else {
              reactions[reactionIndex].users = updatedUsers;
              reactions[reactionIndex].count = updatedUsers.length;
            }
          }
        }

        // Convert the updated reactions back to a JSON string
        const updatedReactionsString = JSON.stringify(reactions);

        // Log the updated reactions for debugging
        console.log("Updated Reactions:", updatedReactionsString);

        // Step 3: Update the database
        tx.executeSql(
          "UPDATE Chatmessages SET reactions = ? WHERE mId = ?",
          [updatedReactionsString, messageId],
          (_, result) => {
            console.log(
              "Successfully updated reaction",
              updatedReactionsString,
              messageId
            );
            callback(result);
          },
          (error) => {
            console.error("Error updating message:", error);
          }
        );
      },
      (error) => {
        console.error("Error retrieving reactions:", error);
      }
    );
  });
};

export const updateChatHistory = async (chathistory) => {
  db.transaction((tx) => {
    // Create table if it doesn't exist
    chathistory.forEach((data) => {
      tx.executeSql(
        `SELECT * FROM table_user WHERE resId = ?`,
        [data.resId],
        (_, selectResults) => {
          if (selectResults.rows.length === 0) {
            tx.executeSql(
              "INSERT INTO table_user (resId, userName,userImage,roomId,roomName,roomImage,roomType,roomOwnerId,roomMembers,parent_message_id,parent_message,message_type,attachment,isNotificationAllowed,archive,fromUser,createdAt,deletedFor,deliveredCount,isBroadcastMessage,isDeletedForAll,isForwarded,message,seenCount,status,updatedAt,messageTime,lastMessage,broadcastMessageId,seenBy,isUserExitedFromGroup,friendId,time,undeliveredMessageCount,unseenMessageCount,message_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", // Define your INSERT statement here
              [
                data?.resId,
                data?.roomName,
                data?.roomImage,
                data?.roomId,
                data?.roomName,
                data?.roomImage,
                data?.roomType,
                data?.roomOwnerId,
                data?.roomMembers,
                data?.parent_message_id,
                JSON.stringify(data?.parent_message),
                data?.message_type,
                data?.attachment?.join(","),
                data?.isNotificationAllowed,
                data?.isArchived === false ? 0 : 1,
                data?.from,
                new Date(data?.createdAt).getTime(),
                data?.deletedFor?.join(","),
                data?.deliveredCount,
                data?.isBroadcastMessage,
                data?.isDeletedForAll,
                data.isForwarded == false ? 0 : 1,
                data?.message,
                data?.seenCount,
                data?.status,
                data?.updatedAt,
                data?.messageTime,
                data?.lastMessage,
                data?.broadcastMessageId,
                data?.seenBy?.join(","),
                data?.isUserExitedFromGroup,
                data?.friendId,
                data?.time,
                data?.undeliveredMessageCount,
                data?.unseenMessageCount,
                data?._id,
              ],
              () => {
                console.log("");
              },
              (error) => {
                console.error("Failed to insert data:", error);
              }
            );
          } else {
            tx.executeSql(
              "UPDATE table_user SET status = ?,message = ?, attachment = ?,message_id = ?,parent_message = ?,isForwarded = ? WHERE resId = ?",
              [
                data?.status,
                data?.message,
                data?.attachment?.join(","),
                data?._id,
                JSON.stringify(data?.parent_message),
                data.isForwarded,
                data?.resId,
              ],
              () => {
                console.log("");
              },
              (error) => {
                console.log("", error);
              }
            );
          }
        }
      );
    });
  });
};

export const insertContact = (contact) => {
  db.transaction((tx) => {
    contact.forEach((data) => {
      tx.executeSql(
        "INSERT OR REPLACE INTO ContactTable (phone_number,name) VALUES (?, ?)",
        [data.phone_number, data.contact_name],
        () => {
          console.log("");
        },
        (err) => {
          console.log("", err);
        }
      );
    });
  });
};

export const insertContactIOS = (contact) => {
  db.transaction((tx) => {
    contact.forEach((data) => {
      tx.executeSql(
        "INSERT OR REPLACE INTO ContactTable (phone_number,name) VALUES (?, ?)",
        [data.phone_number, data.contact_name],
        (tx, results) => {
          const len = results.rows.length;
          const messages = [];
          for (let i = 0; i < len; i++) {
            messages.push(results.rows.item(i));
          }
        },
        (err) => {
          console.log("", err);
        }
      );
    });
  });
};

export const insertDataFromCSVToTable = (rows, callback) => {
  db.transaction((tx) => {
    // Iterate over each row of the CSV data
    for (let i = 1; i < rows.length - 1; i++) {
      let row = rows[i];
      let fields = [];
      let currentField = "";
      let inQuotes = false;

      for (let char of row) {
        if (char === '"') {
          inQuotes = !inQuotes;
          currentField += char;
        } else if (char === "," && !inQuotes) {
          fields.push(currentField.trim());
          currentField = "";
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim()); // Add the last field

      let [
        // eslint-disable-next-line
        id,
        mId,
        roomId,
        fromUser,
        userName,
        phoneNumber,
        message,
        messageType,
        attachment,
        localPath,
        isBroadcastMessage,
        isDeletedForAll,
        parentMessage,
        isForwarded,
        storyId,
        isStoryRemoved,
        resId,
        broadcastMessageId,
        seenCount,
        deliveredCount,
        unreadCount,
        status,
        createdAt,
        updatedAt,
        shouldDisappear,
        disappearTime,
        disappearMsgTime,
      ] = fields;
      localPath = String(localPath).replace(/""/g, '"');

      if (localPath[0] == '"') {
        localPath = localPath.substr(1, localPath.length - 2);
      }

      attachment = String(attachment).replace(/""/g, '"');
      if (attachment[0] == '"') {
        attachment = attachment.substr(1, attachment.length - 2);
      }

      // Execute SQL query to insert data into Chatmessages table
      tx.executeSql(
        `INSERT INTO Chatmessages (
        mId, roomId, fromUser, userName, phoneNumber, message, message_type, attachment,localPath, 
        isBroadcastMessage, isDeletedForAll, parent_message, isForwarded, storyId, isStoryRemoved, 
        resId, broadcastMessageId, seenCount, deliveredCount, unreadCount, status, createdAt, 
        updatedAt, shouldDisappear, disappearTime, disappearMsgTime,reactions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mId,
          roomId,
          fromUser,
          userName,
          phoneNumber,
          message,
          messageType,
          attachment,
          localPath,
          isBroadcastMessage,
          isDeletedForAll,
          parentMessage,
          isForwarded,
          storyId,
          isStoryRemoved,
          resId,
          broadcastMessageId,
          seenCount,
          deliveredCount,
          unreadCount,
          status,
          createdAt,
          updatedAt,
          shouldDisappear,
          disappearTime,
          disappearMsgTime,
          [],
        ],
        () => {
          if (i === rows.length - 1) {
            callback(true);
          }
        },
        (err) => {
          if (i === rows.length - 1) {
            callback(true);
          }
          console.error("Error: ", err);
        }
      );
    }
  });
};

export const insertRoomSql3 = (insertdata, useridddd, callback) => {
  try {
    db.transaction(async (tx) => {
      const membersCount = {};

      if (insertdata.rooms) {
        let roomscount = 0;
        let totalrooms = insertdata.rooms.length;

        insertdata.rooms.forEach((data, index) => {
          const newMembers = data.members
            ? data.members.filter((f) => f.user != null)
            : [];

          // Handle single rooms with missing members
          if (data.roomId.type === "single" && newMembers.length < 2) {
            return;
          }

          membersCount[data.roomId._id] = newMembers.filter(
            (m) => m.isRemoved === false
          ).length;

          const friend = newMembers[Number(friendId)] || {};

          // Extract the most recent name and image
          const name =
            data.roomId.type === "single" && friend.user
              ? friend.user.name || "Tokee user"
              : data.name?.[data.name.length - 1]?.name || "Tokee group";

          const image =
            data.roomId.type === "single" && friend.user
              ? friend.user.image || "https://example.com/default-image.png"
              : data.image?.[data.image.length - 1]?.image ||
                "https://example.com/default-group-image.png";

          // Other details
          const lastMessage = data.lastMessage.message || "";
          const messageType = data.lastMessage.messageType || "text";
          const lastMessageId = data.lastMessage._id || "";
          const lastMessageTime = data.lastMessage.createdAt || "";

          let isHide = false;
          let isRemoved = false;
          let isMute = false;
          let aliasName = "";
          let aliasImage = "";
          let isLock = 0;
          let friendId = 0;

          if (data) {
            isHide = data.isArchived || false;
            isRemoved = data.isRemoved || false;
            isMute = data.isNotificationAllowed || false;
            aliasName = data.aliasName || "";
            aliasImage = data.aliasImage || "";
            isLock = data.isLock || 0;
            friendId = data.friendId || 0;
          }

          let ispin = 0;
          let unseenMessageCount = 0;

          try {
            tx.executeSql(
              "SELECT ispin, unseenMessageCount FROM RoomSql WHERE roomId = ?",
              [data.roomId],
              (tx, results) => {
                try {
                  if (results.rows.length > 0) {
                    ispin = results.rows.item(0)?.ispin || 0;
                    unseenMessageCount =
                      results.rows.item(0)?.unseenMessageCount || 0;
                  }

                  tx.executeSql(
                    "INSERT OR REPLACE INTO RoomSql (roomId, roomName, aliasName, aliasImage, roomImage, roomType, archive, lastMessage, messageType, unseenMessageCount, time, lastMessageId, isUserExitedFromGroup, friendId, isNotificationAllowed, owner, allow, isLock, isPublic, isHide, isChatListDelete, ispin, premium, isDiamonds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                      data.roomId,
                      name,
                      aliasName,
                      aliasImage,
                      image,
                      data.type,
                      isHide ? 1 : 0,
                      lastMessage,
                      messageType,
                      unseenMessageCount || 0,
                      lastMessageTime,
                      lastMessageId,
                      isRemoved ? 1 : 0,
                      friendId,
                      isMute ? 1 : 0,
                      data.owner || "",
                      data.allow || "public",
                      isLock ? 1 : 0,
                      data.isPublic ? 1 : 0,
                      data.isHide ? 1 : 0,
                      data.isChatListDelete ? 1 : 0,
                      ispin,
                      0,
                      0,
                    ],
                    (tx) => {
                      socket.emit("joinRoom", {
                        roomId: data.roomId._id,
                        userId: globalThis.userChatId,
                      });
                      ///////////////update sid////////////////
                      let sId = "";
                      if (data.type == "single") {
                        let first = Number.parseInt(
                          String(data.friendNumber).substr(-10)
                        );
                        let second = Number.parseInt(
                          String(globalThis.phone_number).substr(-10)
                        );
                        if (first > second) {
                          sId = second + "_" + first;
                        } else {
                          sId = first + "_" + second;
                        }
                        tx.executeSql(
                          "UPDATE RoomSql SET sId = ? WHERE roomId = ?",
                          [sId, data.roomId],
                          () => {
                            console.log("sID update sucess===================");
                          },
                          (err) => {
                            console.log("", err);
                          }
                        );
                      }
                      //////////////////////////////////////////

                      if (totalrooms - 1 === index) {
                        callback(true);
                      } else {
                        roomscount++;
                      }

                      for (let member of newMembers) {
                        if (
                          data.roomId.type !== "single" &&
                          member.isRemoved === true
                        ) {
                          continue;
                        }

                        tx.executeSql(
                          "INSERT OR REPLACE INTO RoomMembers (mongoId, userId, name, image, phone_number, roomId, isAdmin, joinedOn, premium, isDiamonds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                          [
                            data.roomId._id + "-" + member.user._id,
                            member.user._id,
                            member.user.name || "Unknown User",
                            member.user.image ||
                              "https://example.com/default-image.png",
                            Number(member.user.phone_number || 0),
                            data.roomId._id,
                            member.isAdmin ? 1 : 0,
                            new Date(member.addedOn || Date.now()).getTime(),
                            member.user.premium || 0,
                          ],
                          () => {},
                          (error) => {
                            console.log("Room Member Insert Error:", error);
                          }
                        );
                      }
                    },
                    (error) => {
                      console.error("Room Insert Error:", error);
                    }
                  );
                } catch (error) {
                  console.log("SQL Error:", error);
                }
              },
              (err) => {
                console.log("SQL Select Error:", err);
              }
            );
          } catch (err) {
            console.log("SQL Transaction Error:", err);
          }
        });

        console.log(
          "Rooms processing completed===================================="
        );
      }
      if (insertdata.chats) {
        // console.log("yyyyyyyyyyyyyy", insertdata.chats);
        // eslint-disable-next-line
        let count = 0;
        let totalChat = insertdata.chats.length;
        insertdata.chats.forEach((chat, index) => {
          const totalMembers = membersCount[chat.roomId];
          // console.log("chatchatchat", chat);
          let status = "sent";
          if (chat.seenCount >= totalMembers - 1) {
            status = "seen";
          } else if (chat.deliveredCount >= totalMembers - 1) {
            status = "delivered";
          }

          if (totalMembers == 1) {
            status = "sent";
          }

          if (chat.from == null) {
            return;
          }

          // Code Added by puru
          tx.executeSql(
            "SELECT * FROM Chatmessages WHERE mId = ?",
            [chat._id],
            (_, results) => {
              let currentDisappearTime = null;
              if (results.rows.length > 0) {
                currentDisappearTime = results.rows.item(0)?.disappearMsgTime;

                tx.executeSql(
                  "UPDATE Chatmessages SET isDeletedForAll = ?,storyId = ?, isStoryRemoved = ?,seenCount = ?,deliveredCount = ?,updatedAt = ?,shouldDisappear = ?,unreadCount = ?,disappearTime = ?,disappearMsgTime = ?,reactions = ? WHERE mId = ?",
                  [
                    chat.isDeletedForAll,
                    chat.storyId,
                    chat.isStoryRemoved,
                    chat.seenCount,
                    chat.deliveredCount,
                    chat.updatedAt,
                    chat.shouldDisappear ? 1 : 0,
                    chat?.unreadCount ? chat?.unreadCount : 0,
                    chat?.disappearTime,
                    currentDisappearTime,
                    JSON.stringify(chat?.reactions?.reactions || []),
                    chat._id,
                  ],
                  (results) => {
                    // console.log("myy messageeee", results);
                    if (totalChat - 1 === index) {
                      console.log("All chats inserted successfully");
                      AsyncStorage.setItem("lastsynctime", `${Date.now()}`)
                        .then(() => {
                          callback(true);
                        })
                        .catch((storageError) => {
                          console.error(
                            "Failed to set last sync time in AsyncStorage:",
                            storageError
                          );
                          callback(false);
                        });
                    } else {
                      // console.log(
                      //   "Insertion or replacement successful for index:",
                      //   index
                      // );
                      count++;
                    }
                  },
                  (error) => {
                    console.log("", error);
                  }
                );
              } else {
                tx.executeSql(
                  "INSERT OR REPLACE INTO Chatmessages (mId, roomId, fromUser, userName, message, message_type, attachment, isBroadcastMessage, isDeletedForAll, parent_message, isForwarded, storyId, isStoryRemoved, resId, broadcastMessageId, seenCount, deliveredCount, status, createdAt, updatedAt, shouldDisappear, unreadCount, disappearTime, disappearMsgTime,reactions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)",
                  [
                    chat._id,
                    chat.roomId,
                    chat.from._id,
                    chat.from.name ?? "Tokee User",
                    chat.message,
                    chat.message_type,
                    JSON.stringify(chat?.attachment || []), // Ensure `attachment` is always an array
                    chat.isBroadcastMessage,
                    chat.isDeletedForAll,
                    JSON.stringify(chat?.parent_message || {}), // Ensure `parent_message` is an object
                    chat.isForwarded,
                    chat.storyId,
                    chat.isStoryRemoved,
                    chat.resId,
                    chat.broadcastMessageId || "",
                    chat.seenCount,
                    chat.deliveredCount,
                    status,
                    new Date(chat?.createdAt).getTime(), // Ensure createdAt is in timestamp format
                    chat.updatedAt,
                    chat.shouldDisappear ? 1 : 0,
                    chat?.unreadCount || 0,
                    chat?.disappearTime,
                    currentDisappearTime,
                    JSON.stringify(chat?.reactions?.reactions || []),
                  ],
                  (tx, result) => {
                    // console.log(
                    //   "Data inserted or replaced successfully:",
                    //   result
                    // );
                    if (totalChat - 1 === index) {
                      console.log("All chats inserted successfully");
                      AsyncStorage.setItem("lastsynctime", `${Date.now()}`)
                        .then(() => {
                          callback(true);
                        })
                        .catch((storageError) => {
                          console.error(
                            "Failed to set last sync time in AsyncStorage:",
                            storageError
                          );
                          callback(false);
                        });
                    } else {
                      // console.log(
                      //   "Insertion or replacement successful for index:",
                      //   index
                      // );
                      count++;
                    }
                  },
                  (error) => {
                    console.error(
                      "Failed to insert or replace data in Chatmessages:",
                      error
                    );
                    // Optionally, add further error handling here if needed
                  }
                );
              }
            }
          );
        });
      }
      if (insertdata?.rooms?.length == 0) {
        await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
      }
      if (insertdata.blocks) {
        console.log("in block condication====================================");

        insertdata.blocks.forEach((data) => {
          tx.executeSql(
            "INSERT INTO blockusers (fromuser,touser) VALUES (?,?)",
            [data.from, data.to],
            () => {
              console.log("inserted blocks");
            },
            (err) => {
              console.log("insert blocks failed ", err);
            }
          );
        });
      }
    });
  } catch (err) {
    console.log("Transaction Error:", err);
  }
};

export const insertRoomSql = (insertdata, useridddd, callback) => {


  try {
    db.transaction(async (tx) => {
      const membersCount = {};
      if (insertdata.rooms) {
        // console.log("grouppppppppppp",insertdata.rooms)
        let roomscount = 0;
        let totalrooms = insertdata.rooms.length;
        insertdata.rooms.forEach((data, index) => {
          const newMembers = data.members.filter((f) => f.user != null);

          if (data.roomId.type == "single" && newMembers.length < 2) {
            return;
          }

          membersCount[data.roomId._id] = newMembers.filter(
            (m) => m.isRemoved == false
          ).length;
          const mydata = newMembers.filter((f) => f.user._id == useridddd);
          let friendId = 0;
          if (data.roomId.type == "single") {
            const currentUserIdx = newMembers.findIndex(
              (f) => f.user._id == useridddd
            );
            if (currentUserIdx >= 0) {
              friendId = currentUserIdx ? 0 : 1;
            }
          }
          let friend = newMembers[Number(friendId)];

          let name = "";
          let image = "";
          let isHide = false;
          let isRemoved = false;
          let isMute = false;
          let aliasName = "";
          let aliasImage = "";
          let isLock = 0;
          if (data.roomId.type == "single") {
            name = friend.user.name;
            image = friend.user.image;
          } else {
            name = data.roomId.name[data.roomId.name.length - 1].name;
            image = data.roomId.image[data.roomId.image.length - 1].image;
          }
          // Example insert statement
          if (mydata.length) {
            isHide = mydata[0].isArchived;
            isRemoved = mydata[0].isRemoved;
            isMute = mydata[0].isNotificationAllowed;
            aliasName = mydata[0].aliasName;
            aliasImage = mydata[0].aliasImage;
            isLock = mydata[0].isLock;
          }
          let ispin = 0;
          let unseenMessageCount = 0;
          try {
            tx.executeSql(
              "SELECT ispin, unseenMessageCount FROM RoomSql WHERE roomId = ?",
              [data.roomId._id],
              (tx, results) => {
                try {
                  if (results.rows.length > 0) {
                    ispin = results.rows.item(0)?.ispin;
                    unseenMessageCount =
                      results.rows.item(0)?.unseenMessageCount;
                  }
                  tx.executeSql(
                    "INSERT OR REPLACE INTO RoomSql (roomId, roomName, aliasName, aliasImage, roomImage, roomType, archive, lastMessage, messageType, unseenMessageCount, time, lastMessageId, isUserExitedFromGroup, friendId, isNotificationAllowed, owner,allow, isLock, isPublic, isHide,isChatListDelete,ispin,premium, isDiamonds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)",
                    [
                      data.roomId._id,
                      name || "Tokee user",
                      aliasName,
                      aliasImage,
                      image,
                      data.roomId.type,
                      isHide ? 1 : 0,
                      data.roomId.lastMessage.message,
                      data.roomId.lastMessage.messageType,
                      unseenMessageCount || 0,
                      data.roomId.lastMessage.createdAt,
                      data.roomId.lastMessage._id,
                      isRemoved ? 1 : 0,
                      friend.user._id,
                      isMute ? 1 : 0,
                      data.owner,
                      data.roomId.allow,
                      isLock ? 1 : 0,
                      data.roomId.isPublic ? 1 : 0,
                      data.roomId.isHide ? 1 : 0,
                      data.roomId.isChatListDelete ? 1 : 0,
                      ispin,
                      data.roomId.type == "single"
                        ? friend.user.premium
                          ? 1
                          : 0
                        : 0,
                      0,
                    ],
                    (tx) => {
                      socket.emit("joinRoom", {
                        roomId: data.roomId._id,
                        userId: globalThis.userChatId,
                      });
                      let sId = "";
                      if (data.roomId.type == "single") {
                        let first = Number.parseInt(
                          String(newMembers[0].user.phone_number).substr(-10)
                        );
                        let second = Number.parseInt(
                          String(newMembers[1].user.phone_number).substr(-10)
                        );
                        if (first > second) {
                          sId = second + "_" + first;
                        } else {
                          sId = first + "_" + second;
                        }
                        tx.executeSql(
                          "UPDATE RoomSql SET sId = ? WHERE roomId = ?",
                          [sId, data.roomId._id],
                          () => {
                            console.log("");
                          },
                          (err) => {
                            console.log("", err);
                          }
                        );
                      }

                      const currentUserIdx = newMembers.findIndex(
                        (m) => m.user._id == globalThis.userChatId
                      );
                      const isUserRemovedFromRoom =
                        newMembers[currentUserIdx].isRemoved;
                      const removedOnDate =
                        newMembers[currentUserIdx].removedOn;

                      if (totalrooms - 1 == index) {
                        callback(true);
                      } else {
                        roomscount++;
                      }

                      for (let member of newMembers) {
                        if (
                          data.roomId.type != "single" &&
                          member.isRemoved == true
                        ) {
                          continue;
                        }

                        if (
                          isUserRemovedFromRoom &&
                          new Date(member.addedOn).getTime() >=
                            new Date(removedOnDate).getTime()
                        ) {
                          continue;
                        }

                        tx.executeSql(
                          "INSERT OR REPLACE INTO RoomMembers (mongoId,userId,name,image,phone_number,roomId, isAdmin,joinedOn,premium,isDiamonds) VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?)", // Define your table schema here
                          [
                            data.roomId._id + "-" + member.user._id,
                            member.user._id,
                            member.user.name || member.user.phone_number,
                            member.user.image ||
                              "https://tokeecorp.com/backend/public/images/user-avatar.png",
                            Number(member.user.phone_number),
                            data.roomId._id,
                            member.isAdmin ? 1 : 0,
                            new Date(member.addedOn).getTime(),
                            member.user.premium,
                            member.user.isDiamonds || 0,
                          ],
                          () => {
                            // console.log("Room Member Inserted");
                          },
                          (error) => {
                            console.log("", error);
                          }
                        );
                      }
                    },
                    (error) => {
                      console.error("Failed to insert:", error);
                    }
                  );
                } catch (error) {
                  console.log("error >>>>>> ", error);
                }
              },
              (err) => {
                console.log("err >>>>>>>>>>>>>", err);
              }
            );
          } catch (err) {
            console.log("err", err);
          }
        });
      }
      if (insertdata.chats) {
        // console.log("yyyyyyyyyyyyyy", insertdata.chats);
        // eslint-disable-next-line
        let count = 0;
        let totalChat = insertdata.chats.length;
        insertdata.chats.forEach((chat, index) => {
          const totalMembers = membersCount[chat.roomId];
          // console.log("chatchatchat", chat);
          let status = "sent";
          if (chat.seenCount >= totalMembers - 1) {
            status = "seen";
          } else if (chat.deliveredCount >= totalMembers - 1) {
            status = "delivered";
          }

          if (totalMembers == 1) {
            status = "sent";
          }

          if (chat.from == null) {
            return;
          }

          // Code Added by puru
          tx.executeSql(
            "SELECT * FROM Chatmessages WHERE mId = ?",
            [chat._id],
            (_, results) => {
              let currentDisappearTime = null;
              if (results.rows.length > 0) {
                currentDisappearTime = results.rows.item(0)?.disappearMsgTime;

                tx.executeSql(
                  "UPDATE Chatmessages SET isDeletedForAll = ?,storyId = ?, isStoryRemoved = ?,seenCount = ?,deliveredCount = ?,updatedAt = ?,shouldDisappear = ?,unreadCount = ?,disappearTime = ?,disappearMsgTime = ?,reactions = ? WHERE mId = ?",
                  [
                    chat.isDeletedForAll,
                    chat.storyId,
                    chat.isStoryRemoved,
                    chat.seenCount,
                    chat.deliveredCount,
                    chat.updatedAt,
                    chat.shouldDisappear ? 1 : 0,
                    chat?.unreadCount ? chat?.unreadCount : 0,
                    chat?.disappearTime,
                    currentDisappearTime,
                    JSON.stringify(chat?.reactions?.reactions || []),
                    chat._id,
                  ],
                  (results) => {
                    // console.log("myy messageeee", results);
                    if (totalChat - 1 === index) {
                      console.log("All chats inserted successfully");
                      AsyncStorage.setItem("lastsynctime", `${Date.now()}`)
                        .then(() => {
                          callback(true);
                        })
                        .catch((storageError) => {
                          console.error(
                            "Failed to set last sync time in AsyncStorage:",
                            storageError
                          );
                          callback(false);
                        });
                    } else {
                      // console.log(
                      //   "Insertion or replacement successful for index:",
                      //   index
                      // );
                      count++;
                    }
                  },
                  (error) => {
                    console.log("", error);
                  }
                );
              } else {
                tx.executeSql(
                  "INSERT OR REPLACE INTO Chatmessages (mId, roomId, fromUser, userName, message, message_type, attachment, isBroadcastMessage, isDeletedForAll, parent_message, isForwarded, storyId, isStoryRemoved, resId, broadcastMessageId, seenCount, deliveredCount, status, createdAt, updatedAt, shouldDisappear, unreadCount, disappearTime, disappearMsgTime,reactions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)",
                  [
                    chat._id,
                    chat.roomId,
                    chat.from._id,
                    chat.from.name ?? "Tokee User",
                    chat.message,
                    chat.message_type,
                    JSON.stringify(chat?.attachment || []), // Ensure `attachment` is always an array
                    chat.isBroadcastMessage,
                    chat.isDeletedForAll,
                    JSON.stringify(chat?.parent_message || {}), // Ensure `parent_message` is an object
                    chat.isForwarded,
                    chat.storyId,
                    chat.isStoryRemoved,
                    chat.resId,
                    chat.broadcastMessageId || "",
                    chat.seenCount,
                    chat.deliveredCount,
                    status,
                    new Date(chat?.createdAt).getTime(), // Ensure createdAt is in timestamp format
                    chat.updatedAt,
                    chat.shouldDisappear ? 1 : 0,
                    chat?.unreadCount || 0,
                    chat?.disappearTime,
                    currentDisappearTime,
                    JSON.stringify(chat?.reactions?.reactions || []),
                  ],
                  (tx, result) => {
                    // console.log(
                    //   "Data inserted or replaced successfully:",
                    //   result
                    // );
                    if (totalChat - 1 === index) {
                      console.log("All chats inserted successfully");
                      AsyncStorage.setItem("lastsynctime", `${Date.now()}`)
                        .then(() => {
                          callback(true);
                        })
                        .catch((storageError) => {
                          console.error(
                            "Failed to set last sync time in AsyncStorage:",
                            storageError
                          );
                          callback(false);
                        });
                    } else {
                      // console.log(
                      //   "Insertion or replacement successful for index:",
                      //   index
                      // );
                      count++;
                    }
                  },
                  (error) => {
                    console.error(
                      "Failed to insert or replace data in Chatmessages:",
                      error
                    );
                    // Optionally, add further error handling here if needed
                  }
                );
              }
            }
          );
        });
      }
      if (insertdata.blocks) {
        insertdata.blocks.forEach((data) => {
          tx.executeSql(
            "INSERT INTO blockusers (fromuser,touser) VALUES (?,?)",
            [data.from, data.to],
            () => {
              console.log("inserted blocks");
            },
            (err) => {
              console.log("insert blocks failed ", err);
            }
          );
        });
      }
      if (insertdata?.rooms?.length == 0) {
        await AsyncStorage.setItem("lastsynctime", `${Date.now()}`);
      }
    });
  } catch (err) {
    console.log("", err);
  }
};

export const insertRoomSql2 = async (insertdata, useridddd) => {
  try {
    db.transaction(
      (tx) => {
        const membersCount = {};
        // ********************* INSERTING ROOMS ****************************
        insertdata.rooms.forEach((data) => {
          let name = "";
          let image = "";
          try {
            if (data.type != "single") {
              name = data.name[data.name.length - 1].name;
              image = data.image[data.image.length - 1].image;
            }
          } catch (error) {
            console.log("eror", error);
          }
          let ispin = 0;
          try {
            tx.executeSql("SELECT * FROM RoomSql", [], () => {});

            tx.executeSql(
              "SELECT ispin FROM RoomSql WHERE roomId = ?",
              [data._id],
              async (tx, results) => {
                try {
                  let isRoomAlreadyExist = false;
                  if (results.rows.length > 0) {
                    ispin = results.rows.item(0)?.ispin;
                    isRoomAlreadyExist = true;
                  }

                  if (isRoomAlreadyExist) {
                    tx.executeSql(
                      "UPDATE RoomSql SET lastMessage = ?, messageType = ?, time = ?, lastMessageId = ?, allow = ?, isPublic = ?, isHide = ?, isChatListDelete = ?, ispin = ? WHERE roomId = ?",
                      [
                        data.lastMessage.message,
                        data.lastMessage.messageType,
                        data.lastMessage.createdAt,
                        data.lastMessage._id,
                        data.allow,
                        data.isPublic ? 1 : 0,
                        data.isHide ? 1 : 0,
                        data.isChatListDelete ? 1 : 0,
                        ispin,
                        data._id,
                      ],
                      () => {}
                    );
                  } else {
                    tx.executeSql(
                      "INSERT OR REPLACE INTO RoomSql (roomId, roomName, aliasName, aliasImage, roomImage, roomType, archive, lastMessage, messageType, unseenMessageCount, time, lastMessageId, isUserExitedFromGroup, friendId, isNotificationAllowed, owner,allow, isLock, isPublic, isHide,isChatListDelete,ispin)  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
                      [
                        data._id,
                        name || "Tokee user",
                        "", // aliasName
                        "", // aliasImage
                        image,
                        data.type,
                        0, // archive
                        data.lastMessage.message,
                        data.lastMessage.messageType,
                        0, // unseen message count
                        data.lastMessage.createdAt,
                        data.lastMessage._id,
                        0, // isUserExitedFromGroup
                        "", // friendId
                        1, // isNotificationAllow
                        "", // owner
                        data.allow,
                        0, // islock
                        data.isPublic ? 1 : 0,
                        data.isHide ? 1 : 0,
                        data.isChatListDelete ? 1 : 0,
                        ispin,
                      ],

                      async () => {
                        socket.emit("joinRoom", {
                          roomId: data._id,
                          userId: globalThis.userChatId,
                        });
                      },
                      (error) => {
                        console.error("Failed to insert room:", error);
                      }
                    );
                  }
                } catch (error) {
                  console.log("error while inserting room >>>>>> ", error);
                }
              },
              (err) => {
                console.log("err >>>>>>>>>>>>>", err);
              }
            );
          } catch (error) {
            console.log(">>>>Errrr", error);
          }
        });

        // ********************* INSERTING ROOMMEMBERS AND UPDATING ROOMS ********************
        insertdata.roomMembers.forEach((data) => {
          const newMembers = data.members.filter((f) => f.user != null);

          if (data.room_type == "single" && newMembers.length < 2) {
            return;
          }

          membersCount[data.roomId] = newMembers.filter(
            (m) => m.isRemoved == false
          ).length;
          const mydata = newMembers.filter((f) => f.user._id == useridddd);

          let friendId = 0;
          if (data.room_type == "single") {
            const currentUserIdx = newMembers.findIndex(
              (f) => f.user._id == useridddd
            );
            if (currentUserIdx >= 0) {
              friendId = currentUserIdx ? 0 : 1;
            }
          }
          let friend = newMembers[Number(friendId)];
          let name = "";
          let image = "";
          let isHide = false;
          let isRemoved = false;
          let isMute = false;
          let aliasName = "";
          let aliasImage = "";
          let isLock = 0;
          if (data.room_type == "single") {
            name = friend.user.name;
            image = friend.user.image;
          }
          // Example insert statement
          if (mydata.length) {
            isHide = mydata[0].isArchived;
            isRemoved = mydata[0].isRemoved;
            isMute = mydata[0].isNotificationAllowed;
            aliasName = mydata[0].aliasName;
            aliasImage = mydata[0].aliasImage;
            isLock = mydata[0].isLock;
          }

          let sId = "";
          if (data.room_type == "single") {
            let first = Number.parseInt(
              String(newMembers[0].user.phone_number).substr(-10)
            );
            let second = Number.parseInt(
              String(newMembers[1].user.phone_number).substr(-10)
            );
            if (first > second) {
              sId = second + "_" + first;
            } else {
              sId = first + "_" + second;
            }

            tx.executeSql(
              "UPDATE RoomSql SET sId = ?,roomName = ?, roomImage  = ? WHERE roomId = ?",
              [sId, name, image, data.roomId],
              () => {},
              (err) => {
                console.log("", err);
              }
            );
          }

          const currentUserIdx = newMembers.findIndex(
            (m) => m.user._id == globalThis.userChatId
          );
          const isUserRemovedFromRoom = newMembers[currentUserIdx].isRemoved;
          const removedOnDate = newMembers[currentUserIdx].removedOn;

          for (let member of newMembers) {
            if (data.room_type != "single" && member.isRemoved == true) {
              continue;
            }

            if (
              isUserRemovedFromRoom &&
              new Date(member.addedOn).getTime() >=
                new Date(removedOnDate).getTime()
            ) {
              continue;
            }

            tx.executeSql(
              "INSERT OR REPLACE INTO RoomMembers (mongoId,userId,name,image,phone_number,roomId, isAdmin,joinedOn) VALUES (?, ?, ?, ?, ?, ?,?,?)", // Define your table schema here
              [
                data.roomId + "-" + member.user._id,
                member.user._id,
                member.user.name || member.user.phone_number,
                member.user.image ||
                  "https://tokeecorp.com/backend/public/images/user-avatar.png",
                Number(member.user.phone_number),
                data.roomId,
                member.isAdmin ? 1 : 0,
                new Date(member.addedOn).getTime(),
              ],
              (tx) => {
                tx.executeSql(
                  "UPDATE RoomSql SET unseenMessageCount = ?,isNotificationAllowed=?,owner=?,isLock=?,aliasName=?,aliasImage=?,archive=?,isUserExitedFromGroup=?,friendId=?",
                  [
                    0,
                    isMute ? 1 : 0,
                    data.owner,
                    isLock,
                    aliasName,
                    aliasImage,
                    isHide ? 1 : 0,
                    isRemoved ? 1 : 0,
                    friend.user._id,
                  ],
                  () => {
                    console.log(">>>>>>>>>>>> inserting room members");
                  },
                  (error) => {
                    console.log("error : ", error);
                  }
                );
              },
              (error) => {
                console.log("", error);
              }
            );
          }
        });

        insertdata.chats.forEach((chat) => {
          const totalMembers = membersCount[chat.roomId];
          let status = "sent";
          if (chat.seenCount >= totalMembers - 1) {
            status = "seen";
          } else if (chat.deliveredCount >= totalMembers - 1) {
            status = "delivered";
          }

          if (totalMembers == 1) {
            status = "sent";
          }

          if (chat.from == null) {
            return;
          }

          tx.executeSql(
            "SELECT disappearMsgTime FROM Chatmessages WHERE mId = ?",
            [chat._id],
            (_, results) => {
              let currentDisappearTime = null;
              if (results.rows.length > 0) {
                currentDisappearTime = results.rows.item(0)?.disappearMsgTime;
              }
              tx.executeSql(
                "INSERT OR REPLACE INTO Chatmessages (mId,roomId,fromUser,userName, phoneNumber, message ,message_type ,attachment ,isBroadcastMessage ,isDeletedForAll ,parent_message ,isForwarded ,storyId ,isStoryRemoved ,resId ,broadcastMessageId ,seenCount ,deliveredCount, status, createdAt ,updatedAt, unreadCount, shouldDisappear,disappearTime,disappearMsgTime,reactions  ) VALUES ( ?,?, ?, ?, ?, ?, ?, ?,? ,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", // Define your table schema here
                [
                  chat._id,
                  chat.roomId,
                  chat.from._id,
                  chat.from.name,
                  chat.from.phone_number,
                  chat.message,
                  chat.message_type,
                  JSON.stringify(chat.attachment),
                  chat.isBroadcastMessage,
                  chat.isDeletedForAll,
                  JSON.stringify(chat.parent_message),
                  chat.isForwarded,
                  chat.storyId,
                  chat.isStoryRemoved,
                  chat.resId,
                  chat.broadcastMessageId,
                  chat.seenCount,
                  chat.deliveredCount,
                  status,
                  new Date(chat.createdAt).getTime(),
                  chat.updatedAt,
                  chat.unreadCount,
                  chat.shouldDisappear ? 1 : 0,
                  chat?.disappearTime,
                  currentDisappearTime,
                  JSON.stringify(chat?.reactions) || "[]",
                ],
                async () => {
                  console.log("Inserting Message");
                },
                (error) => {
                  console.log("", error);
                }
              );
            }
          );
        });
        insertdata.blocks.forEach((data) => {
          tx.executeSql(
            "INSERT INTO blockusers (fromuser,touser) VALUES (?,?)",
            [data.from, data.to],
            () => {
              console.log("inserted blocks");
            },
            (err) => {
              console.log("insert blocks failed ", err);
            }
          );
        });
        // });
      },
      (err) => console.log(">>>>initial error", err)
    );
  } catch (err) {
    console.log("error : ", err);
  }
};

// POPUP window modulle WORK
export const getRoomIdFromRes = async (number1, number2, callback) => {
  try {
    let currentUserPhoneNumber = number1;
    let friendUserPhoneNumber = number2;

    currentUserPhoneNumber = Number.parseInt(
      currentUserPhoneNumber.substr(-10)
    );
    friendUserPhoneNumber = Number.parseInt(friendUserPhoneNumber.substr(-10));

    let localRoomId = "";
    if (currentUserPhoneNumber < friendUserPhoneNumber) {
      localRoomId = currentUserPhoneNumber + "_" + friendUserPhoneNumber;
    } else {
      localRoomId = friendUserPhoneNumber + "_" + currentUserPhoneNumber;
    }

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * from RoomSql WHERE sId = ? LIMIT 1",
        [localRoomId],
        (tx, result) => {
          if (result.rows.length > 0) {
            return callback(result.rows.item(0));
          } else {
            callback(false);
            return false;
          }
        },
        (err) => {
          callback(false);
          console.log("ddddddddddddd", err);
          return false;
        }
      );
    });
  } catch (error) {
    console.log("ddddddddddddderror", error);
    return false;
  }
};

export const getRoomIdFromResforbarcode = async (
  number1,
  number2,
  callback
) => {
  try {
    let currentUserPhoneNumber = number1;
    let friendUserPhoneNumber = number2;

    currentUserPhoneNumber = Number.parseInt(
      currentUserPhoneNumber.substr(-10)
    );
    friendUserPhoneNumber = Number.parseInt(friendUserPhoneNumber.substr(-10));

    let localRoomId = "";
    if (currentUserPhoneNumber < friendUserPhoneNumber) {
      localRoomId = currentUserPhoneNumber + "_" + friendUserPhoneNumber;
    } else {
      localRoomId = friendUserPhoneNumber + "_" + currentUserPhoneNumber;
    }
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * from RoomSql WHERE sId = ? LIMIT 1",
        [localRoomId],
        (tx, result) => {
          if (result.rows.length > 0) {
            return callback(result.rows.item(0), true);
          } else {
            callback({}, false);
            return false;
          }
        },
        (err) => {
          callback(false);
          console.log("ddddddddddddd", err);
          return false;
        }
      );
    });
  } catch (error) {
    return false;
  }
};

//for media download work -dinki
export const updateLocalPathInChatMessages = (
  messageId,
  localPath,
  callback
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM Chatmessages WHERE mId = ? LIMIT 1",
      [messageId],
      (tx, res) => {
        if (res.rows.length > 0) {
          // message found
          const message = res.rows.item(0);

          try {
            // updating local paths
            let newLocalPathsString = "[]";
            if (message.localPath && JSON.parse(message.localPath).length > 0) {
              const localPaths = JSON.parse(message.localPath);
              if (!localPaths.includes(localPath)) {
                localPaths.push(localPath);

                newLocalPathsString = JSON.stringify(localPaths);
              } else {
                newLocalPathsString = JSON.stringify(localPaths);
              }
            } else {
              newLocalPathsString = JSON.stringify([localPath]);
            }
            tx.executeSql(
              "UPDATE Chatmessages SET localPath = ? WHERE mId = ?",
              [newLocalPathsString, messageId],
              () => {
                // updated
                callback(true);
              },
              (err) => {
                console.log("", err);
                // not updated got some error.

                callback(false);
              }
            );
          } catch (err) {
            console.log("error : ", err);
            callback(false);
          }
        } else {
          console.log("message not Found");
        }
      }
    );
  });
};

// export const updateLocalPathInChannelMessages = (
//   messageId,
//   localPath,
//   callback
// ) => {
//   console.log("wwwwwwwwwww", messageId,
//   localPath)
//   db.transaction((tx) => {
//     tx.executeSql(
//       "SELECT * FROM ChannelMessages WHERE mId = ? LIMIT 1",
//       [messageId],
//       (tx, res) => {
//         if (res.rows.length > 0) {
//           // message found
//           const message = res.rows.item(0);

//           try {
//             // updating local paths
//             let newLocalPathsString = "[]";
//             if (message.localPath && JSON.parse(message.localPath).length > 0) {
//               const localPaths = JSON.parse(message.localPath);
//               if (!localPaths.includes(localPath)) {
//                 localPaths?.push(localPath);

//                 newLocalPathsString = JSON.stringify(localPaths);
//               } else {
//                 newLocalPathsString = JSON.stringify(localPaths);
//               }
//             } else {
//               newLocalPathsString = JSON.stringify([localPath]);
//             }
//             console.log("newLocalPathsString",newLocalPathsString)
//             tx.executeSql(
//               "UPDATE ChannelMessages SET localPath = ? WHERE mId = ?",
//               [newLocalPathsString, messageId],
//               () => {
//                 // updated
//                 callback(true);
//               },
//               (err) => {
//                 console.log("", err);
//                 // not updated got some error.

//                 callback(false);
//               }
//             );
//           } catch (err) {
//             console.log("error : ", err);
//             callback(false);
//           }
//         } else {
//           console.log("message not Found");
//         }
//       }
//     );
//   });
// };

export const updateLocalPathInChannelMessages = (
  messageId,
  localPath,
  callback
) => {
  console.log("wwwwwwwwwww", messageId, localPath);

  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM ChannelMessages WHERE mId = ? LIMIT 1",
      [messageId],
      (tx, res) => {
        if (res.rows.length > 0) {
          // message found
          const message = res.rows.item(0);

          try {
            // Handle case when message.localPath is invalid
            let localPaths = [];

            if (message.localPath) {
              try {
                localPaths = JSON.parse(message.localPath) || [];
              } catch (e) {
                console.error("Error parsing localPath JSON: ", e);
              }
            }

            // Ensure it's an array before pushing
            if (!Array.isArray(localPaths)) {
              localPaths = [];
            }

            // Update only if localPath doesn't already exist in the array
            if (!localPaths.includes(localPath)) {
              localPaths.push(localPath);
            }

            const newLocalPathsString = JSON.stringify(localPaths);
            console.log("newLocalPathsString", newLocalPathsString);

            tx.executeSql(
              "UPDATE ChannelMessages SET localPath = ? WHERE mId = ?",
              [newLocalPathsString, messageId],
              () => {
                // Updated successfully
                callback(true);
              },
              (err) => {
                console.log("Error updating localPath: ", err);
                // Update failed
                callback(false);
              }
            );
          } catch (err) {
            console.log("Error in transaction: ", err);
            callback(false);
          }
        } else {
          console.log("Message not found");
        }
      }
    );
  });
};
//for media download work -dinki
export const removeLocalPathInChatMessages = (
  messageId,
  preLocalPath,
  callback
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM Chatmessages WHERE mId = ? LIMIT 1",
      [messageId],
      (tx, res) => {
        if (res.rows.length > 0) {
          // message found
          const message = res.rows.item(0);

          try {
            // updating local paths
            let newLocalPathsString = "[]";
            if (message.localPath) {
              let localPaths = JSON.parse(message.localPath);

              localPaths = localPaths.filter((path) => path != preLocalPath);

              newLocalPathsString = JSON.stringify(localPaths);
            } else {
              newLocalPathsString = JSON.stringify([preLocalPath]);
            }

            tx.executeSql(
              "UPDATE Chatmessages SET localPath = ? WHERE mId = ?",
              [newLocalPathsString, messageId],
              () => {
                // updated
                callback(true);
              },
              (err) => {
                console.log("", err);
                // not updated got some error.

                callback(false);
              }
            );
          } catch (err) {
            callback(false);
          }
        } else {
          console.log("message not Found");
        }
      }
    );
  });
};

//for media download work -dinki
export const replaceLocalPathInChatMessages = (
  messageId,
  preLocalPath,
  newLocalPath,
  callback
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM Chatmessages WHERE mId = ? LIMIT 1",
      [messageId],
      (tx, res) => {
        console.log("res.rows", res.rows);
        if (res.rows.length > 0) {
          // message found
          const message = res.rows.item(0);

          try {
            // updating local paths
            let newLocalPathsString = "[]";
            if (message.localPath) {
              let localPaths = JSON.parse(message.localPath);

              // localPaths = localPaths.filter(path => path != preLocalPath);
              const idx = localPaths.findIndex((path) => path == preLocalPath);
              if (idx >= 0) {
                localPaths[idx] = newLocalPath;
              }

              newLocalPathsString = JSON.stringify(localPaths);
            } else {
              newLocalPathsString = JSON.stringify([newLocalPath]);
            }

            tx.executeSql(
              "UPDATE Chatmessages SET localPath = ? WHERE mId = ?",
              [newLocalPathsString, messageId],
              () => {
                // updated
                callback(true);
              },
              (err) => {
                // not updated got some error.
                console.log("unable to update local path", err);
                callback(false);
              }
            );
          } catch (err) {
            console.log("error : ", err);
            callback(false);
          }
        } else {
          console.log("message not Found");
        }
      }
    );
  });
};

export const replaceLocalPathInChannelMessages = (
  messageId,
  preLocalPath,
  newLocalPath,
  callback
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM ChannelMessages WHERE mId = ? LIMIT 1",
      [messageId],
      (tx, res) => {
        if (res.rows.length > 0) {
          // message found
          const message = res.rows.item(0);

          try {
            // updating local paths
            let newLocalPathsString = "[]";
            if (message.localPath) {
              let localPaths = JSON.parse(message.localPath);

              // localPaths = localPaths.filter(path => path != preLocalPath);
              const idx = localPaths.findIndex((path) => path == preLocalPath);
              if (idx >= 0) {
                localPaths[idx] = newLocalPath;
              }

              newLocalPathsString = JSON.stringify(localPaths);
            } else {
              newLocalPathsString = JSON.stringify([newLocalPath]);
            }

            tx.executeSql(
              "UPDATE ChannelMessages SET localPath = ? WHERE mId = ?",
              [newLocalPathsString, messageId],
              () => {
                // updated
                callback(true);
              },
              (err) => {
                // not updated got some error.
                console.log("unable to update local path", err);
                callback(false);
              }
            );
          } catch (err) {
            console.log("error : ", err);
            callback(false);
          }
        } else {
          console.log("message not Found");
        }
      }
    );
  });
};

// export const alterTableForMongoId = (tableName, callback) => {};

//for media download work -dinki
export const addColumnIfNotExists = (
  tableName,
  columnName,
  columnType,
  defaultValue,
  callback
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `PRAGMA table_info(${tableName});`,
      [],
      (tx, results) => {
        let columnExists = false;
        for (let i = 0; i < results.rows.length; i++) {
          if (results.rows.item(i).name === columnName) {
            columnExists = true;
            break;
          }
        }

        if (!columnExists) {
          tx.executeSql(
            `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType} DEFAULT ${defaultValue}`,
            [],
            () => {
              callback();
            },
            (error) => {
              console.log(`Error adding column: ${error.message}`);
            }
          );
        } else {
          callback();
        }
      },
      (error) => {
        console.log("Error checking table info: ", error.message);
      }
    );
  });
};

export const getOtherPersonLastMessage = (roomId, currentUserId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT mId FROM Chatmessages WHERE roomId = ? AND fromUser != ? ORDER BY resId DESC LIMIT 1",
      [roomId, currentUserId],
      (tx, res) => {
        if (res.rows.length > 0) {
          callback(true, res.rows.item(0).mId);
        } else {
          callback(false, "");
        }
      },
      (err) => {
        console.log("error : ", err);
      }
    );
  });
};

//yash work
export const addMembersToRoomMembersSql = async (members, roomId, callback) => {
  try {
    // Get current member ids from members array
    const memberIds = members.map(
      (member) => roomId + "-" + member.chat_user_id
    );

    // Start transaction
    db.transaction((tx) => {
      // Delete members that are not in the updated list
      tx.executeSql(
        `DELETE FROM RoomMembers WHERE roomId = ? AND mongoId NOT IN (${memberIds
          .map(() => "?")
          .join(",")})`,
        [roomId, ...memberIds],
        () => {
          // Insert or update members
          members.forEach((member, index) => {
            tx.executeSql(
              "INSERT OR REPLACE INTO RoomMembers (mongoId, userId, name, image, phone_number, roomId, isAdmin) VALUES (?,?,?,?,?,?,?)",
              [
                roomId + "-" + member.chat_user_id,
                member.chat_user_id,
                member.contact_name,
                member.profile_image,
                Number(member.phone_number),
                roomId,
                member.isAdmin ? 1 : 0,
              ],
              () => {
                if (index === members.length - 1) {
                  // Callback after the last member is processed
                  callback();
                }
              },
              (err) => {
                // Handle error if needed
                console.error("Error executing SQL:", err);
              }
            );
          });
        },
        (err) => {
          // Handle error if needed
          console.error("Error executing SQL:", err);
        }
      );
    });
  } catch (error) {
    console.error("Error in addMembersToRoomMembersSql:", error);
    return false;
  }
};

export const addMembersToRoomMembersSqlnew = async (
  members,
  roomId,
  callback
) => {
  try {
    const totalMembers = members.length;
    let completedCount = 0;
    db.transaction((tx) => {
      members.forEach((member) => {
        tx.executeSql(
          "INSERT OR REPLACE INTO RoomMembers (mongoId, userId, name, image, phone_number, roomId, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            roomId + "-" + member?.chat_user_id,
            member?.chat_user_id,
            member?.contact_name,
            member?.profile_image,
            Number(member?.phone_number),
            roomId,
            member?.isAdmin ? 1 : 0,
          ],
          (_, result) => {
            completedCount++;
            if (completedCount === totalMembers) {
              callback(); // Invoke callback when all members have been inserted
            }
          },
          (err) => {
            console.log("Error executing SQL:", err);
            // Handle error as needed
          }
        );
      });
    });
  } catch (error) {
    console.log("Error in transaction:", error);
    return false; // Return false or handle error as needed
  }
};

export const addMemberToRoomMembersSql = (member, roomId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT OR REPLACE INTO RoomMembers (mongoId,userId,name,image,phone_number,roomId,isAdmin) VALUES (?,?,?,?,?,?,?)",
      [
        roomId + "-" + member.chat_user_id,
        member.chat_user_id,
        member.contact_name,
        member.profile_image,
        Number(member.phone_number),
        roomId,
        member.isAdmin ? 1 : 0,
      ],
      () => {
        console.log("updatedddddd");
        callback();
      },
      (err) => {
        console.log("", err);
        return false;
      }
    );
  });
};

//piyush work

export const addMemberToChannelRoomMembersSql = (member, roomId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT OR REPLACE INTO ChannelRoomMembers (mongoId,userId,name,image,channelId,joinedOn,premium) VALUES (?,?,?,?,?,?,?)",
      [
        roomId + "-" + member.userId,
        member.userId,
        member.name,
        member.image,
        roomId,
        Date.now(),
        member.premium,
      ],
      () => {
        console.log("updatedddddd");
        callback();
      },
      (err) => {
        console.log("", err);
        return false;
      }
    );
  });
};

export const removeMemberFromChannelRoomMembersSql = (
  userId,
  channelId,
  callback
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM ChannelRoomMembers WHERE userId = ? AND channelId = ?",
      [userId, channelId],
      () => {
        console.log("Member removed successfully");
        callback();
      },
      (err) => {
        console.log("Error removing member:", err);
        return false;
      }
    );
  });
};

export const addMembersToChannelRoomMembersSql = async (
  members,
  channelId,
  callback
) => {
  try {
    const totalMembers = members.length;
    let completedCount = 0;
    db.transaction((tx) => {
      members.forEach((member) => {
        tx.executeSql(
          "INSERT OR REPLACE INTO ChannelRoomMembers (mongoId, userId, name, image,channelId,joinedOn,premium) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            channelId + "-" + member?._id,
            member?._id,
            member?.name,
            member?.image,
            channelId,
            Date.now(),
            member.premium,
          ],
          (_, result) => {
            completedCount++;
            if (completedCount === totalMembers) {
              console.log("succeessssfull insertttt");
              callback(); // Invoke callback when all members have been inserted
            }
          },
          (err) => {
            console.log("Error executing SQL:", err);
            // Handle error as needed
          }
        );
      });
    });
  } catch (error) {
    console.log("Error in transaction:", error);
    return false; // Return false or handle error as needed
  }
};

export const insertToChannelRoomMembersSql = async (
  members,
  channelId,
  callback
) => {
  try {
    const totalMembers = members.length;
    let completedCount = 0;

    db.transaction((tx) => {
      // First, delete existing members for the specified channelId
      tx.executeSql(
        "DELETE FROM ChannelRoomMembers WHERE channelId = ?",
        [channelId],
        () => {
          console.log(`Deleted members for channelId: ${channelId}`);

          // Now, insert the new members
          members.forEach((member) => {
            tx.executeSql(
              "INSERT INTO ChannelRoomMembers (mongoId, userId, name, image, channelId, joinedOn, premium) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [
                channelId + "-" + member?._id,
                member?._id,
                member?.name,
                member?.image,
                channelId,
                Date.now(),
                member?.premium,
              ],
              (_, result) => {
                completedCount++;
                if (completedCount === totalMembers) {
                  // console.log("Successfully inserted all members.",);
                  callback(); // Invoke callback when all members have been inserted
                }
              },
              (err) => {
                console.log("Error executing SQL insert:", err);
                // Handle error as needed
              }
            );
          });
        },
        (err) => {
          console.log("Error executing SQL delete:", err);
          // Handle error as needed
        }
      );
    });
  } catch (error) {
    console.log("Error in transaction:", error);
    return false; // Return false or handle error as needed
  }
};

export const updateUserAdminStatus = (userId, roomId, isAdmin, callback) => {
  try {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "UPDATE RoomMembers SET isAdmin = ? WHERE roomId = ? AND userId = ?",
          [isAdmin, roomId, userId],
          (res) => {
            callback(res);
          }
        );
      },
      (err) => {
        console.log("error : ", err);
      }
    );
  } catch (error) {
    console.log("error : ");
  }
};

export const getOldMembersFromRoomMembersSql = (roomId, callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT DISTINCT rm.member_id, rm.*, rm.name as userName ,rooms.owner,rooms.roomImage, rooms.allow, rooms.roomName as groupName, rooms.isPublic as isPublic, ct.name as name, rm.name as roomName 
        FROM RoomMembers as rm 
        LEFT JOIN ContactTable AS ct ON substr(replace(rm.phone_number, '.0', ''), -10) = substr(replace(ct.phone_number, '.0', ''), -10) LEFT JOIN RoomSql AS rooms ON rooms.roomId = rm.roomId WHERE rm.roomId = ? GROUP BY rm.member_id ORDER BY CASE WHEN rooms.owner = '1' THEN 0 ELSE 1 END, userName`,
        [roomId],
        (tx, result) => {
          const members = [];
          for (let i = 0; i < result.rows.length; i++) {
            if (Platform.OS == "ios") {
              members.push({
                ...result.rows.item(i),
                phone_number: result.rows
                  .item(i)
                  .phone_number.replace(/\.0$/, ""),
              });
            } else {
              members.push(result.rows.item(i));
            }
          }
          callback(members);
        },
        (err) => {
          console.log("err", err);
        }
      );
    });
  } catch (error) {
    console.log("err", error);
    return false;
  }
};

export const getMembersFromRoomMembersSql = async (
  roomId,
  limit,
  offset,
  callback
) => {
  try {
    // Assuming globalThis.userChatId is accessible and holds the current user's ID
    const currentUserId = globalThis.userChatId;

    db.transaction((tx) => {
      // Query to get the total count of members
      tx.executeSql(
        `SELECT COUNT(*) AS totalCount FROM RoomMembers WHERE roomId = ?`,
        [roomId],
        (tx, result) => {
          const totalCount = result.rows.item(0).totalCount;

          // Query to get the paginated members
          tx.executeSql(
            `SELECT DISTINCT rm.member_id,rm.premium, rm.userId, rm.name AS userName, 
                    rm.phone_number, rm.image, rm.isAdmin, 
                    rooms.owner, rooms.roomImage, rooms.allow, 
                    rooms.roomName AS groupName, rooms.isPublic 
             FROM RoomMembers AS rm 
             LEFT JOIN RoomSql AS rooms ON rooms.roomId = rm.roomId 
             LEFT JOIN ContactTable AS ct ON 
                    rm.phone_number = ct.phone_number 
             WHERE rm.roomId = ? 
             ORDER BY 
               CASE WHEN rm.userId = rooms.owner THEN 0 
                    WHEN rm.userId = ? THEN 1 
                    ELSE 2 
               END, 
               rm.name 
             LIMIT ? OFFSET ?`,
            [roomId, currentUserId, limit, offset],
            (tx, result) => {
              const members = [];
              for (let i = 0; i < result.rows.length; i++) {
                const member = result.rows.item(i);
                if (Platform.OS === "ios") {
                  member.phone_number = member.phone_number.replace(/\.0$/, "");
                }
                members.push(member);
              }
              // Pass both members and total count to the callback
              callback(members, totalCount);
            },
            (err) => {
              console.log("Error:", err);
            }
          );
        },
        (err) => {
          console.log("Error:", err);
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    return false;
  }
};

export const getMembersFromChannelRoomMembersSql = async (
  roomId,
  limit,
  offset,
  callback
) => {
  try {
    // Assuming globalThis.userChatId is accessible and holds the current user's ID
    // const currentUserId = globalThis.userChatId;

    db.transaction((tx) => {
      // Query to get the total count of members
      tx.executeSql(
        `SELECT COUNT(*) AS totalCount FROM ChannelRoomMembers WHERE channelId = ?`,
        [roomId],
        (tx, result) => {
          const totalCount = result.rows.item(0).totalCount;
          console.log("totalCount", totalCount);

          // Query to get the paginated members
          tx.executeSql(
            `SELECT DISTINCT member_id, premium, userId, name, image FROM ChannelRoomMembers 
             WHERE channelId = ?
             ORDER BY name 
             LIMIT ? OFFSET ?`,
            [roomId, limit, offset], // Only pass the necessary parameters
            (tx, result) => {
              const members = [];
              for (let i = 0; i < result.rows.length; i++) {
                const member = result.rows.item(i);
                members.push(member);
              }
              // Pass both members and total count to the callback
              callback(members, totalCount);
            },
            (err) => {
              console.log("Error executing member query:", err);
            }
          );
        },
        (err) => {
          console.log("Error executing count query:", err);
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    return false;
  }
};

export const getMembersFromRoomMembersSqlforSidebar = async (
  roomId,
  limit,
  offset,
  callback
) => {
  try {
    db.transaction((tx) => {
      // Query to get the total count of members
      tx.executeSql(
        `SELECT COUNT(*) AS totalCount FROM RoomMembers WHERE roomId = ?`,
        [roomId],
        (tx, result) => {
          const totalCount = result.rows.item(0).totalCount || 0; // Ensure totalCount is initialized
          // Query to get the paginated members
          tx.executeSql(
            `SELECT DISTINCT rm.member_id, rm.userId, rm.name AS userName, 
                    rm.phone_number, rm.image, rm.isAdmin, 
                    rooms.owner, rooms.roomImage, rooms.allow, 
                    rooms.roomName AS groupName, rooms.isPublic 
             FROM RoomMembers AS rm 
             LEFT JOIN RoomSql AS rooms ON rooms.roomId = rm.roomId 
             LEFT JOIN ContactTable AS ct ON rm.phone_number = ct.phone_number 
             WHERE rm.roomId = ? 
             ORDER BY 
               CASE 
                 WHEN rm.userId = ? THEN 0 
                 ELSE 1 
               END, 
               rm.name 
             LIMIT ? OFFSET ?`,
            [roomId, globalThis.userChatId, limit, offset],
            (tx, result) => {
              const members = [];
              for (let i = 0; i < result.rows.length; i++) {
                const member = result.rows.item(i);
                if (Platform.OS === "ios") {
                  member.phone_number = member.phone_number.replace(/\.0$/, "");
                }
                members.push(member);
              }
              // Pass both members and total count to the callback
              callback(members, totalCount);
            },
            (err) => {
              console.log("Error executing member query:", err);
            }
          );
        },
        (err) => {
          console.log("Error counting members:", err);
        }
      );
    });
  } catch (error) {
    console.log("Error in transaction:", error);
    return false;
  }
};

export const getMembersFromRoomMembersSqlsearch = async (
  roomId,
  searchText,
  callback
) => {
  try {
    db.transaction((tx) => {
      // Query to get the total count of members
      tx.executeSql(
        `SELECT COUNT(*) AS totalCount FROM RoomMembers WHERE roomId = ?`,
        [roomId],
        (tx, result) => {
          const totalCount = result.rows.item(0).totalCount;

          // Query to get all members matching the search criteria
          tx.executeSql(
            `SELECT DISTINCT rm.member_id, rm.userId, rm.name AS userName, 
                    rm.phone_number, rm.image, 
                    rooms.owner, rooms.roomImage, rooms.allow, 
                    rooms.roomName AS groupName, rooms.isPublic 
             FROM RoomMembers AS rm 
             LEFT JOIN RoomSql AS rooms ON rooms.roomId = rm.roomId 
             LEFT JOIN ContactTable AS ct ON rm.phone_number = ct.phone_number 
             WHERE rm.roomId = ? AND (rm.name LIKE '%' || ? || '%' OR rm.phone_number LIKE '%' || ? || '%') 
             ORDER BY CASE WHEN rooms.owner = '1' THEN 0 ELSE 1 END, rm.name`,
            [roomId, searchText, searchText],
            (tx, result) => {
              const members = [];
              for (let i = 0; i < result.rows.length; i++) {
                const member = result.rows.item(i);
                if (Platform.OS === "ios") {
                  member.phone_number = member.phone_number.replace(/\.0$/, "");
                }
                members.push(member);
              }
              // Pass both members and total count to the callback
              callback(members, totalCount);
            },
            (err) => {
              console.log("Error:", err);
            }
          );
        },
        (err) => {
          console.log("Error:", err);
        }
      );
    });
  } catch (error) {
    console.log("Error:", error);
    return false;
  }
};

export const removeAllMembersFromRoomMembersSql = (roomId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM RoomMembers WHERE roomId=?",
      [roomId],
      (tx, result) => {
        callback(result);
      },
      (error) => {
        console.log("Delete Members Got a problem : ", error);
      }
    );
  });
};

export const updateMessageStatusbyId = async (data, callback) => {
  let status = "sent";
  if (data.seenCount >= data.totalMembers - 1) {
    status = "seen";
  } else if (data.deliveredCount >= data.totalMembers - 1) {
    status = "delivered";
  }

  if (data.totalMembers == 1) {
    status = "sent";
  }

  if (status == "delivered") {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Chatmessages SET status = ? WHERE roomId = ? AND status = ?",
        ["delivered", data.roomId, "sent"],
        (_, res) => {
          callback(res);
        },
        (err) => {
          console.log("errr", err);
        }
      );
    });
  } else if (status == "seen") {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Chatmessages SET status = ? WHERE roomId = ? AND (status = ? OR status = ?)",
        ["seen", data.roomId, "sent", "delivered"],
        (_, res) => {
          callback(res);
        }
      );
    });
  } else {
    await db.transaction((tx) => {
      tx.executeSql(
        `UPDATE Chatmessages SET seenCount= ?, deliveredCount = ?,status = ? WHERE mId = ?`,
        [data.seenCount, data.deliveredCount, status, data._id],
        (_, result) => {
          callback(result);
        },
        () => {
          return;
        }
      );
    });
  }
};

export const updateRoomUnseenCount = async (roomId, unseenCount) => {
  await db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET unseenMessageCount = ? WHERE roomId = ?",
      [unseenCount, roomId],
      () => {
        return;
      },
      (error) => {
        console.log("errr", error);
        return;
      }
    );
  });
};

export const getUserDetails = async (userPhoneNumber, userId, callback) => {
  userPhoneNumber = Number(
    String(userPhoneNumber).replace(" ", "").substr(-10)
  );

  if (userId == globalThis.chatUserId) {
    callback({
      contact_name: globalThis.displayName,
      phone_number: userPhoneNumber,
    });
    return;
  }

  getContacts();

  await db.transaction((tx) => {
    tx.executeSql(
      `SELECT ct.name as contact_name, ct.phone_number as phone_number FROM ContactTable as ct WHERE substr(replace(ct.phone_number, '.0', ''), -10) = '${userPhoneNumber}'`,
      [],
      (tx, res) => {
        if (res.rows.length > 0) {
          callback(res.rows.item(0));
        } else {
          callback({
            contact_name: userPhoneNumber,
            phone_number: userPhoneNumber,
          });
        }
      },
      (error) => {
        console.log("errr", error);
      }
    );
  });
};

// Temparory Work
export const getRooms = () => {
  try {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM RoomSql", [], (tx, result) => {
        const rooms = [];
        for (let i = 0; i < result.rows.length; ++i) {
          rooms.push(result.rows.item(i));
        }
      });
    });
  } catch (error) {
    console.log("errr", error);
  }
};

export const getTotalChats = () => {
  try {
    db.transaction((tx) => {
      tx.executeSql("SELECT COUNT(*) FROM Chatmessages", [], (tx, res) => {
        console.log("total chats : ", res.rows.item(0));
      });
    });
  } catch (error) {
    return;
  }
};

export const getRoomMembers = (roomId) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM roomMembers WHERE roomId = ?",
        [roomId],
        (tx, result) => {
          const roomMembers = [];
          for (let i = 0; i < result.rows.length; ++i) {
            roomMembers.push(result.rows.item(i));
          }

          console.table(roomMembers);
        }
      );
    });
  } catch (error) {
    console.log("", error);
  }
};

export const getChats = (roomId) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Chatmessages WHERE roomId = ? ORDER BY resId DESC LIMIT 150",
        [roomId],
        (tx, result) => {
          const roomMembers = [];
          for (let i = 0; i < result.rows.length; ++i) {
            roomMembers.push(result.rows.item(i));
          }
        }
      );
    });
  } catch (error) {
    return;
  }
};

// export const getChannelChats = (roomId, callback) => {
//   console.log("room id :", roomId);  // Ensure roomId is correct
//   try {
//     db.transaction((tx) => {
//       tx.executeSql(
//         "SELECT * FROM ChannelMessages WHERE channelId = ? AND isDeletedForAll = 0",
//         [roomId],
//         (tx, result) => {
//           console.log("Result length:", result.rows.length);  // Log number of rows

//           const messages = [];
//           for (let i = 0; i < result.rows.length; i++) {
//             const messageItem = result.rows.item(i);
//             try {
//               messageItem.attachment = JSON.parse(messageItem.attachment);
//               console.log("Message Reactions >>>>",messageItem.reactions)
//               messageItem.reactions = JSON.parse(messageItem.reactions);
//             } catch (error) {
//               console.log("Error parsing attachment:", error);
//               messageItem.attachment = []; // Fallback to an empty array if parsing fails
//             }

//             try {
//               messageItem.localPath = JSON.parse(messageItem.localPath);
//             } catch (error) {
//               console.log("Error parsing localPath:", error);
//               messageItem.localPath = []; // Fallback to an empty array if parsing fails
//             }
//             console.log("Fetched message:", messageItem);  // Log each message item
//             messages.push(messageItem);
//           }

//           console.log("messages: in get chanel chats", messages);
//           callback(messages);
//         },
//         (error) => {
//           console.log("Error in query execution:", error);  // Log any query errors
//         }
//       );
//     });
//   } catch (error) {
//     console.log("Error in getChannelChats:", error);  // Log any try-catch errors
//     return;
//   }
// };

export const getChannelChats = (roomId, offset, limit, callback) => {
  console.log("Fetching channel chats");
  console.log("Room ID:", roomId, "Offset:", offset, "Limit:", limit); // Ensure roomId, offset, and limit are correct

  // Input validation
  if (!roomId || typeof offset !== "number" || typeof limit !== "number") {
    console.error("Invalid parameters for getChannelChats");
    callback([]);
    return;
  }

  try {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ChannelMessages 
         WHERE channelId = ? AND isDeletedForAll = 0
         ORDER BY createdAt DESC
         LIMIT ? OFFSET ?`,
        [roomId, limit, offset],
        (tx, result) => {
          console.log(
            "Query executed successfully. Result length:",
            result.rows.length
          ); // Log number of rows

          const messages = [];
          for (let i = 0; i < result.rows.length; i++) {
            const messageItem = result.rows.item(i);

            try {
              // Parse attachment and reactions
              messageItem.attachment = JSON.parse(
                messageItem.attachment || "[]"
              );
              messageItem.reactions = JSON.parse(messageItem.reactions || "[]");
            } catch (error) {
              console.error(
                "Error parsing attachment or reactions for message ID:",
                messageItem.mId,
                error
              );
              messageItem.attachment = [];
              messageItem.reactions = [];
            }

            try {
              // Parse localPath
              messageItem.localPath = JSON.parse(messageItem.localPath || "[]");
            } catch (error) {
              console.error(
                "Error parsing localPath for message ID:",
                messageItem.mId,
                error
              );
              messageItem.localPath = [];
            }

            messages.push(messageItem);
          }

          // Callback with the processed messages
          callback(messages);
        },
        (error) => {
          console.error("Error executing query in getChannelChats:", error); // Log query error
          callback([]); // Return empty array on failure
        }
      );
    });
  } catch (error) {
    console.error("Error in getChannelChats transaction:", error); // Log transaction error
    callback([]);
  }
};

export const getContacts = () => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM ContactTable",
        [],
        (tx, result) => {
          const roomMembers = [];
          for (let i = 0; i < result.rows.length; ++i) {
            roomMembers.push(result.rows.item(i));
          }
        },
        (err) => {
          console.log("errr", err);
        }
      );
    });
  } catch (error) {
    console.log("", error);
  }
};

export const getPendingMessages = (socket, callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT cs.*, rl.roomName, rl.roomImage, rl.roomType, rl.owner FROM Chatmessages as cs LEFT JOIN RoomSql as rl ON rl.roomId = cs.roomId WHERE status=? ",
        [""],
        (tx, result) => {
          const pendings = [];
          for (let i = 0; i < result.rows.length; ++i) {
            let data = result.rows(i);
            if (socket) {
              const paramsOfSendforlive = {
                mId: data.mId,

                userName: globalThis.displayName,

                userImage: globalThis.image,
                roomId: data.roomId,
                roomName: data.roomName,
                roomImage: data.roomImage,
                roomType: data.roomType,

                roomOwnerId: data.owner,
                message: data.message,
                message_type: data.message_type,
                roomMembers: [],
                parent_message_id: data.parent_message,
                attachment: JSON.parse(data.attachment),

                from: globalThis.userChatId,
                resId: data.resId,
                createdAt: new Date(),
                phoneNumber: globalThis.phone_number,
              };

              socket.emit("sendmessage", paramsOfSendforlive);
            }
            pendings.push(result.rows.item(i));
          }
          callback(pendings);
        },
        (err) => {
          console.log("errr", err);
        }
      );
    });
  } catch (error) {
    console.log("", error);
  }
};

export const changeAliasName = (room, name, image, callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE RoomSql SET aliasName = ?, aliasImage = ? WHERE roomId = ?",
        [name, image, room],
        () => {
          callback(true);
        },
        (err) => {
          console.log("errr", err);
          callback(false);
        }
      );
    });
  } catch (error) {
    console.log("", error);
  }
};

export const lockChat = (room, lock, callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE RoomSql SET isLock = ? WHERE roomId = ?",
        [lock, room],
        () => {
          callback(true);
        },
        (err) => {
          console.log("", err);
          callback(false);
        }
      );
    });
  } catch (error) {
    console.log("", error);
  }
};

export const getIsLock = (room, callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT isLock FROM RoomSql WHERE roomId = ? LIMIT 1",
        [room],
        (tx, result) => {
          if (result.rows.length > 0) {
            callback(result.rows.item(0).isLock);
          }
        },
        (err) => {
          callback(err);
        }
      );
    });
  } catch (error) {
    callback(error);
  }
};

export const setSeenCount = (room, prevMsg, user, callback) => {
  try {
    db.transaction((tx) => {
      if (prevMsg == "all") {
        tx.executeSql(
          "SELECT joinedOn FROM RoomMembers WHERE roomId = ? AND userId = ?",
          [room, user],
          (tx, res) => {
            tx.executeSql(
              "UPDATE Chatmessages SET unreadCount = CASE WHEN unreadCount > 0 THEN unreadCount - 1 ELSE unreadCount END WHERE roomId = ? AND fromUser != ? AND createdAt > ?",
              [room, user, res.rows.item(0).joinedOn],
              "UPDATE Chatmessages SET unreadCount = CASE WHEN unreadCount > 0 THEN unreadCount - 1 ELSE unreadCount END WHERE roomId = ? AND fromUser != ? AND createdAt > ?",
              [room, user, res.rows.item(0).joinedOn],
              () => {
                callback("done");
              },
              (err) => {
                callback(err);
              }
            );
          },
          (err) => {
            callback(err);
          }
        );
      } else {
        tx.executeSql(
          "SELECT createdAt FROM Chatmessages WHERE roomId = ? AND mId = ? LIMIT 1",
          [room, prevMsg],
          (tx, result) => {
            if (result.rows.length > 0) {
              tx.executeSql(
                "UPDATE Chatmessages SET unreadCount = CASE WHEN unreadCount > 0 THEN unreadCount - 1 ELSE unreadCount END WHERE fromUser != ? AND createdAt > ?",
                [user, result.rows.item(0).createdAt],
                () => {
                  callback("done");
                },
                (err) => callback(err)
              );
            } else {
              callback("Message not found.");
            }
          },
          (err) => {
            callback(err);
          }
        );
      }
    });
  } catch (error) {
    callback(error);
  }
};

export const getTotalMembers = (room, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT COUNT(member_id) as total FROM RoomMembers WHERE roomId = ?",
      [room],
      (tx, result) => {
        if (result.rows.length > 0) {
          callback(result.rows.item(0).total - 1);
        } else {
          callback(false);
        }
      },
      (err) => {
        console.log("errr", err);
        callback(false);
      }
    );
  });
};

export const clearMessages = (ids, callback) => {
  let mids = ids.map((id) => `'${id}'`).join(",");
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM Chatmessages WHERE mId IN (${mids})`,
      [],
      () => {
        callback(true);
      },
      (err) => {
        console.log("error : ", err);
        callback(false);
      }
    );
  });
};

export const getDisapperMessage = (callback) => {
  try {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM Chatmessages WHERE shouldDisappear = ?`,
        ["1"],
        (tx, result) => {
          const disappers = [];
          for (let i = 0; i < result.rows.length; i++) {
            let data = result.rows.item(i);
            disappers.push({
              mId: data.mId,
              message_type: data.message_type,
              roomId: data.roomId,
            });
          }
          callback(disappers);
        },
        (err) => {
          console.log("errr", err);
          callback(false);
        }
      );
    });
  } catch (error) {
    console.log("errrrrrrrr", error);
  }
};

export const updateblockuser = (contact, opt, callback) => {
  db.transaction((tx) => {
    if (opt == "insert") {
      tx.executeSql(
        "INSERT INTO blockusers (fromuser,touser) VALUES (?,?)",
        [contact.fromuser, contact.touser],
        (tx, res) => {
          tx.executeSql("SELECT * FROM blockusers", [], (tx, res) => {
            const resss = [];
            for (let i = 0; i < res.rows.length; i++) {
              resss.push(res.rows.item(i));
            }
          });
          callback({ res: res, status: true });
        },
        (err) => {
          console.log("err", err);
        }
      );
    } else if (opt == "remove") {
      tx.executeSql(
        "DELETE FROM blockusers WHERE fromuser=? AND touser = ?",
        [contact.fromuser, contact.touser],
        (tx, res) => {
          tx.executeSql("SELECT * FROM blockusers", [], (tx, res) => {
            const resss = [];
            for (let i = 0; i < res.rows.length; i++) {
              resss.push(res.rows.item(i));
            }
          });
          callback({ res: res, status: true });
        },
        (err) => {
          console.log("err", err);
        }
      );
    } else {
      callback({ status: false });
    }
  });
};

export const CheckIsRoomBlocked = (friendId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM blockusers WHERE (touser='${friendId}' AND fromuser='${globalThis.chatUserId}') OR (fromuser='${friendId}' AND touser='${globalThis.chatUserId}') `,
      [],
      (tx, res) => {
        if (res.rows.length > 0) {
          callback(true);
        } else {
          callback(false);
        }
      },
      (err) => {
        console.log("err", err);
      }
    );
  });
};

export const CheckIsRoomsBlocked = (data, callback) => {
  const totalData = data.length;
  let counter = 0;
  const finalResult = [];
  data.forEach((d) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM blockusers WHERE (touser='${d.call_members[0]._id}' AND fromuser='${globalThis.chatUserId}') OR (fromuser='${d.call_members[0]._id}' AND touser='${globalThis.chatUserId}') `,
        [],
        (tx, res) => {
          if (res.rows.length > 0) {
            finalResult.push({ ...d, isBlocked: true });
          } else {
            finalResult.push({ ...d, isBlocked: false });
          }
          counter++;
          if (counter == totalData) {
            callback(finalResult);
          }
        },
        (err) => {
          console.log("err", err);
        }
      );
    });
  });
};

export const CheckIsRoomsBlockedforfriendlist = (data, callback) => {
  const totalData = data.length;
  let counter = 0;
  const finalResult = [];
  data.forEach((d) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM blockusers WHERE (touser='${d.chat_user_id}' AND fromuser='${globalThis.chatUserId}') OR (fromuser='${d.chat_user_id}' AND touser='${globalThis.chatUserId}') `,
        [],
        (tx, res) => {
          if (res.rows.length > 0) {
            finalResult.push({ ...d, isBlocked: true });
          } else {
            finalResult.push({ ...d, isBlocked: false });
          }
          counter++;
          if (counter == totalData) {
            callback(finalResult);
          }
        },
        (err) => {
          console.log("err", err);
        }
      );
    });
  });
};

export const DeleteTheGroup = (roomId) => {
  db.transaction((tx) => {
    tx.executeSql(`BEGIN TRANSACTION;`);

    tx.executeSql(
      "DELETE FROM RoomSql WHERE roomId = ?",
      [roomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.log("RoomSql update error", error);
      }
    );

    tx.executeSql(
      "DELETE FROM RoomMembers WHERE roomId = ?",
      [roomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.log("RoomMembers delete error", error);
      }
    );

    tx.executeSql(
      "DELETE FROM Chatmessages WHERE roomId = ?",
      [roomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.log("Chatmessage delete error", error);
      }
    );

    tx.executeSql(`COMMIT;`);
  });
};

export const DeleteTheChannel = (roomId) => {
  db.transaction((tx) => {
    tx.executeSql(`BEGIN TRANSACTION;`);

    tx.executeSql(
      "DELETE FROM ChannelInformation WHERE channelId = ?",
      [roomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.log("RoomSql update error", error);
      }
    );

    tx.executeSql(
      "DELETE FROM ChannelRoomMembers WHERE channelId = ?",
      [roomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.log("RoomMembers delete error", error);
      }
    );

    tx.executeSql(
      "DELETE FROM ChannelMessages WHERE channelId = ?",
      [roomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.log("Chatmessage delete error", error);
      }
    );

    tx.executeSql(`COMMIT;`);
  });
};

export const getRoomMedia = (roomId, type, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM Chatmessages WHERE message_type=? AND roomId=? AND isDeletedForAll = ?",
      [type, roomId, 0],
      (tx, res) => {
        const result = [];
        for (let i = 0; i < res.rows.length; i++) {
          let localPath = [];
          try {
            localPath = JSON.parse(res.rows.item(i).localPath);
          } catch (error) {
            localPath = [];
          }

          result.push({ ...res.rows.item(i), localPath });
        }
        callback(result);
      }
    );
  });
};

//getchannelmedia
export const getChannelMedia = (channelId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT attachment, message_type, localPath FROM ChannelMessages WHERE channelId = ?",
      [channelId],
      (tx, res) => {
        let filteredMessages = [];

        for (let i = 0; i < res.rows.length; i++) {
          let row = res.rows.item(i);

          // Check if the message_type is one of the required types
          if (
            ["image", "document", "video", "audio"].includes(row.message_type)
          ) {
            let attachments = [];
            let localPaths = [];

            try {
              attachments = JSON.parse(row.attachment); // Parse attachment JSON
            } catch (error) {
              attachments = [];
            }

            try {
              localPaths = JSON.parse(row.localPath); // Parse localPath JSON
            } catch (error) {
              localPaths = [];
            }

            // Update row with parsed attachments and local paths
            filteredMessages.push({
              ...row,
              attachment: attachments,
              localPath: localPaths,
            });
          }
        }

        // Pass the filtered messages to the callback
        callback(filteredMessages);
      }
    );
  });
};

export const HideTheGroup = (data) => {
  let hide = data.isHide ? 1 : 0;
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET isHide = ? WHERE roomId = ?",
      [hide, data.roomId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.log("Room hide error", error);
      }
    );
  });
};

export const HideTheChannel = (data) => {
  let hide = data.isHide ? 1 : 0;
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE ChannelInformation SET isHide = ? WHERE channelId = ?",
      [hide, data.channelId],
      null, // You can pass null or undefined if you want to explicitly indicate no callback.
      (error) => {
        console.log("Room hide error", error);
      }
    );
  });
};

export const getUnseenChannelMessageCount = (
  roomId,
  lastMessageTime,
  callback
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT COUNT(*) as count FROM ChannelMessages WHERE channelId = ? AND fromUser != ? AND createdAt > '${lastMessageTime}'`,
      [roomId, globalThis.chatUserId],
      (tx, res) => {
        callback(res.rows.item(0));
      },
      (err) => {
        console.log("err", err);
      }
    );
  });
};

export const updateChannelUnseenMessageCount = (roomId, givenUnseenCount) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE ChannelInformation SET unseenMessageCount = ? WHERE channelId = ?",
      [givenUnseenCount?.count, roomId],
      () => {
        console.log("unread count updated successfullly in channel.");
      },
      (error) => {
        console.log("error of updating unseenmessage count  ", error);
      }
    );
  });
};

// export const incrementUnseenMessageCount = (channelId, callback) => {
//   db.transaction((tx) => {
//     // Step 1: Retrieve the current unseenMessageCount
//     tx.executeSql(
//       "SELECT unseenMessageCount FROM ChannelInformation WHERE channelId = ?",
//       [channelId],
//       (tx, res) => {
//         if (res.rows.length > 0) {
//           let currentCount = res.rows.item(0).unseenMessageCount;
//             // console.log("current count>>>>>",res.rows.item(0))
//           // Step 2: Increment the unseenMessageCount
//           const query = `
//             UPDATE ChannelInformation
//             SET unseenMessageCount = unseenMessageCount + 1
//             WHERE channelId = ?
//           `;
// if (currentCount == null || currentCount == undefined || currentCount == 0) {
//   currentCount = 0;
// }
//           tx.executeSql(query, [channelId], (tx, updateRes) => {
//             if (updateRes.rowsAffected > 0) {
//               // Callback with the previous unseenMessageCount and a success flag
//               callback(currentCount, true);
//             } else {
//               callback(currentCount, false); // Failed to update unseenMessageCount
//             }
//           });
//         } else {
//           callback(null, false); // No matching channelId found
//         }
//       }
//     );
//   });
// };

export const getUnseenMessageCount = (roomId, lastMessageTime, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT COUNT(*) as count FROM Chatmessages WHERE roomId = ? AND fromUser != ? AND resId > '${new Date(
        lastMessageTime
      ).getTime()}'`,
      [roomId, globalThis.chatUserId],
      (tx, res) => {
        callback(res.rows.item(0));
      },
      (err) => {
        console.log("err", err);
      }
    );
  });
};

export const updateUnseenMessageCount = (
  roomId,
  givenUnseenCount,
  callback
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE RoomSql SET unseenMessageCount = ? WHERE roomId = ?",
      [givenUnseenCount?.count, roomId],
      () => {
        // Call the callback with success status
        if (callback) callback(null, "updateUnseenMessageCount successful");
      },
      (error) => {
        console.log("Error updating unseen message count: ", error);
        // Call the callback with error status
        if (callback) callback(error);
      }
    );
  });
};

export const saveMediaToLocal = async (
  roomId,
  messageId,
  mediaUrl,
  localPath,
  callback
) => {
  try {
    let mediaName = mediaUrl.split("/").pop();
    let mediaId = mediaName.split(".").slice(0, -1).join(".");
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT OR REPLACE INTO mediaDownload (roomId, mId,localPath, mediaId) VALUES (?,?,?,?)",
        [roomId, messageId, localPath, mediaId],
        () => {
          callback(true);
        },
        (err) => {
          console.log("Error on Saving Local Path", err);
        }
      );
    });
  } catch (error) {
    console.log("SaveMediaLocalPath Error : ", error);
  }
};

export const getMediaFromLocal = async (messageId, mediaId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT localPath FROM mediaDownload WHERE mId = ? AND mediaId = ?",
      [messageId, mediaId],
      (tx, res) => {
        callback(res.rows.item(0));
      },
      (error) => {
        console.log("error : ", error);
      }
    );
  });
};

export const removeMediaFromLocal = async (messageId, mediaId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM mediaDownload WHERE mId = ? AND mediaId = ?",
      [messageId, mediaId],
      () => {
        callback(true);
      },
      (err) => {
        console.log("errr", err);
      }
    );
  });
};

export const UpdateProfileImage = async (roomId, imageUrl, callback) => {
  db.transaction((tx) => {
    // Update room image based on roomId
    tx.executeSql(
      "UPDATE RoomSql SET roomImage = ? WHERE roomType = ? AND roomId = ?",
      [imageUrl, "single", roomId],
      () => {
        console.log("Room image updated successfully in RoomSql");
        callback(true);
      },
      (err) => {
        console.log("Error updating profile image in RoomSql: ", err);
        callback(false);
      }
    );

    // Update room member image based on roomId
    tx.executeSql(
      "UPDATE RoomMembers SET image = ? WHERE roomId = ? AND image != ?",
      [imageUrl, roomId, imageUrl],
      () => {
        // console.log("Room member image updated successfully in RoomMembers");
        callback(true);
      },
      (err) => {
        // console.log("Error updating profile image in RoomMembers: ", err);
        callback(false);
      }
    );
  });
};

export const UpdateIsPremium = async (roomId, premium, callback) => {
  db.transaction((tx) => {
    // Update isPremium status in RoomSql based on roomId
    tx.executeSql(
      "UPDATE RoomSql SET premium = ? WHERE roomType = ? AND roomId = ?",
      [premium, "single", roomId],
      () => {
        callback(true);
      },
      (err) => {
        //console.log("Error updating premium in RoomSql: ", err);
        callback(false);
      }
    );

    // Update isPremium status in RoomMembers based on roomId
    tx.executeSql(
      "UPDATE RoomMembers SET premium = ? WHERE roomId = ?",
      [premium, roomId],
      () => {
        callback(true);
      },
      (err) => {
        // console.log("Error updating premium in RoomMembers: ", err);
        callback(false);
      }
    );
  });
};

export const UpdateIsDaimond = async (roomId, isDiamonds, callback) => {
  db.transaction((tx) => {
    // Update isPremium status in RoomSql based on roomId
    tx.executeSql(
      "UPDATE RoomSql SET isDiamonds = ? WHERE roomType = ? AND roomId = ?",
      [isDiamonds, "single", roomId],
      () => {
        callback(true);
      },
      (err) => {
        // console.log("Error updating isDiamonds in RoomSql: ", err);
        callback(false);
      }
    );

    // Update isPremium status in RoomMembers based on roomId
    tx.executeSql(
      "UPDATE RoomMembers SET isDiamonds = ? WHERE roomId = ?",
      [isDiamonds, roomId],
      () => {
        callback(true);
      },
      (err) => {
        console.log("Error updating isDiamonds in RoomMembers: ", err);
        callback(false);
      }
    );
  });
};

export const getPublicRoomCount = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT COUNT(*) AS public_room_count FROM RoomSql WHERE isPublic = 1 AND isUserExitedFromGroup = 0",
      [], // No parameters needed
      (tx, result) => {
        // Successfully received data
        const count = result.rows.item(0).public_room_count;
        if (callback) {
          callback(count);
        }
      },
      (tx, error) => {
        // Handle errors
        console.log("Room count error", error);
      }
    );
  });
};

export const getTableDataByRoomId = async (roomId, callback) => {
  await db.transaction(async (tx) => {
    await tx.executeSql(
      `SELECT DISTINCT rl.id, rl.*, ct.name AS contactName, latestMessage.message as lastMessage, latestMessage.createdAt as lastMessageTime, latestMessage.message_type as lastMessageType, latestMessage.mId as lastMessageId, latestMessage.isDeletedForAll as isLatestMessageDeleted
       FROM RoomSql AS rl
       LEFT JOIN (SELECT roomId, mId, message, message_type, createdAt,isDeletedForAll, MAX(createdAt) FROM Chatmessages GROUP BY roomId) as latestMessage ON rl.roomId = latestMessage.roomId
       LEFT JOIN ContactTable AS ct ON substr(replace(rl.roomName, '.0', ''), -10) = substr(replace(ct.phone_number, '.0', ''), -10)
       WHERE rl.isHide = '0' AND rl.roomId = ?
       GROUP BY rl.id`,
      [roomId],
      async (_, results) => {
        try {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            let contactName = results.rows.item(i).contactName;
            let roomName = results.rows.item(i).roomName?.replace(".0", "");
            temp.push({
              ...results.rows.item(i),
              roomName: roomName,
              contactName: contactName,
            });
          }

          callback(temp);
        } catch (error) {
          console.log(">>>>>Errrr", error);
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
        callback([]); // Handle errors by passing an empty array or specific error indicator
      }
    );
  });
};
