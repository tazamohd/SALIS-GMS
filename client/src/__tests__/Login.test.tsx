// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
}));

vi.mock('@assets/Logo_blue_orange_1760743036292.png', () => ({
  default: 'test-logo.png',
}));

vi.mock('wouter', () => {
  const React = require('react');
  return {
    Link: (props: any) => React.createElement('a', { href: props.href, 'data-testid': props['data-testid'] }, props.children),
    useLocation: () => ['/', vi.fn()],
  };
});

vi.mock('@/components/ThemeToggle', () => {
  const React = require('react');
  return {
    ThemeToggle: () => React.createElement('div', { 'data-testid': 'theme-toggle' }),
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form with email and password fields', () => {
    renderWithProviders(<Login />);
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit')).toBeInTheDocument();
  });

  it('renders the sign in heading', () => {
    renderWithProviders(<Login />);
    const headings = screen.getAllByText('Sign In');
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the register link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByTestId('link-register')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderWithProviders(<Login />);
    const passwordInput = screen.getByTestId('input-password');
    const toggleButton = screen.getByTestId('toggle-password-visibility');

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('updates email and password fields on input', () => {
    renderWithProviders(<Login />);
    const emailInput = screen.getByTestId('input-email');
    const passwordInput = screen.getByTestId('input-password');

    fireEvent.change(emailInput, { target: { value: 'admin@salisauto.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });

    expect(emailInput).toHaveValue('admin@salisauto.com');
    expect(passwordInput).toHaveValue('admin123');
  });

  it('submit button shows Sign In text', () => {
    renderWithProviders(<Login />);
    expect(screen.getByTestId('login-submit')).toHaveTextContent('Sign In');
  });

  it('displays demo credentials section', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
    expect(screen.getByText(/admin@salisauto.com/)).toBeInTheDocument();
  });
});
