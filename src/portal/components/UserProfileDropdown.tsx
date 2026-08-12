
import React from 'react';
import { LogOut, Settings, ShieldAlert } from 'lucide-react';

interface UserProfileDropdownProps {
  user: {
    nome: string;
    matricula?: string;
    titularNome?: string;
  };
  onLogout: () => void;
  onClose: () => void;
}

export default function UserProfileDropdown({
  user,
  onLogout,
  onClose,
}: UserProfileDropdownProps) {
  return (
    <div className="portal-dropdown-overlay" onClick={onClose}>
      <div className="portal-dropdown-menu" onClick={(e) => e.stopPropagation()}>
        <div className="portal-dropdown-header">
          <div className="portal-dropdown-user-info">
            <div className="portal-dropdown-user-name">{user.nome}</div>
            {user.matricula && (
              <div className="portal-dropdown-user-meta">Matrícula: {user.matricula}</div>
            )}
          </div>
        </div>

        <div className="portal-dropdown-divider"></div>

        <button className="portal-dropdown-item">
          <Settings size={18} />
          <span>Preferências</span>
        </button>

        <button className="portal-dropdown-item">
          <ShieldAlert size={18} />
          <span>Segurança</span>
        </button>

        <div className="portal-dropdown-divider"></div>

        <button className="portal-dropdown-item logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  );
}
