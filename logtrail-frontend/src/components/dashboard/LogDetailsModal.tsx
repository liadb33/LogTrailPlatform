import React from 'react';
import Modal from '../common/Modal';

interface LogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log?: {
    id: string;
    timestamp: string;
    userId: string;
    level: string;
    tag: string;
    message: string;
    system: string;
    threadId?: string;
    processId?: string;
    packageName?: string;
  };
}

const LogDetailsModal: React.FC<LogDetailsModalProps> = ({ isOpen, onClose, log }) => {
  const fields = [
    { label: 'Timestamp', value: log?.timestamp || 'N/A' },
    { label: 'User ID', value: log?.userId || 'N/A' },
    { label: 'Level', value: log?.level || 'N/A' },
    { label: 'Tag', value: log?.tag || 'N/A' },
    { label: 'Message', value: log?.message || 'N/A' },
    { label: 'System', value: log?.system || 'N/A' },
    ...(log?.threadId ? [{ label: 'Thread ID', value: log.threadId }] : []),
    ...(log?.processId ? [{ label: 'Process ID', value: log.processId }] : []),
    ...(log?.packageName ? [{ label: 'Package Name', value: log.packageName }] : []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Details">
      <div className="space-y-4">
        {fields.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 col-span-2 break-words">{value}</dd>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default LogDetailsModal;