import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

import {
  getUserPhotoBlob,
  type ManagedUser,
} from '../services/user';

interface UserAvatarProps {
  user: Pick<
    ManagedUser,
    'id' | 'name' | 'profile_photo_url'
  >;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-20 w-20',
};

export default function UserAvatar({
  user,
  size = 'md',
}: UserAvatarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const loadPhoto = async () => {
      if (!user.profile_photo_url) {
        setPhotoUrl(null);
        return;
      }

      try {
        const blob = await getUserPhotoBlob(user as ManagedUser);

        if (!blob || cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setPhotoUrl(objectUrl);
      } catch (error) {
        console.error(
          'Failed to load profile photo:',
          error,
        );

        if (!cancelled) {
          setPhotoUrl(null);
        }
      }
    };

    loadPhoto();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user]);

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={user.name}
        className={`${sizeClasses[size]} shrink-0 rounded-full border border-slate-700 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800`}
    >
      {user.profile_photo_url ? (
        <User className="h-4 w-4 text-slate-500" />
      ) : (
        <span className="text-sm font-medium text-slate-300">
          {initials}
        </span>
      )}
    </div>
  );
}