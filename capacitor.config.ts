import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ethiotrack.app',
  appName: 'EthioTrack',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Preferences: {
      // for local storage
    }
  }
};

export default config;
