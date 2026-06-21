import React from 'react';
import Icon from './Icon';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}><span><Icon name={toast.type === 'error' ? 'close' : 'check'}/></span><p>{toast.message}</p><button onClick={onClose}><Icon name="close" size={16}/></button></div>;
}
