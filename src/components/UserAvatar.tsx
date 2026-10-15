import React from 'react';
import { User } from '../types';
import { getUserById } from '../services/auth';

interface UserAvatarProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ userId, size = 'md', showName = false }) => {
  const user = getUserById(userId);

  if (!user) return null;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2" title={user.name}>
      <div className={`${sizeClasses[size]} ${user.color || 'bg-gray-400'} rounded-full flex items-center justify-center text-white font-medium shadow-sm border-2 border-white`}>
        {initials}
      </div>
      {showName && <span className="text-sm text-gray-700">{user.name}</span>}
    </div>
  );
};
