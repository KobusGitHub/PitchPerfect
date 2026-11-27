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
import { add, checkmarkCircle, flameOutline } from 'ionicons/icons';
import { useState } from 'react';

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
  const { sites, loading, error: loadError } = useCampSites();
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
      await addCampSite(input);
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
