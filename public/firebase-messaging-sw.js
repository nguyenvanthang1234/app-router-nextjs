importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js')

const firebaseConfig = {
  apiKey: 'AIzaSyBrCecHaXDyoNsmmP88KJ5w5ErIykFCQqk',
  authDomain: 'test-803dd.firebaseapp.com',
  projectId: 'test-803dd',
  storageBucket: 'test-803dd.firebasestorage.app',
  messagingSenderId: '520963978150',
  appId: '1:520963978150:web:92ac4e12f3d9fc6fcdd567',
  measurementId: 'G-ZZGJDN0XD6'
}
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig)
// eslint-disable-next-line no-undef
const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: './logo.png'
  }
  self.registration.showNotification(notificationTitle, notificationOptions)
})
