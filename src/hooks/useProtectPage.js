import { useEffect } from 'react';
import { useAuth } from './use-auth';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

function useProtectPage(pagePermission) {
  const { user } = useAuth();
  const { back } = useRouter();
  useEffect(() => {
    if (user) {
      if (!user.user.role.meta.includes(pagePermission)) {
        toast.error('You don not have permission to acces this page, contact a Superior Admin');
        back();
      }
    }
  }, [pagePermission, user, user.user.role.meta]);
  return null;
}

export default useProtectPage;
