import React from 'react';
import { useSidebar } from '../../hooks/useSidebar';

const Topbar: React.FC = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Content removed as requested */}
    </header>
  );
};

export default Topbar;