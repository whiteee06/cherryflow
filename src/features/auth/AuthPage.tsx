import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LandingPage } from './LandingPage';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForcePasswordChangePage } from './ForcePasswordChangePage';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { EmailVerifyNotice } from './EmailVerifyNotice';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { SuperAdminLoginPage } from '../super-admin/SuperAdminLoginPage';
import { UnauthorizedAccess } from '../../components/admin/UnauthorizedAccess';

export const AuthPage: React.FC = () => {
  const { screen, setScreen } = useAuth();

  switch (screen) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginForm />;
    case 'register':
      return <RegisterForm />;
    case 'force_password_change':
      return <ForcePasswordChangePage />;
    case 'accept_invitation':
      return <LoginForm />;
    case 'forgot_password':
      return <ForgotPasswordForm />;
    case 'reset_password':
      return <ResetPasswordForm />;
    case 'verify_email':
      return <EmailVerifyNotice />;
    case 'setup_guide':
      return <SupabaseSetupModal />;
    case 'super_admin_login':
      return (
        <SuperAdminLoginPage
          onLoginSuccess={() => setScreen('app')}
          onNavigateToUserLogin={() => setScreen('login')}
        />
      );
    case 'unauthorized':
      return (
        <UnauthorizedAccess
          onGoToSuperAdminLogin={() => setScreen('super_admin_login')}
          onReturnToWorkspace={() => setScreen('app')}
        />
      );
    default:
      return <LandingPage />;
  }
};
