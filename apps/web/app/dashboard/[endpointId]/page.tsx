export default async function DashboardPage({
  params,
}: {
  params: Promise<{ endpointId: string }>
}) {
  const { endpointId } = await params

  return <div>Dashboard for {endpointId}</div>
}
