/**
 * CHERRYFLOW TECHNOLOGIES - BRANDING & IDENTITY CONFIGURATION
 * Reusable, centralized brand system for CherryFlow OS.
 */

export interface QuickLinkItem {
  label: string;
  tab: string;
  href?: string;
}

export interface LegalLinkItem {
  label: string;
  path: string;
}

export const BRAND_CONFIG = {
  companyName: 'CherryFlow Technologies',
  productName: 'CherryFlow',
  tagline: 'Automate. Organize. Grow.',
  description: 'Helping businesses automate, organize, and grow with a unified 100% Free Business Operating System.',
  
  founder: {
    name: 'Nithiarasu G',
    designation: 'Founder & CEO',
    phone: '+91 9952281794',
    email: 'nithiarasu248@gmail.com',
    country: 'India',
  },

  version: 'v1.0.0',
  versionNumber: '1.0.0',
  copyright: '© 2026 CherryFlow Technologies. All Rights Reserved.',
  madeWithLove: 'Made with ❤️ in India',

  colors: {
    primary: '#DC143C', // Cherry Red
    primaryHover: '#B22222',
    secondary: '#000000',
    background: '#FFFFFF',
    darkModeBg: '#0F172A',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },

  support: {
    email: 'nithiarasu248@gmail.com',
    phone: '+91 9952281794',
    availability: '24×7 Support',
    docsUrl: '#docs',
    communityUrl: '#community',
  },

  socials: {
    github: 'https://github.com/nithiarasu',
    linkedin: 'https://linkedin.com/in/nithiarasu',
    instagram: 'https://instagram.com/cherryflow.app',
    youtube: 'https://youtube.com/@cherryflow',
    twitter: 'https://twitter.com/cherryflow_app',
  },

  quickLinks: [
    { label: 'Home', tab: 'dashboard' },
    { label: 'Features', tab: 'automations' },
    { label: 'Free Access', tab: 'billing' },
    { label: 'Feedback', tab: 'feedback' },
    { label: 'Support', tab: 'feedback' },
    { label: 'About', tab: 'about' },
    { label: 'Help Center', tab: 'help' },
  ] as QuickLinkItem[],

  legalLinks: [
    { label: 'Privacy Policy', path: '#privacy' },
    { label: 'Terms & Conditions', path: '#terms' },
    { label: 'Cookie Policy', path: '#cookies' },
    { label: 'Security', path: '#security' },
  ] as LegalLinkItem[],

  about: {
    summary: 'CherryFlow is a 100% Free Business Operating System designed to help businesses manage customers, tasks, projects, analytics, team collaboration, and workflow automation in one unified platform.',
    mission: 'Empower every entrepreneur and team with zero-cost business software.',
    vision: 'Become one of the world\'s leading open and free business platforms.',
    techStack: [
      'React 18 & TypeScript',
      'Tailwind CSS & Glassmorphism',
      'Express Node.js Server',
      'Supabase & Firestore Storage',
      'JWT Authentication & Row Level Security',
      'Free Unlimited Multi-Tenant Workspaces',
    ],
    licenseNotice: '© 2026 CherryFlow Technologies. All Rights Reserved. Unauthorized copying, distribution or modification is prohibited.',
    securityNotice: 'Protected by Supabase, JWT Authentication, Row Level Security & End-to-End Security Architecture',
  }
};
