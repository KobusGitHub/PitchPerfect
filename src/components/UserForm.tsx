import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useState } from 'react';

import { type AppUser, type UserInput } from '../users/userService';
import { canSaveUser, MIN_PASSWORD_LENGTH } from '../users/validation';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

interface UserFormProps {
  user?: AppUser;
  onSave: (input: UserInput) => Promise<void>;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const isEdit = Boolean(user);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin ?? false);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A new user needs a starting password. When editing, a blank password keeps the current one.
  const valid = canSaveUser({ firstName, lastName, email, password }, isEdit);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        isAdmin,
        ...(password ? { password } : {}),
      });
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onCancel} aria-label="Back">
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{isEdit ? 'Edit user' : 'Add user'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="crew-list">
          <div className="camp-card user-form-card">
            <IonItem>
              <IonInput
                label="First name"
                labelPlacement="stacked"
                value={firstName}
                onIonInput={(e) => setFirstName(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Surname"
                labelPlacement="stacked"
                value={lastName}
                onIonInput={(e) => setLastName(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Email"
                labelPlacement="stacked"
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label={isEdit ? 'New password (leave blank to keep)' : 'Initial password'}
                labelPlacement="stacked"
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonToggle checked={isAdmin} onIonChange={(e) => setIsAdmin(e.detail.checked)}>
                Admin (can manage users)
              </IonToggle>
            </IonItem>
            <div className="ion-padding">
              <IonNote>
                {isEdit
                  ? 'Leave the password blank to keep it unchanged.'
                  : `Give the user this password. They can reset it from the sign-in page. Minimum ${MIN_PASSWORD_LENGTH} characters.`}
              </IonNote>
              {error && (
                <p>
                  <IonNote color="danger">{error}</IonNote>
                </p>
              )}
            </div>
          </div>
        </IonList>
      </IonContent>
      <IonFooter className="user-form-footer">
        <IonToolbar className="user-form-footer">
          <IonButton expand="block" className="camp-primary" disabled={!valid || saving} onClick={() => void submit()}>
            Save
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
};

export default UserForm;
