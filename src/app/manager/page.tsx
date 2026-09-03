import { redirect } from 'next/navigation'
import { ManagerClient } from '@/components/manager-client'

export default async function ManagerPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string | string[]
  }>
}) {
  const { name } = await searchParams

  if (typeof name !== 'string' || !name.trim()) {
    redirect('/')
  }

  return <ManagerClient participantName={name.trim()} managerId="OPM-01" />
}
