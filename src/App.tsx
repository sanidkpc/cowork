import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonButton, IonContent, IonFooter, IonHeader, IonInput, IonItem, IonMenu, IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { Collaboration } from './services/firestore';
const App: React.FC = () => {
  let collaboration = Collaboration.getInstance();
  const [text, setText] = useState<string>();
  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <IonMenu side="end" contentId="main">
            <IonHeader>
              <IonToolbar>
                <IonTitle>Menu</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              sanidkpc
            </IonContent>
            <IonFooter>
              <IonToolbar>
                <IonItem lines="none">
                  <IonInput value={text} placeholder="Enter Input" onIonChange={e => setText(e.detail.value!)}></IonInput>
                  <IonButton onClick={() => {
                    collaboration.sendMessage(text);
                  }} slot="end">
                    End
                </IonButton>
                </IonItem>
              </IonToolbar>
            </IonFooter>
          </IonMenu>
          <IonRouterOutlet id="main">
            <Route path="/home" component={Home} exact={true} />
            <Route exact path="/" render={() => <Redirect to="/home" />} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  )

};

export default App;
