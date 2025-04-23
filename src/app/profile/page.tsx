import { Suspense } from 'react';
import Loading from './loading';
import ProfileContentWrapper from '@/components/ProfileContentWrapper';

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileContentWrapper />
    </Suspense>
  );
}
