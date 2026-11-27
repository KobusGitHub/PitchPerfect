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
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useState } from 'react';

import { type CampSite, type CampSiteInput } from '../campsites/campSiteService';
import { canSaveCampSite, SOUTH_AFRICAN_PROVINCES } from '../campsites/validation';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

interface CampSiteFormProps {
  site?: CampSite;
  onSave: (input: CampSiteInput) => Promise<void>;
  onCancel: () => void;
}

const CampSiteForm: React.FC<CampSiteFormProps> = ({ site, onSave, onCancel }) => {
  const isEdit = Boolean(site);
  const [name, setName] = useState(site?.name ?? '');
  const [province, setProvince] = useState(site?.province ?? '');
  const [phone, setPhone] = useState(site?.phone ?? '');
  const [email, setEmail] = useState(site?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const values = { name, province, phone, email };
  const valid = canSaveCampSite(values);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        province,
        phone: phone.trim(),
        email: email.trim(),
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
          <IonTitle>{isEdit ? 'Edit camp site' : 'Add camp site'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="crew-list">
          <div className="camp-card user-form-card">
            <IonItem>
              <IonInput
                label="Name"
                labelPlacement="stacked"
                value={name}
                onIonInput={(e) => setName(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonSelect
                label="Province"
                labelPlacement="stacked"
                interface="popover"
                value={province}
                onIonChange={(e) => setProvince(e.detail.value ?? '')}
              >
                {SOUTH_AFRICAN_PROVINCES.map((item) => (
                  <IonSelectOption key={item} value={item}>
                    {item}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="Telephone"
                labelPlacement="stacked"
                type="tel"
                value={phone}
                onIonInput={(e) => setPhone(e.detail.value ?? '')}
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
            {error && (
              <div className="ion-padding">
                <IonNote color="danger">{error}</IonNote>
              </div>
            )}
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

export default CampSiteForm;
