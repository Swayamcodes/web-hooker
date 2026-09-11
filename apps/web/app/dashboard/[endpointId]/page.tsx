export default function DashboardPage({
  params,
}: {
  params: { endpointId: string }
}) {
  return <div>Dashboard for {params.endpointId}</div>
}