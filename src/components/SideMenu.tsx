import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonToolbar,
} from '@ionic/react';
import { map, people } from 'ionicons/icons';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { useIsAdmin } from '../users/useIsAdmin';

import PatchLogo from './PatchLogo';

export const MAIN_CONTENT_ID = 'main-content';

const menuItems = [
  { title: 'Camp Sites', path: '/home', icon: map, adminOnly: false },
  { title: 'Users', path: '/users', icon: people, adminOnly: true },
];

const SideMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin', { replace: true });
  };

  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <IonMenu contentId={MAIN_CONTENT_ID} side="start" menuId="main-menu" className="pp-side-menu">
      <IonHeader className="side-menu-header">
        <div className="side-menu-brand">
          <PatchLogo size={72} />
          <h2>Pitch Perfect</h2>
          {user?.email && <p>{user.email}</p>}
        </div>
      </IonHeader>
      <IonContent>
        <IonList className="side-menu-list" lines="none">
          {visibleItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <IonMenuToggle key={item.path}>
                <IonItem
                  className={active ? 'side-menu-item side-menu-item-active' : 'side-menu-item'}
                  routerLink={item.path}
                  routerDirection="root"
                  detail={false}
                >
                  <IonIcon slot="start" icon={item.icon} />
                  <IonLabel>{item.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
      {user && (
        <IonFooter>
          <IonToolbar className="side-menu-footer">
            <IonMenuToggle>
              <IonButton expand="block" fill="outline" color="primary" onClick={() => void handleSignOut()}>
                Sign out
              </IonButton>
            </IonMenuToggle>
          </IonToolbar>
        </IonFooter>
      )}
    </IonMenu>
  );
};

export default SideMenu;
