import React from 'react';
import getRole from '../http/Role';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
};

const RoleGuard: React.FC<RoleGuardProps> = ({ children, roles }) => {
  const userRole = getRole();

  if (!userRole || !roles.includes(userRole)) {
    return null; 
  }

  return <>{children}</>;
};

export default RoleGuard;
