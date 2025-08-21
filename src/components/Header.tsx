'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Settings, LogOut, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { authenticatedFetch } from '@/lib/api';
import { toast } from 'sonner';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    console.log("Header mounted. Attempting to read user from localStorage.");
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('user');
      console.log("userString from localStorage:", userString);
      if (userString) {
        try {
          const user = JSON.parse(userString);
          console.log("Parsed user object:", user);
          setCurrentUserId(user.id);
          console.log("Set currentUserId to:", user.id);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      } else {
        console.log("userString is null or empty.");
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    console.log("handleThemeChange called. currentUserId:", currentUserId);
    try {
      await authenticatedFetch('https://webhook.clientes.acontece.ai/webhook/settings/user-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dark_theme: newTheme === 'dark', userId: currentUserId }),
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const handleLogout = async () => {
    deleteCookie('token');
    localStorage.removeItem('user');
    router.push('/login');
    toast.success('Logout realizado com sucesso!');
  };

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center space-x-4">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground">
          <Settings className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      </div>
      <div className="relative">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 text-foreground">
          <Settings className="h-6 w-6" />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-10">
            <button onClick={() => router.push('/users')} className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent w-full text-left">
              <Users className="mr-2 h-4 w-4" />
              Usuários
            </button>
            <button onClick={() => handleLogout()} className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent w-full text-left">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </button>
            <div className="px-4 py-2 text-sm text-popover-foreground">
              <label htmlFor="theme-switch" className="flex items-center justify-between cursor-pointer">
                <span>Tema Escuro</span>
                <input
                  type="checkbox"
                  id="theme-switch"
                  checked={theme === 'dark'}
                  onChange={(e) => handleThemeChange(e.target.checked ? 'dark' : 'light')}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}