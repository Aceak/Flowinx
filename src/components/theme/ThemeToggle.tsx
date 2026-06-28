import { Sun, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function ThemeToggle() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:text-neutral-400 dark:hover:bg-neutral-700 transition-colors"
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
