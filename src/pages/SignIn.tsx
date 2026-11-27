import { IonAlert, IonButton, IonContent, IonIcon, IonInput, IonItem, IonPage, IonText } from '@ionic/react';
import { bonfireOutline, lockClosedOutline, triangleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import PatchLogo from '../components/PatchLogo';

const SignIn: React.FC = () => {
  const { user, loading, signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    return <Navigate to="/home" replace />;
  }

  const run = async (action: () => Promise<void>, successMessage?: string) => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await action();
      if (successMessage) setInfo(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    void run(() => signIn(email, password));
  };

  const forgotPassword = () => {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    void run(() => resetPassword(email), 'Password reset email sent.');
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="ion-text-center" style={{ paddingTop: 32 }}>
          <PatchLogo size={120} />
          <h1 className="camp-title">Pitch Perfect</h1>
          <p className="camp-subtitle">Sign in to your campsite log</p>
        </div>
        <div className="ion-margin-top">
          <IonItem className="camp-field" lines="none">
            <IonIcon slot="start" icon={triangleOutline} color="secondary" aria-hidden="true" />
            <IonInput
              aria-label="Email"
              placeholder="Email"
              type="email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem className="camp-field" lines="none">
            <IonIcon slot="start" icon={lockClosedOutline} color="secondary" aria-hidden="true" />
            <IonInput
              aria-label="Password"
              placeholder="Password"
              type="password"
              value={password}
              onIonInput={(e) => setPassword(e.detail.value ?? '')}
            />
          </IonItem>
        </div>

        <IonButton expand="block" className="camp-primary" onClick={submit} disabled={busy || !email || !password}>
          <IonIcon slot="end" icon={bonfireOutline} aria-hidden="true" />
          Sign in
        </IonButton>
        <IonButton expand="block" fill="clear" color="medium" onClick={forgotPassword} disabled={busy}>
          Forgot password?
        </IonButton>

        {info && (
          <IonText color="success">
            <p>{info}</p>
          </IonText>
        )}
        <IonAlert
          isOpen={!!error}
          header="Could not continue"
          message={error ?? ''}
          buttons={['OK']}
          onDidDismiss={() => setError(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default SignIn;
