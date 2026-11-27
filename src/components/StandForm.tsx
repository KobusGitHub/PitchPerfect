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
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { arrowBack, camera, trashOutline } from 'ionicons/icons';
import { useState } from 'react';

import { pickImage } from '../campsites/logo';
import { MAX_STAND_IMAGES, type Stand, type StandInput } from '../stands/standService';
import { canSaveStand, parseOptionalNumber } from '../stands/validation';

const STAND_PHOTO_MAX_PX = 800;
const STAND_PHOTO_QUALITY = 0.7;

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const numberText = (value: number | undefined): string => (value === undefined ? '' : String(value));

interface StandFormProps {
  stand?: Stand;
  onSave: (input: StandInput) => Promise<void>;
  onCancel: () => void;
}

const StandForm: React.FC<StandFormProps> = ({ stand, onSave, onCancel }) => {
  const isEdit = Boolean(stand);
  const [standNumber, setStandNumber] = useState(stand?.standNumber ?? '');
  const [rating, setRating] = useState(numberText(stand?.rating));
  const [shadePercent, setShadePercent] = useState(numberText(stand?.shadePercent));
  const [costPerNight, setCostPerNight] = useState(numberText(stand?.costPerNight));
  const [width, setWidth] = useState(numberText(stand?.width));
  const [length, setLength] = useState(numberText(stand?.length));
  const [notes, setNotes] = useState(stand?.notes ?? '');
  const [images, setImages] = useState<string[]>(stand?.images ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const values = { standNumber, rating, shadePercent, costPerNight, width, length };
  const valid = canSaveStand(values);

  const addPhoto = async () => {
    setError(null);
    try {
      const picked = await pickImage(STAND_PHOTO_MAX_PX, STAND_PHOTO_QUALITY);
      if (picked) setImages((current) => [...current, picked].slice(0, MAX_STAND_IMAGES));
    } catch (err) {
      setError(messageOf(err));
    }
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        standNumber: standNumber.trim(),
        rating: Number(rating),
        shadePercent: parseOptionalNumber(shadePercent),
        costPerNight: parseOptionalNumber(costPerNight),
        width: parseOptionalNumber(width),
        length: parseOptionalNumber(length),
        notes: notes.trim() === '' ? undefined : notes.trim(),
        images,
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
          <IonTitle>{isEdit ? 'Edit stand' : 'Add stand'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="crew-list">
          <div className="camp-card user-form-card">
            <IonItem>
              <IonInput
                label="Stand number *"
                labelPlacement="stacked"
                value={standNumber}
                onIonInput={(e) => setStandNumber(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="My rating out of 10 *"
                labelPlacement="stacked"
                type="number"
                value={rating}
                onIonInput={(e) => setRating(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Shade (%)"
                labelPlacement="stacked"
                type="number"
                value={shadePercent}
                onIonInput={(e) => setShadePercent(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Cost per night (R)"
                labelPlacement="stacked"
                type="number"
                value={costPerNight}
                onIonInput={(e) => setCostPerNight(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Width"
                labelPlacement="stacked"
                type="number"
                value={width}
                onIonInput={(e) => setWidth(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Length"
                labelPlacement="stacked"
                type="number"
                value={length}
                onIonInput={(e) => setLength(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonTextarea
                label="Notes"
                labelPlacement="stacked"
                autoGrow
                value={notes}
                onIonInput={(e) => setNotes(e.detail.value ?? '')}
              />
            </IonItem>
            <div className="ion-padding">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {images.map((src, index) => (
                  <div key={index} style={{ position: 'relative', width: 96, height: 96 }}>
                    <img
                      src={src}
                      alt={`Stand photo ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
                    />
                    <IonButton
                      size="small"
                      fill="clear"
                      color="danger"
                      aria-label={`Remove photo ${index + 1}`}
                      style={{ position: 'absolute', top: 0, right: 0 }}
                      onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                    >
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonButton>
                  </div>
                ))}
              </div>
              <IonButton fill="outline" disabled={images.length >= MAX_STAND_IMAGES} onClick={() => void addPhoto()}>
                <IonIcon slot="start" icon={camera} />
                Add photo ({images.length}/{MAX_STAND_IMAGES})
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

export default StandForm;
