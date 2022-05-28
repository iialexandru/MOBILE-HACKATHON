import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, TextInput } from 'react-native';
import { useState, useEffect } from 'react'
import QRCode from 'react-native-qrcode-svg'
import * as Application from 'expo-application';
import axios from 'axios'
import Constants from "expo-constants";
import * as Location from 'expo-location';
// import { FallDetectionEmitter, start } from 'react-native-fall-detection-module';
// import { accelerometer } from "react-native-sensors";

export default function App() {
  const { manifest } = Constants;

  const [ text, setText ] = useState(`http://localhost:3000/child-request/decide/${Application.androidId}`);
  const [ showDashboard, setShowDashboard ] = useState(false)

  useEffect(() => {
    if(manifest && typeof manifest !== 'undefined') {
    const uri = `http://${(manifest.debuggerHost || '').split(':').shift()}:9999`;

    const addId = async () => {
      const result2 = await axios.get(`${uri}/api-hkt/add-child/unique-device-id/${Application.androidId}`)
                        .then(res => res.data)
                        .catch(err => console.log(err.response))
    }
    
    addId()

    const verify = async () => {
      const code = Application.androidId
      let error = ''
      const result2 = await axios.post(`${uri}/api-hkt/add-child/verify-is-added`, { code })
                              .then(res => res.data)
                              .catch(err => {
                                if(err && err.response && err.response.data && err.response.data.message === 'Already tracked') {
                                  error = 'Already tracked'
                                }
                              })

      if(error === 'Already tracked') {
          setShowDashboard(true)
      } 
  }

  verify()
}
  }, [])

  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if(manifest && typeof manifest !== 'undefined') {
      const uri = `http://${(manifest.debuggerHost || '').split(':').shift()}:9999`;
      
      const interval = setInterval(async () => {
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          let { status: statusBK } = await Location.requestBackgroundPermissionsAsync();
          if (status !== 'granted' || statusBK !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }
    
          let locationUseEffect = await Location.getCurrentPositionAsync({ accuracy: 5 });
          setLocation(locationUseEffect);
          
          const lat = locationUseEffect.coords.latitude
          const lng = locationUseEffect.coords.longitude
          const result = await axios.post(`${uri}/api-hkt/child/update-geo/${Application.androidId}`, { lat, lng })
                                  .then(res => res.data)
                                  .catch(err => err)
        })();
      }, 10000)
    }
  }, []);



    const [ notification, setNotification ] = useState('')
    const [ loadingNotif, setLoadingNotif ] = useState(false)
    const [ loadingLocation, setLoadingLocation ] = useState(false)
    const [ errorNotif, setErrorNotif ] = useState(false)
    const [ errorLocation, setErrorLocation ] = useState(false)

    const sendNotification = async () => {
      if(manifest && typeof manifest !== 'undefined') {
          setErrorNotif(false)
          const uri = `http://${(manifest.debuggerHost || '').split(':').shift()}:9999`;

          if(!notification.length) {
              setErrorNotif(true)
              return;
          }

          setLoadingNotif(true)
          const result = await axios.post(`${uri}/api-hkt/child-dashboard/send-notification/${Application.androidId}`, { notification }, { withCredentials: true })
                                  .then(res => res.data)
                                  .catch(err => {
                                      console.log(err.response)
                                      setErrorNotif(true)
                                      setLoadingNotif(false)
                                  })

          if(result && result.message === 'Notification created') {
              setLoadingNotif(false)
              setNotification('')
          } else {
              setLoadingNotif(false)
              setErrorNotif(true)
          }
      }
    }


  return (
    <>
      <StatusBar style="auto" />
      {!showDashboard ?
        <View style={styles.container}>
          <Text style={styles.title}>Scan the QR code below to assign the device</Text>
          <>
            <QRCode value={text}  />
          </>
        </View>
      : 
      <>

      <View style={styles.viewContainer}>
          <Text style={styles.fullTitle}>Child Track</Text>
      </View>
        <View style={styles.container_data}>
          <View style={styles.subtitle}>
              <Image source={{ uri: 'https://res.cloudinary.com/multimediarog/image/upload/v1653665507/HACKATHON-FIICODE/filter-6575_ey4yed.svg' }} style={{ width: 35, height: 35 }} />
              <Text>Options</Text>
          </View>

          <View style={styles.notification}>
              <View style={styles.explanation}>
                  <Text style={styles.h2}>Notifications</Text>
                  <Text style={styles.extraInfo}>Write a notification in the input box to the right, so all of your trackers will be alerted</Text>
              </View>
              <View style={styles.input}>
                  {!loadingNotif ?
                      <View style={styles.flexN}>
                          {/* <TextField value={notification} onChange={e => setNotification(e.target.value)} label='Text' size='small' variant='standard' /> */}
                          <TextInput
                            style={styles.textField}
                            onChangeText={setNotification}
                            value={notification}
                            placeholder='AUSHDIAG'
                          />
                          <Button onPress={() => sendNotification()} title='Send' />
                          {/* color: errorNotif ? 'red' : 'white' */}
                      </View>
                  :
                      <Image source={{ uri: 'https://res.cloudinary.com/multimediarog/image/upload/v1653636522/HACKATHON-FIICODE/Dual_Ring-1s-200px_vcmowa.svg' }} style={{ width: 50, height: 50 }} />
                  }
              </View>
          </View>
      </View>
      </>
      }
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DCDFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    marginBottom: 30,
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10
  },
  h2: {
    fontWeight: '800',
    fontSize: 20
  },
  viewContainer: {
    width: '100%',
    height: 70,
    backgroundColor: '#6C63FF',
    paddingLeft: 20,
    paddingTop: 10,
    marginTop: 40,
    display: 'flex'
  },
  fullTitle: {
    marginTop: 0,
    // fontFamily: 'Doppio One',
    fontSize: 40,
    fontWeight: '400',
    display: 'flex',
    alignItems: 'center',
  },
  flexN: {
    display: 'flex',
    flexDirection: 'row',
    flexFlow: 'nowrap'
  },
  container_data: {
    marginTop: 100,
    marginLeft: 10,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  subtitle: {
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: 50,
    // fontFamily: 'Doppio One',
    fontSize: 30,
  },
  notification: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: -150
  },
  explanation: {
    // fontFamily: 'Baloo Bhai 2',
  },
  extraInfo: {
    width: 300,
    color: 'rgb(150, 150, 150)',
  },
  input: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  button: {
    color: 'white',
    background: '#6C63FF',
    border: '1px solid #6C63FF',
    paddingTop: 10,
    paddingBottom: 10,
    height: 10,
    marginLeft: 20,
    borderRadius: 2,
    // fontFamily: 'Baloo Bhai 2',
    cursor: 'pointer',
  },
  textField: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    width: 240,
    padding: 10,
  },
});
