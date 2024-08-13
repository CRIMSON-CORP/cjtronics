import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';

function usePermission(permission) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  useEffect(() => {
    if (user) {
      setHasPermission(user.user.role.meta.includes(permission));
    }
  }, [permission, user, user?.user?.role?.meta]);
  return hasPermission;
}

export default usePermission;
