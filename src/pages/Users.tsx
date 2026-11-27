import {
  IonActionSheet,
  IonAlert,
  IonAvatar,
  IonBadge,
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
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { useState } from 'react';

import UserForm from '../components/UserForm';
import { useUsers } from '../users/useUsers';
import { type AppUser, createUser, deleteUser, type UserInput, updateUser } from '../users/userService';

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

const Users: React.FC = () => {
  const { users, loading, error: loadError } = useUsers();
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formUser, setFormUser] = useState<AppUser | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const openAdd = () => {
    setFormUser(undefined);
    setFormOpen(true);
  };

  const save = async (input: UserInput) => {
    if (formUser) {
      await updateUser(formUser.uid, input);
      setToast('User updated.');
    } else {
      await createUser(input);
      setToast('User created.');
    }
    setFormOpen(false);
  };

  const remove = async () => {
    if (!selected) return;
    try {
      await deleteUser(selected.uid);
      setToast('User deleted.');
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
          <IonTitle>Users</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        )}
        {loadError && <IonItem color="danger">{loadError}</IonItem>}
        {!loading && !loadError && users.length === 0 && (
          <div className="ion-padding ion-text-center">No users yet. Tap + to add one.</div>
        )}
        <IonList className="crew-list" lines="none">
          {users.map((user, index) => (
            <IonItem
              key={user.uid}
              className="crew-card"
              button
              detail={false}
              onClick={() => {
                setSelected(user);
                setActionOpen(true);
              }}
            >
              <IonAvatar
                slot="start"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: index % 2 === 0 ? '#7FA37A' : '#C8693A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                }}
              >
                {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()}
              </IonAvatar>
              <IonLabel>
                <h2>
                  {user.firstName} {user.lastName}
                  {user.isAdmin && (
                    <IonBadge color="secondary" className="ion-margin-start">
                      Admin
                    </IonBadge>
                  )}
                </h2>
                <p>{user.email}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton aria-label="Add user" color="secondary" onClick={openAdd}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonActionSheet
          isOpen={actionOpen}
          header={selected ? `${selected.firstName} ${selected.lastName}` : undefined}
          onDidDismiss={(e) => {
            setActionOpen(false);
            const action = (e.detail.data as { action?: string } | undefined)?.action;
            if (action === 'edit') {
              setFormUser(selected ?? undefined);
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
          header="Delete user?"
          message={`${selected?.email ?? ''} will be removed from sign-in and the user list.`}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Delete', role: 'destructive', handler: () => void remove() },
          ]}
          onDidDismiss={() => setDeleteOpen(false)}
        />

        <IonModal isOpen={formOpen} onDidDismiss={() => setFormOpen(false)}>
          <UserForm key={formUser?.uid ?? 'new'} user={formUser} onSave={save} onCancel={() => setFormOpen(false)} />
        </IonModal>

        <IonToast isOpen={toast !== null} message={toast ?? ''} duration={3000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Users;
