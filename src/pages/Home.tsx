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
  IonMenuButton,
  IonModal,
  IonPage,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonRouter,
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
import { coordinatesQuery, mailHref, mapsHref, telHref } from '../campsites/links';
import { filterCampSites } from '../campsites/search';
import { useCampSites } from '../campsites/useCampSites';
import CampSiteForm from '../components/CampSiteForm';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

// Links inside a row must not also open the Edit/Delete action sheet.
const stopRowClick = (event: React.MouseEvent) => event.stopPropagation();

const Home: React.FC = () => {
  const { user } = useAuth();
  const router = useIonRouter();
  const ownerUid = user?.uid;
  const { sites, loading, error: loadError } = useCampSites(ownerUid);
  const [query, setQuery] = useState('');
  const visibleSites = filterCampSites(sites, query);
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
          <IonTitle>Camp Sites</IonTitle>
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
            <IonTitle size="large">Camp Sites</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonSearchbar
          placeholder="Search by name or province"
          value={query}
          onIonInput={(e) => setQuery(e.detail.value ?? '')}
          debounce={150}
        />
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        )}
        {loadError && <IonItem color="danger">{loadError}</IonItem>}
        {!loading && !loadError && sites.length === 0 && (
          <div className="ion-padding ion-text-center">No camp sites yet. Tap + to add one.</div>
        )}
        {!loading && !loadError && sites.length > 0 && visibleSites.length === 0 && (
          <div className="ion-padding ion-text-center">No camp sites match your search.</div>
        )}
        <IonList className="crew-list" lines="none">
          {visibleSites.map((site) => (
            <IonItem key={site.id} className="crew-card" detail={false}>
              <IonLabel>
                <div
                  className="site-summary"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelected(site);
                    setActionOpen(true);
                  }}
                >
                  {site.logo && (
                    <img
                      src={site.logo}
                      alt=""
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
                  )}
                  <h2>{site.name}</h2>
                  <p>{site.province}</p>
                </div>
                <div className="site-links">
                  {site.phone && (
                    <p>
                      <a className="site-link" href={telHref(site.phone)} onClick={stopRowClick}>
                        {site.phone}
                      </a>
                    </p>
                  )}
                  {site.email && (
                    <p>
                      <a className="site-link" href={mailHref(site.email)} onClick={stopRowClick}>
                        {site.email}
                      </a>
                    </p>
                  )}
                  {site.address && (
                    <p>
                      <a
                        className="site-link"
                        href={mapsHref(site.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={stopRowClick}
                      >
                        {site.address}
                      </a>
                    </p>
                  )}
                  {site.latitude !== undefined && site.longitude !== undefined && (
                    <p>
                      <a
                        className="site-link"
                        href={mapsHref(coordinatesQuery(site.latitude, site.longitude))}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={stopRowClick}
                      >
                        {site.latitude}, {site.longitude}
                      </a>
                    </p>
                  )}
                </div>
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
          cssClass="camp-action-sheet"
          onDidDismiss={(e) => {
            setActionOpen(false);
            const action = (e.detail.data as { action?: string } | undefined)?.action;
            if (action === 'stands' && selected) router.push(`/campsites/${selected.id}/stands`);
            if (action === 'edit') {
              setFormSite(selected ?? undefined);
              setFormOpen(true);
            }
            if (action === 'delete') setDeleteOpen(true);
          }}
          buttons={[
            { text: 'Edit', data: { action: 'edit' } },
            { text: 'Delete', role: 'destructive', data: { action: 'delete' } },
            { text: 'Stands', data: { action: 'stands' } },
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
