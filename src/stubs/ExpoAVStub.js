// Web stub for expo-av
export const Audio = {
  requestPermissionsAsync: async () => ({ granted: true }),
  setAudioModeAsync: async () => {},
  Recording: class {
    async prepareToRecordAsync() {}
    setProgressUpdateInterval() {}
    setOnRecordingStatusUpdate() {}
    async startAsync() {}
    async stopAndUnloadAsync() {}
  }
};
