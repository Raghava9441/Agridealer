import { type ReactNode, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import type { Session } from '@/core/auth/authStrategy'
import { useAppDispatch, useAppSelector } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { commandPaletteSet, selectUi } from '@/store/slices/uiSlice'
import { useNavItems } from '@/config/useNavItems'
import { useContent } from '@/cms/useContent'
import { useTheme } from '@/theme/useTheme'
import { useLocale } from '@/shared/i18n/useLocale'
import { Button } from '@/shared/components/ui/Button'
import { CommandPalette, type Command } from '@/shared/components/ui/CommandPalette'
import { NotificationCenter } from '@/shared/components/ui/NotificationCenter'
import { FeatureFlagDevPanel } from '@/featureFlags/FeatureFlagDevPanel'

export function AppShell({ session, children }: { session: Session | null; children: ReactNode }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const content = useContent()
  const { mode, setMode } = useTheme()
  const { locale, setLocale } = useLocale()
  const navItems = useNavItems()
  const { commandPaletteOpen } = useAppSelector(selectUi)

  const commands = useMemo<Command[]>(
    () => navItems.map((item) => ({ id: item.to, label: content.get(item.labelKey), run: () => navigate({ to: item.to }) })),
    [navItems, content, navigate],
  )

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-e border-muted bg-surface p-4">
        <div className="mb-6 text-lg font-semibold text-brand">AgriDealer</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block rounded px-3 py-2 text-sm hover:bg-muted"
              activeProps={{ className: 'bg-muted font-medium' }}
            >
              {content.get(item.labelKey)}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-muted px-6 py-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch(commandPaletteSet(true))}
          >
            {content.get('nav.commandPaletteHint')}
          </Button>

          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="locale">
              {content.get('language.label')}
            </label>
            <select
              id="locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="h-9 rounded border border-muted bg-surface px-2 text-sm"
            >
              <option value="en">{content.get('language.en')}</option>
              <option value="te">{content.get('language.te')}</option>
              <option value="hi">{content.get('language.hi')}</option>
              <option value="ar">{content.get('language.ar')}</option>
            </select>

            <label className="sr-only" htmlFor="theme-mode">
              {content.get('theme.mode')}
            </label>
            <select
              id="theme-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
              className="h-9 rounded border border-muted bg-surface px-2 text-sm"
            >
              <option value="light">{content.get('theme.light')}</option>
              <option value="dark">{content.get('theme.dark')}</option>
              <option value="system">{content.get('theme.system')}</option>
            </select>

            <span className="text-sm text-muted-foreground">{session?.role}</span>
            <Button variant="secondary" size="sm" onClick={() => void dispatch(logout())}>
              {content.get('nav.signOut')}
            </Button>
          </div>
        </header>
        <main className="relative flex-1 p-6">{children}</main>
      </div>

      <CommandPalette open={commandPaletteOpen} onOpenChange={(open) => dispatch(commandPaletteSet(open))} commands={commands} />
      <NotificationCenter />
      <FeatureFlagDevPanel />
    </div>
  )
}
