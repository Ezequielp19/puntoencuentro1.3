import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {

  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "670473542620-km8omco3g4gd6enh0vd26bl5q51ukcvv.apps.googleusercontent.com",
      forceCodeForRefreshToken: false
    }
  },

  appId: 'com.encuentro',
  appName: 'Punto Encuentro',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000'
    }
  }
};

export default config;
