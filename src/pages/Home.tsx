import {
  IonActionSheet,
  IonAlert,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonModal,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { add, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { useState } from 'react';

import { useAuth } from '../auth/useAuth';
import {
  addCampSite,
  type CampSite,
  type CampSiteInput,
  deleteCampSite,
  updateCampSite,
} from '../campsites/campSiteService';
import { useCampSites } from '../campsites/useCampSites';
import CampSiteForm from '../components/CampSiteForm';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const Home: React.FC = () => {
  const { user } = useAuth();
  const ownerUid = user?.uid;
  const { sites, loading, error: loadError } = useCampSites(ownerUid);
  const [selected, setSelected] = useState<CampSite | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formSite, setFormSite] = useState<CampSite | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const openAdd = () => {
    setFormSite(undefined);
    setFormOpen(true);
  };

  const save = async (input: CampSiteInput) => {
    if (formSite) {
      await updateCampSite(formSite.id, input);
      setToast('Camp site updated.');
    } else {
      if (!ownerUid) throw new Error('You need to be signed in to add a camp site.');
      await addCampSite(ownerUid, input);
      setToast('Camp site added.');
    }
    setFormOpen(false);
  };

  const remove = async () => {
    if (!selected) return;
    try {
      await deleteCampSite(selected.id);
      setToast('Camp site deleted.');
    } catch (err) {
      setToast(messageOf(err));
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Home</IonTitle>
          <IonButtons slot="end">
            <IonIcon
              icon={loadError ? closeCircle : checkmarkCircle}
              title={loadError ? 'Your campsite log could not be loaded' : 'Your campsite log is up to date'}
              aria-label={loadError ? 'Your campsite log could not be loaded' : 'Your campsite log is up to date'}
              style={{
                fontSize: 24,
                marginInlineEnd: 12,
                background: '#ffffff',
                borderRadius: '50%',
                color: loadError ? '#c62828' : '#2e7d32',
              }}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        )}
        {loadError && <IonItem color="danger">{loadError}</IonItem>}
        {!loading && !loadError && sites.length === 0 && (
          <div className="ion-padding ion-text-center">No camp sites yet. Tap + to add one.</div>
        )}
        <IonList className="crew-list" lines="none">
          <IonListHeader>
            <IonLabel>Camp Sites</IonLabel>
          </IonListHeader>
          {sites.map((site) => (
            <IonItem
              key={site.id}
              className="crew-card"
              button
              detail={false}
              onClick={() => {
                setSelected(site);
                setActionOpen(true);
              }}
            >
              <IonLabel>
                {site.logo && (
                  <img
                    src={site.logo}
                    alt=""
                    style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 12, marginBottom: 8 }}
                  />
                )}
                <h2>{site.name}</h2>
                <p>{site.province}</p>
                <p>{site.phone}</p>
                <p>{site.email}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton aria-label="Add camp site" color="secondary" onClick={openAdd}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonActionSheet
          isOpen={actionOpen}
          header={selected?.name}
          onDidDismiss={(e) => {
            setActionOpen(false);
            const action = (e.detail.data as { action?: string } | undefined)?.action;
            if (action === 'edit') {
              setFormSite(selected ?? undefined);
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
          header="Delete camp site?"
          message={`${selected?.name ?? ''} will be removed.`}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Delete', role: 'destructive', handler: () => void remove() },
          ]}
          onDidDismiss={() => setDeleteOpen(false)}
        />

        <IonModal isOpen={formOpen} onDidDismiss={() => setFormOpen(false)}>
          <CampSiteForm key={formSite?.id ?? 'new'} site={formSite} onSave={save} onCancel={() => setFormOpen(false)} />
        </IonModal>

        <IonToast isOpen={toast !== null} message={toast ?? ''} duration={3000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
