import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { useIsAdmin } from '../users/useIsAdmin';

export const MAIN_CONTENT_ID = 'main-content';

const menuItems = [
  { title: 'Home', path: '/home', adminOnly: false },
  { title: 'Users', path: '/users', adminOnly: true },
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
    <IonMenu contentId={MAIN_CONTENT_ID} side="start" menuId="main-menu">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pitch Perfect</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {visibleItems.map((item) => (
            <IonMenuToggle key={item.path}>
              <IonItem
                routerLink={item.path}
                routerDirection="root"
                detail={false}
                color={location.pathname === item.path ? 'primary' : undefined}
              >
                <IonLabel>{item.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
      {user && (
        <IonFooter>
          <IonToolbar className="side-menu-footer">
            <IonMenuToggle>
              <IonButton expand="block" fill="clear" color="primary" onClick={() => void handleSignOut()}>
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
