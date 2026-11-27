import { IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { checkmarkCircle, flameOutline } from 'ionicons/icons';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="ion-padding">
          <div className="camp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>Welcome back</strong>
              <p style={{ margin: '2px 0 0', color: '#7a6a58' }}>Your campsite log is up to date</p>
            </div>
            <IonIcon icon={checkmarkCircle} color="primary" style={{ fontSize: 28 }} aria-hidden="true" />
          </div>
          <div className="camp-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>Pitches Logged</strong>
              <p style={{ margin: '2px 0 0', color: '#7a6a58' }}>Plan your next pitch by preference</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <strong style={{ fontSize: '1.6rem', color: '#2f5d3a' }}>0</strong>
              <IonIcon icon={flameOutline} color="secondary" aria-hidden="true" />
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
