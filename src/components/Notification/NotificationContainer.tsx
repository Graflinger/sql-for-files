import { useNotifications } from '../../contexts/NotificationContext';
import Notification from './Notification';

export default function NotificationContainer() {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-20 right-4 z-40 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {notifications.map((notification) => (
          <Notification key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
