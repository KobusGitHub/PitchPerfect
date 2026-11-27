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
import { arrowBack, camera, locate, trashOutline } from 'ionicons/icons';
import { useState } from 'react';

import { type CampSite, type CampSiteInput } from '../campsites/campSiteService';
import { getCurrentCoordinates } from '../campsites/location';
import { pickCampSiteLogo } from '../campsites/logo';
import { canSaveCampSite, SOUTH_AFRICAN_PROVINCES } from '../campsites/validation';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

// Keeps the coordinate short enough to read and type, about 0.1 m.
const roundCoordinate = (value: number): string => String(Number(value.toFixed(6)));

const optionalNumber = (value: string): number | undefined => (value.trim() === '' ? undefined : Number(value));

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
  const [address, setAddress] = useState(site?.address ?? '');
  const [latitude, setLatitude] = useState(site?.latitude === undefined ? '' : String(site.latitude));
  const [longitude, setLongitude] = useState(site?.longitude === undefined ? '' : String(site.longitude));
  const [logo, setLogo] = useState<string | undefined>(site?.logo);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const values = { name, province, phone, email, latitude, longitude };
  const valid = canSaveCampSite(values);

  const chooseLogo = async () => {
    setError(null);
    try {
      const picked = await pickCampSiteLogo();
      if (picked) setLogo(picked);
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const fillFromGps = async () => {
    setError(null);
    setLocating(true);
    try {
      const coordinates = await getCurrentCoordinates();
      setLatitude(roundCoordinate(coordinates.latitude));
      setLongitude(roundCoordinate(coordinates.longitude));
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        province,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        latitude: optionalNumber(latitude),
        longitude: optionalNumber(longitude),
        ...(logo ? { logo } : {}),
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
            <div className="ion-padding ion-text-center">
              {logo ? (
                <img
                  src={logo}
                  alt="Camp site logo"
                  style={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 12 }}
                />
              ) : (
                <div style={{ color: '#7a6a58' }}>No logo yet</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                <IonButton fill="outline" onClick={() => void chooseLogo()}>
                  <IonIcon slot="start" icon={camera} />
                  {logo ? 'Change logo' : 'Add logo'}
                </IonButton>
                {logo && (
                  <IonButton fill="clear" color="danger" aria-label="Remove logo" onClick={() => setLogo(undefined)}>
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                )}
              </div>
            </div>
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
            <IonItem>
              <IonInput
                label="Address"
                labelPlacement="stacked"
                value={address}
                onIonInput={(e) => setAddress(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Latitude"
                labelPlacement="stacked"
                type="number"
                inputmode="decimal"
                value={latitude}
                onIonInput={(e) => setLatitude(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Longitude"
                labelPlacement="stacked"
                type="number"
                inputmode="decimal"
                value={longitude}
                onIonInput={(e) => setLongitude(e.detail.value ?? '')}
              />
            </IonItem>
            <div className="ion-padding">
              <IonButton expand="block" fill="outline" disabled={locating} onClick={() => void fillFromGps()}>
                <IonIcon slot="start" icon={locate} />
                {locating ? 'Getting location...' : 'Use current location'}
              </IonButton>
            </div>
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
