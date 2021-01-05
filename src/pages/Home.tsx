import { IonAlert, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar, useIonViewDidEnter } from '@ionic/react';
import React, { useState } from 'react';
import './Home.css';
import { Collaboration } from '../services/firestore';
import { useHistory } from 'react-router-dom';
const Home: React.FC = () => {
  const history = useHistory();
  let collaboration = Collaboration.getInstance();
  const [connected, setConnected] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const roomJoin = (roomName: string) => {
    history.push({
      pathname: '/home',
      search: `?room=${roomName}`
    })
    collaboration.roomChecking(roomName);
    collaboration.sub.subscribe((result: any) => {
      setPeerConnected(result);
    })
  }
  useIonViewDidEnter(async () => {
    console.log('ionViewDidEnter event fired');
  });
  const getUrlParameter=(name:string)=>{
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(window.location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Co-work</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Co-work</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonAlert
          isOpen={!connected}
          onDidDismiss={() => setConnected(true)}
          backdropDismiss={false}
          cssClass='my-custom-class'
          header={'Please enter room name'}
          inputs={[
            {
              name: 'name',
              type: 'text',
              placeholder: 'Enter room name'
            },
          ]}
          buttons={[
            {
              text: 'Create or join',
              handler: (value) => {
                if(!value.name){
                  return false;
                }
                roomJoin(value.name);
              }
            }
          ]}
        />
        {!peerConnected && <div className="fullheight xc">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle color="danger">No one's in the room <IonText color="warning">[{ getUrlParameter('room')}]</IonText></IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <p>
                Please <IonText color="warning">Wait </IonText>, until someone <IonText color="success">Join </IonText>
              </p>
              <p className="ion-margin-bottom">
                Invite your friend by sharing this link <IonText className="room-link" color="primary">{window.location.href} <IonButton onClick={() => {
                  const textField = document.createElement('textarea')
                  textField.innerText = window.location.href;
                  document.body.appendChild(textField)
                  textField.select()
                  document.execCommand('copy')
                  textField.remove()
                }} className="copy-button" size="small" color="primary">Copy link</IonButton></IonText>
              </p>
              <p>
                Or this room is <IonText color="danger">Dead </IonText>, Please create another <IonButton onClick={() => {
                  history.go(0)
                }} fill="outline" size="small" color="secondary">Create</IonButton>
              </p>
            </IonCardContent>
          </IonCard>
        </div>}

      </IonContent>
    </IonPage>
  );
};

export default Home;
