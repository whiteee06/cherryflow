import React from 'react';
import { CreateMemberModal } from './CreateMemberModal';
import { WorkspaceMember } from '../../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  inviterEmail: string;
  onInviteSent?: (invitation: any) => void;
  onMemberCreated?: (member: WorkspaceMember, tempPassword: string) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  inviterName,
  inviterEmail,
  onInviteSent,
  onMemberCreated,
}) => {
  return (
    <CreateMemberModal
      isOpen={isOpen}
      onClose={onClose}
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      currentUser={{ name: inviterName, email: inviterEmail }}
      onMemberCreated={(member, tempPassword) => {
        if (onMemberCreated) onMemberCreated(member, tempPassword);
        if (onInviteSent) {
          onInviteSent({
            id: member.id,
            workspaceId: member.workspaceId,
            email: member.email,
            role: member.role,
            inviterName,
            inviterEmail,
            token: 'direct_account',
            status: 'accepted',
            expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
            createdAt: new Date().toISOString(),
          });
        }
      }}
    />
  );
};
