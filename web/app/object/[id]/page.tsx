import ObjectDetailClient from './ObjectDetailClient'

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ObjectDetailClient id={id} />
}