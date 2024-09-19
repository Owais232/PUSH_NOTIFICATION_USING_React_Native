import React, { useEffect } from 'react';
import { Text, View, Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

const App = () => {
  useEffect(() => {
    const requestUserPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission not granted');
            return;
          }
        }

        const authorizationStatus = await messaging().requestPermission();
        if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
          console.log('Authorization status:', authorizationStatus);
          const token = await messaging().getToken();
          console.log('FCM Token:', token);
        } else {
          console.log('Permission not granted');
        }
      } catch (error) {
        console.error('Error requesting permissions or getting token:', error);
      }
    };

    requestUserPermission();

    // Fmessage handle
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      try {
        console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
        Toast.show({
          type: 'success',
          position: 'top',
          text1: remoteMessage.notification?.title || 'New Notification',
          text2: remoteMessage.notification?.body || 'You have a new notification',
        });
      } catch (error) {
        console.error('Error handling foreground message:', error);
      }
    });

    // Background message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      try {
        console.log('Message handled in the background!', remoteMessage);
      } catch (error) {
        console.error('Error handling background message:', error);
      }
    });

    // Token refresh listener
    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeOnMessage();
      unsubscribeOnTokenRefresh();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 25 }}>
        PUSH NOTIFICATIONS PRACTICE
      </Text>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

export default App;
