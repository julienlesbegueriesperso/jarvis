import { useState } from 'react';
import { View, StyleSheet, Button, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
const FormData = require('form-data');


export default function App() {
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [touchableStatus, setTouchableStatus] = useState("ready")

  async function startRecording() {
    console.log("start recording")
    setTouchableStatus("started")
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( 
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setTouchableStatus("stopped")
    setRecording(undefined);
    recording.stopAndUnloadAsync().then(_ => {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      }).then( async __ => {
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);
        
        const formData = new FormData();
        console.log(formData)
        formData.append('sound',uri);
        const response = await FileSystem.uploadAsync("http://100.109.89.118:9901/m4a", uri, {
          fieldName: 'sound',
          httpMethod: 'POST',
          mimeType: "audio/m4a",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        });
        console.log("RESPONSE")
        setTouchableStatus("ready")
        console.log(JSON.stringify(response, null, 4));
        Speech.speak(response.body);
      })
    })
    
   }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.touchable, 
          touchableStatus==="ready"?styles.touchableready:touchableStatus==="started"?styles.touchablestarted:styles.touchablestopped]}
        onPressIn={startRecording} onPressOut={stopRecording}
      >
      <Text> Button </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },

  touchable: {
    width: "100%",
    height:"100%"
  },

  touchablestarted: {
    backgroundColor: "red"
  },
  touchablestopped: {
    backgroundColor: "yellow"
  },
  touchableready: {
    backgroundColor: 'green'
  }
});
