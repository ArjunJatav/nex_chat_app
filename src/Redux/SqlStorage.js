// final Merge

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { openDatabase } from "react-native-sqlite-storage";

var db = openDatabase({ name: "UserDatabase.db" });

const initialState = {
  user: [],
  roomData: [],
};

export const createTableSql = createAsyncThunk(
  "slice/createTableSql",
  async ({ paramsOfSend, chatRoom }, { dispatch }) => {
    let data = paramsOfSend;
    let sql =
      "INSERT INTO table_user (resId, userName,userImage,roomId,roomName,roomImage,roomType,roomOwnerId,roomMembers,parent_message_id,parent_message,message_type,attachment,isNotificationAllowed,archive,fromUser,createdAt,deletedFor,deliveredCount,isBroadcastMessage,isDeletedForAll,isForwarded,message,seenCount,status,updatedAt,messageTime,lastMessage,broadcastMessageId,seenBy,isUserExitedFromGroup,friendId,time,undeliveredMessageCount,unseenMessageCount,message_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    let params = [
      data?.result?.resId || data?.resId, // resId
      data?.result?.roomName || data?.roomName, // userName
      data?.result?.roomImage || data?.roomImage, // userImage or roomImage
      data?.result?.roomId || data?.roomId, // roomId
      data?.result?.roomName || data?.roomName, // roomName
      data?.result?.roomImage || data?.roomImage, // roomImage
      data?.result?.roomType || data?.roomType, // roomType
      data?.result?.roomOwnerId || data?.roomOwnerId, // roomOwnerId
      data?.result?.roomMembers || data?.roomMembers, // roomMembers
      data?.result?.parent_message_id || data?.parent_message_id, // parent_message_id
      data?.result?.parent_message || data?.parent_message, // parent_message
      data?.result?.message_type || data?.message_type, // message_type
      data?.result?.attachment?.join(",") || data?.attachment?.join(","), // attachment
      data?.result?.isNotificationAllowed || data?.isNotificationAllowed, // isNotificationAllowed
      data?.result?.isArchived === false
        ? 0
        : 1 || data?.isArchived === false
        ? 0
        : 1, // isArchived
      data?.result?.fromUser || data?.from, // fromUser
      data?.result?.createdAt || data?.createdAt, // createdAt
      data?.result?.deletedFor?.join(",") || data?.deletedFor?.join(","), // deletedFor
      data?.result?.deliveredCount || data?.deliveredCount, // deliveredCount
      data?.result?.isBroadcastMessage || data?.isBroadcastMessage, // isBroadcastMessage
      data?.result?.isDeletedForAll || data?.isDeletedForAll, // isDeletedForAll
      data?.result?.isForwarded || data?.isForwarded, // isForwarded
      data?.result?.message || data?.message, // message
      data?.result?.seenCount || data?.seenCount, // seenCount
      chatRoom ? "" : "sent", // status
      data?.result?.updatedAt || data?.updatedAt, // updatedAt
      data?.result?.messageTime || data?.messageTime, // messageTime
      data?.result?.lastMessage || data?.lastMessage, // lastMessage
      data?.result?.broadcastMessageId || data?.broadcastMessageId, // broadcastMessageId
      data?.result?.seenBy?.join(",") || data?.seenBy?.join(","), // seenBy
      data?.result?.isUserExitedFromGroup || data?.isUserExitedFromGroup, // isUserExitedFromGroup
      data?.result?.friendId || data?.friendId, // friendId
      data?.result?.time || data?.time, // time
      data?.result?.undeliveredMessageCount || data?.undeliveredMessageCount, // undeliveredMessageCount
      data?.result?.unseenMessageCount || data?.unseenMessageCount, // unseenMessageCount
      data?.result?._id || data?._id, // message_id
    ];
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM table_user WHERE resId = ?`,
        [data?.result?.resId || data?.resId],
        (result, resp) => {
          var temp = [];
          for (let i = 0; i < resp.rows.length; ++i) {
            temp.push(resp.rows.item(i));
          }
          if (temp.length == 0) {
            tx.executeSql(
              sql,
              params,
              (result) => {
                console.log("locallllllllll", "User created successfully.");
              },
              (error) => {
                console.log("Create user error :=== ", error.message);
              }
            );
          } else {
            tx.executeSql(
              `UPDATE table_user SET status="sent",lastMessage='${
                data?.result?.lastMessage
              }',message_id='${data?.result?._id}',messageTime='${
                data?.result?.messageTime
              }',unseenMessageCount='${
                data?.result?.unseenMessageCount
              }',undeliveredMessageCount='${
                data?.result?.undeliveredMessageCount
              }'',roomId='${data?.result?.roomId}'',roomName='${
                data?.result?.roomName
              }'',roomImage='${data?.result?.roomImage}'',roomType='${
                data?.result?.roomType
              }'',roomOwnerId='${data?.result?.roomOwnerId}' WHERE resId = ${
                data?.result?.resId //    1698908785494
              }`,
              [],
              (result, resp) => {
                console.log("update database data checking ======= ", resp);
              },
              (error) => {
                console.log("user update data error :=== ", error.message);
              }
            );
          }
        },
        (error) => {
          console.log("get user error :=== ", error.message);
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM table_user`,
        [],
        (result, resp) => {
          var temp = [];
          for (let i = 0; i < resp.rows.length; ++i) {
            temp.push(resp.rows.item(i));
          }
        },
        (error) => {
          console.log("getting all user data error :=== ", error.message);
        }
      );
    });
  }
);

export const sqlSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    userActivityCall: (state, action) => {
      state.roomData = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createTableSql.pending, (state, action) => {})
      .addCase(createTableSql.fulfilled, (state, action) => {})
      .addCase(createTableSql.rejected, (state, action) => {});
  },
});

export const { userActivityCall } = sqlSlice.actions;

export default sqlSlice.reducer;
