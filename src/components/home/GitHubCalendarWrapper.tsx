'use client'

import { GitHubCalendar } from 'react-github-calendar'
import { useSettings } from '@/context/SettingsContext'

interface Props {
  username: string
}

export default function GitHubCalendarWrapper({ username }: Props) {
  const { settings } = useSettings()

  const colorScheme =
    settings.theme === 'system'
      ? undefined
      : (settings.theme as 'light' | 'dark')

  return (
    <GitHubCalendar
      username={username}
      colorScheme={colorScheme}
      blockSize={12}
      blockMargin={3}
      fontSize={12}
    />
  )
}
