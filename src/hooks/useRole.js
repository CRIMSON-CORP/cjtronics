import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { toast } from 'react-hot-toast';

function useRoleProtect(role) {
  const { user } = useAuth();

  const protectAction = useCallback(
    (action) => () => {
      if (user) {
        if (!user.user.role.meta.includes(role)) {
          toast.error(
            'You do not have sufficient permission to carry out this action, please contact a superior admin to grant access'
          );
          return;
        } else {
          action();
        }
      }
    },
    [role, user]
  );
  return protectAction;
}

export default useRoleProtect;
