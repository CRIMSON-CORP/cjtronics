import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { items } from 'src/layouts/dashboard/config';

function ProtectPage() {
  const { asPath, back } = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const pagePermission = items.find((item) => item.path === asPath)?.page_access_permission;
      if (pagePermission !== undefined && !user.user.role.meta.includes(pagePermission)) {
        toast.error('You don not have permission to acces this page, contact a Superior Admin');
        back();
      }
    }
  }, [asPath, back, user, user?.user?.role?.meta]);

  return null;
}

export default ProtectPage;
