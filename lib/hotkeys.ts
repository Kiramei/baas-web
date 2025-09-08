// src/lib/hotkeys.ts
import type { TFunction } from 'i18next';
import type { HotkeyConfig } from '@/components/HotkeyConfig';

export function getDefaultHotkeys(t: TFunction): HotkeyConfig[] {
  return [
    { id: 'toggle-run',    label: t('hotkey.switch.start'), value: 'Ctrl+Enter' },
    { id: 'toggle-scroll', label: t('Toggle Scroll To Esssnd1'), value: 'Ctrl+Shift+S' },
    { id: 'open-settings', label: t('Open Settingssss'), value: 'Ctrl+,' },
    { id: 'clear-logs',    label: t('Clear Logsss'), value: '' },
    { id: 'focus-search',  label: t('Focus Search'), value: 'Ctrl+K' },
    { id: 'help',          label: t('Help / About'), value: 'F1' },
  ];
}

export function normalizeCombo(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

export function eventToCombo(e: KeyboardEvent): string {
  const mods: string[] = [];
  if (e.ctrlKey) mods.push('ctrl');
  if (e.shiftKey) mods.push('shift');
  if (e.altKey) mods.push('alt');
  if (e.metaKey) mods.push('meta');
  let main = e.key.length === 1 ? e.key.toUpperCase() : e.key.toUpperCase();
  return normalizeCombo([...mods, main].join('+'));
}
