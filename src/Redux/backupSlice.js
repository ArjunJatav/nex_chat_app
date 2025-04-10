import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isBackupInProgress: false,
  isMediaBackupInProgress: false,
  lastBackupDateTime: null,
  fileSize: 0,
  MediafileSize: 0,
  error: null,
  loaderprocess:0,
  ChatUploadProgress:0,
  MediaUploadProgress:0,
  backupsuccessfull:false,
  isEnabled:false
};

export const backupSlice = createSlice({
  name: 'backup',
  initialState,
  reducers: {
    startBackup: (state) => {
      state.isBackupInProgress = true;
      state.error = null;
    },
    backupSuccess: (state, action) => {
      state.isBackupInProgress = false;
      state.lastBackupDateTime = action.payload.dateTime;
      state.fileSize = action.payload.fileSize;
      state.error = null;
    },
    backupmediaSuccess: (state, action) => {
      state.isMediaBackupInProgress = false;
      // state.lastBackupDateTime = action.payload.dateTime;
      state.MediafileSize = action.payload.MediafileSize;
      state.error = null;
    },
    backupFailure: (state, action) => {
      state.isBackupInProgress = false;
      state.error = action.payload;
    },
    setLoaderprocess: (state, action) => {
      state.loaderprocess = action.payload;
    },
    setChatUploadProgress: (state, action) => {
      state.ChatUploadProgress = action.payload;
    },
    setMediaUploadProgress: (state, action) => {
      state.MediaUploadProgress = action.payload;
    },
    setbackupsuccessfull: (state, action) => {
      state.backupsuccessfull = action.payload;
    },
    toggleSwitch: (state, action) => {
      state.isEnabled = action.payload;
    },
  },
});

export const { startBackup, backupSuccess, backupFailure,setLoaderprocess,setbackupsuccessfull,toggleSwitch,backupmediaSuccess,setChatUploadProgress,setMediaUploadProgress } = backupSlice.actions;

export const selectBackup = (state) => state.backup;

export default backupSlice.reducer;
