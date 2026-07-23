import ObjectDetailClient from './ObjectDetailClient'

export default function ObjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <ObjectDetailClient id={params.id} />
}
