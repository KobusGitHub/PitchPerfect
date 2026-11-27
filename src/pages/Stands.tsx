import {
  IonActionSheet,
  IonAlert,
  IonBackButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { useCampSites } from '../campsites/useCampSites';
import StandForm from '../components/StandForm';
import { addStand, deleteStand, type Stand, type StandInput, updateStand } from '../stands/standService';
import { useStands } from '../stands/useStands';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const formatSize = (width?: number, length?: number): string | undefined =>
  width === undefined && length === undefined ? undefined : `${width ?? '?'} × ${length ?? '?'}`;

const Stands: React.FC = () => {
  const { siteId = '' } = useParams<{ siteId: string }>();
  const { user } = useAuth();
  const { sites } = useCampSites(user?.uid);
  const siteName = sites.find((site) => site.id === siteId)?.name ?? 'Stands';
  const { stands, loading, error: loadError } = useStands(siteId);
  const [selected, setSelected] = useState<Stand | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formStand, setFormStand] = useState<Stand | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const openAdd = () => {
    setFormStand(undefined);
    setFormOpen(true);
  };

  const save = async (input: StandInput) => {
    if (formStand) {
      await updateStand(siteId, formStand.id, input);
      setToast('Stand updated.');
    } else {
      await addStand(siteId, input);
      setToast('Stand added.');
    }
    setFormOpen(false);
  };

  const remove = async () => {
    if (!selected) return;
    try {
      await deleteStand(siteId, selected.id);
      setToast('Stand deleted.');
    } catch (err) {
      setToast(messageOf(err));
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Stands</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{siteName}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        )}
        {loadError && <div className="ion-padding">{loadError}</div>}
        {!loading && !loadError && stands.length === 0 && (
          <div className="ion-padding ion-text-center">No stands yet. Tap + to add one.</div>
        )}
        <IonList className="crew-list" lines="none">
          {stands.map((stand) => (
            <IonItem
              key={stand.id}
              className="crew-card"
              button
              detail={false}
              onClick={() => {
                setSelected(stand);
                setActionOpen(true);
              }}
            >
              <IonLabel>
                {stand.images.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Stand ${stand.standNumber} photo ${index + 1}`}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: 'auto',
                      maxHeight: 150,
                      objectFit: 'contain',
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  />
                ))}
                <h2>Stand {stand.standNumber}</h2>
                <p>My rating: {stand.rating}/10</p>
                {stand.shadePercent !== undefined && <p>Shade: {stand.shadePercent}%</p>}
                {stand.costPerNight !== undefined && <p>Cost per night: R {stand.costPerNight}</p>}
                {formatSize(stand.width, stand.length) && <p>Size: {formatSize(stand.width, stand.length)}</p>}
                {stand.notes && <p style={{ whiteSpace: 'pre-line' }}>{stand.notes}</p>}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton aria-label="Add stand" color="secondary" onClick={openAdd}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonActionSheet
          isOpen={actionOpen}
          header={selected ? `Stand ${selected.standNumber}` : undefined}
          cssClass="camp-action-sheet"
          onDidDismiss={(e) => {
            setActionOpen(false);
            const action = (e.detail.data as { action?: string } | undefined)?.action;
            if (action === 'edit') {
              setFormStand(selected ?? undefined);
              setFormOpen(true);
            }
            if (action === 'delete') setDeleteOpen(true);
          }}
          buttons={[
            { text: 'Edit', data: { action: 'edit' } },
            { text: 'Delete', role: 'destructive', data: { action: 'delete' } },
            { text: 'Cancel', role: 'cancel' },
          ]}
        />

        <IonAlert
          isOpen={deleteOpen}
          header="Delete stand?"
          message={`Stand ${selected?.standNumber ?? ''} will be removed.`}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Delete', role: 'destructive', handler: () => void remove() },
          ]}
          onDidDismiss={() => setDeleteOpen(false)}
        />

        <IonModal isOpen={formOpen} onDidDismiss={() => setFormOpen(false)}>
          <StandForm key={formStand?.id ?? 'new'} stand={formStand} onSave={save} onCancel={() => setFormOpen(false)} />
        </IonModal>

        <IonToast isOpen={toast !== null} message={toast ?? ''} duration={3000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Stands;
