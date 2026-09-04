// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockLogoutMutate = vi.fn();
const mockUser = {
  id: 'user-1',
  fullName: 'Ahmed Technician',
  email: 'ahmed@salisauto.com',
  phone: '+966551234567',
  role: 'TECHNICIAN',
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    logoutMutation: { mutate: mockLogoutMutate, isPending: false },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('wouter', () => {
  const React = require('react');
  return {
    Link: (props: any) => React.createElement('a', { href: props.href }, props.children),
    useLocation: () => ['/', vi.fn()],
  };
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(['/api/auth/user'], mockUser);
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('TechnicianMobileProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user name and email', async () => {
    const { default: TechnicianMobileProfile } = await import('../pages/mobile/TechnicianMobileProfile');
    renderWithProviders(<TechnicianMobileProfile />);
    expect(screen.getByText('Ahmed Technician')).toBeInTheDocument();
    expect(screen.getByText('ahmed@salisauto.com')).toBeInTheDocument();
  });

  it('renders the initial avatar letter from fullName', async () => {
    const { default: TechnicianMobileProfile } = await import('../pages/mobile/TechnicianMobileProfile');
    renderWithProviders(<TechnicianMobileProfile />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('calls logoutMutation.mutate on logout click', async () => {
    const { default: TechnicianMobileProfile } = await import('../pages/mobile/TechnicianMobileProfile');
    renderWithProviders(<TechnicianMobileProfile />);
    const logoutBtn = screen.getByTestId('button-logout');
    fireEvent.click(logoutBtn);
    expect(mockLogoutMutate).toHaveBeenCalledTimes(1);
  });

  it('renders settings menu items', async () => {
    const { default: TechnicianMobileProfile } = await import('../pages/mobile/TechnicianMobileProfile');
    renderWithProviders(<TechnicianMobileProfile />);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('App Settings')).toBeInTheDocument();
    expect(screen.getByText('Timesheet History')).toBeInTheDocument();
  });
});

describe('CustomerMobileProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user name and email', async () => {
    const { default: CustomerMobileProfile } = await import('../pages/mobile/CustomerMobileProfile');
    renderWithProviders(<CustomerMobileProfile />);
    expect(screen.getByText('Ahmed Technician')).toBeInTheDocument();
    const emails = screen.getAllByText('ahmed@salisauto.com');
    expect(emails.length).toBeGreaterThanOrEqual(1);
  });

  it('renders contact information section', async () => {
    const { default: CustomerMobileProfile } = await import('../pages/mobile/CustomerMobileProfile');
    renderWithProviders(<CustomerMobileProfile />);
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
  });

  it('calls logoutMutation.mutate on logout click', async () => {
    const { default: CustomerMobileProfile } = await import('../pages/mobile/CustomerMobileProfile');
    renderWithProviders(<CustomerMobileProfile />);
    const logoutBtn = screen.getByTestId('button-logout');
    fireEvent.click(logoutBtn);
    expect(mockLogoutMutate).toHaveBeenCalledTimes(1);
  });

  it('renders account settings section', async () => {
    const { default: CustomerMobileProfile } = await import('../pages/mobile/CustomerMobileProfile');
    renderWithProviders(<CustomerMobileProfile />);
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });
});
