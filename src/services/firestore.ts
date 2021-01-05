import { fromEvent, Observable, ReplaySubject, BehaviorSubject} from 'rxjs'
import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyDw0vg8LlwP9e5g9iKVMXOxQhBO_eO50LY",
  authDomain: "collaboration-109d2.firebaseapp.com",
  databaseURL: "https://collaboration-109d2-default-rtdb.firebaseio.com",
  projectId: "collaboration-109d2",
  storageBucket: "collaboration-109d2.appspot.com",
  messagingSenderId: "43770580592",
  appId: "1:43770580592:web:5d0e1672d6ecb447e9eeb5",
  measurementId: "G-QHFN2LCYER"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export class Collaboration {
  static instance: any = null;
  static createInstance() {
    let object = new Collaboration();
    return object;
  }

  static getInstance() {
    if (!Collaboration.instance) {
      Collaboration.instance = Collaboration.createInstance();
    }
    return Collaboration.instance;
  }

  currentRemoteDescription: any;
  peerConnection: any;
  roomRef: any;
  db: any;
  channel: any;
  currentPeer: any;
  sub: any;
  connected: boolean = false;
  constructor() {
    this.peerConnection = new RTCPeerConnection();
    this.channel = this.peerConnection.createDataChannel('chat', { ordered: true });
    this.registerPeerConnectionListeners();
    this.db = firebase.firestore();
    this.sub = new BehaviorSubject(this.connected);
  }
  sendMessage(message: string) {
    if(!message || !this.connected){
      return;
    }
    this.channel.send(message);
  }
  async roomChecking(roomName: string) {
    this.roomRef = this.db.collection('rooms').doc(roomName);
    const roomSnapshot = await this.roomRef.get();
    if (roomSnapshot.exists) {
      this.joinRoom();
    } else {
      this.createRoom(roomName);
    }
  }
  async createRoom(roomName: string) {
    this.currentPeer = 'callerCandidates';
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.channel.onmessage = (event: any) => {
      console.log('onmessage==', event.data);
    }
    const roomWithOffer = {
      offer: {
        type: offer.type,
        sdp: offer.sdp
      }
    }
    await this.db.collection('rooms').doc(roomName).set(roomWithOffer);
    this.roomRef = await this.db.collection('rooms').doc(roomName);
    this.roomRef.onSnapshot(async (snapshot: any) => {
      const data = snapshot.data();
      if (!this.peerConnection.currentRemoteDescription && data.answer) {
        const answer = new RTCSessionDescription(data.answer)
        await this.peerConnection.setRemoteDescription(answer);
        this.channel.onopen = (e: any) => console.log("open!!!!");
      }
    });
    // Listen for remote ICE candidates below
    this.roomRef.collection('calleeCandidates').onSnapshot((snapshot:any) => {
      snapshot.docChanges().forEach(async (change:any) => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${ JSON.stringify(data) }`);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // Listen for remote ICE candidates above
  }
  async joinRoom() {
    this.currentPeer = 'calleeCandidates';
    const roomSnapshot = await this.roomRef.get();
    const offer = roomSnapshot.data().offer;
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.peerConnection.ondatachannel = (event: any) => {
      this.channel = event.channel;
      this.channel.onmessage = (event: any) => {
        console.log('onmessage==', event.data);
      }
    }

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp
      }
    }
    await this.roomRef.update(roomWithAnswer);
    // Listening for remote ICE candidates below
    this.roomRef.collection('callerCandidates').onSnapshot((snapshot: any) => {
      snapshot.docChanges().forEach(async (change: any) => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // Listening for remote ICE candidates above
  }
  registerPeerConnectionListeners() {
    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
        `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      console.log(`Connection state change: ${this.peerConnection.connectionState}`);

      if (this.peerConnection.connectionState === 'connected') {
        this.connected = true;
        this.sub.next(this.connected);
      } else {
        this.connected = false;
        this.sub.next(this.connected);
      }
    });

    this.peerConnection.addEventListener('icecandidate', async (event: any) => {
      const calleeCandidatesCollection = this.roomRef.collection(this.currentPeer);
      console.log(event.candidate);
      if (event.candidate) {
        calleeCandidatesCollection.add(event.candidate.toJSON());
      }
    });

    this.peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
    });

    this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(
        `ICE connection state change: ${this.peerConnection.iceConnectionState}`);
    });
  }
}