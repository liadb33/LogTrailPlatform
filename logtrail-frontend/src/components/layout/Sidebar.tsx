import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListFilter, Terminal, Settings, Menu } from 'lucide-react';
import { useSidebar } from '../../hooks/useSidebar';

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Logs', path: '/logs', icon: <ListFilter size={20} /> },
    { name: 'Live Console', path: '/live-console', icon: <Terminal size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div 
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className={`p-4 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <h1 className={`text-xl font-bold text-gray-800 transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>
          LogTrail
        </h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={20} className="text-gray-600" />
        </button>
      </div>
      <nav className="flex-1 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className={`px-2 py-1 ${isCollapsed ? 'flex justify-center' : ''}`}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors relative group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                <span className={`transition-all duration-300 ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}>
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;