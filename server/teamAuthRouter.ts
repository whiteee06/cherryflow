import { Router, Request, Response } from 'express';
import { TeamMemberAuthService } from './TeamMemberAuthService';

const router = Router();

/**
 * POST /api/team/register
 * Register a new workspace owner, provision Supabase Auth via admin API,
 * create primary workspace and link owner in workspace_members and team_members.
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, businessName, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Full name, email address, and password are required for registration.',
        code: 'MISSING_FIELDS',
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long.',
        code: 'INVALID_PASSWORD',
      });
    }

    const result = await TeamMemberAuthService.registerWorkspaceOwner({
      name,
      email,
      password,
      businessName,
      role,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Error in /api/team/register:', error);
    if (error.message?.includes('already exists') || error.message?.includes('already registered')) {
      return res.status(409).json({
        error: 'An account with this email address already exists. Please sign in.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }
    return res.status(500).json({
      error: error.message || 'Registration failed. Please try again.',
      code: 'REGISTRATION_FAILED',
    });
  }
});

/**
 * POST /api/team/create-member
 * Create a team member, provision their Supabase Auth account with email_confirm: true,
 * and link the Auth User ID to the team_members / workspace_members database record.
 */
router.post('/create-member', async (req: Request, res: Response) => {
  try {
    const {
      workspaceId,
      workspaceName,
      name,
      email,
      mobileNumber,
      department,
      jobTitle,
      role,
      tempPassword,
    } = req.body;

    if (!workspaceId || !email || !name) {
      return res.status(400).json({ error: 'Workspace ID, Name, and Email are required.' });
    }

    const result = await TeamMemberAuthService.createOrSyncTeamMember({
      workspaceId,
      workspaceName,
      name,
      email,
      mobileNumber,
      department,
      jobTitle,
      role,
      tempPassword,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/team/create-member:', error);
    if (
      error.message?.includes('already exists') ||
      error.message?.includes('already a member') ||
      error.message?.includes('already registered')
    ) {
      return res.status(409).json({
        error: error.message,
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }
    return res.status(500).json({ error: error.message || 'Failed to create team member.' });
  }
});

/**
 * POST /api/team/sync-existing-members
 * Audit database members and provision missing Supabase Auth accounts
 */
router.post('/sync-existing-members', async (req: Request, res: Response) => {
  try {
    const result = await TeamMemberAuthService.syncAllExistingMembers();
    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error in /api/team/sync-existing-members:', error);
    return res.status(500).json({ error: error.message || 'Sync failed.' });
  }
});

/**
 * POST /api/team/sync-member
 * Sync a single member's password to Supabase Auth on login or validation
 */
router.post('/sync-member', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await TeamMemberAuthService.syncMemberAuthPassword(email, password);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/team/sync-member:', error);
    return res.status(500).json({ error: error.message || 'Sync failed.' });
  }
});

/**
 * POST /api/team/complete-first-login
 * Complete forced password change on first login
 */
router.post('/complete-first-login', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and newPassword are required.' });
    }

    await TeamMemberAuthService.completeFirstLoginPasswordChange(email, newPassword);
    return res.json({ success: true, message: 'Password updated and first login completed.' });
  } catch (error: any) {
    console.error('Error in /api/team/complete-first-login:', error);
    return res.status(500).json({ error: error.message || 'Failed to complete password change.' });
  }
});

export default router;
