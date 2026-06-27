type BatchPageProps = {
  params: Promise<{ batchId: string }>
}

export default async function BatchPage({ params }: BatchPageProps) {
  const { batchId } = await params

  return (
    <main className="surface-page">
      <section className="surface-card">
        <p className="eyebrow">Batch detail</p>
        <h1>{batchId}</h1>
        <p className="lede">
          This will become the item list and nutrition summary view for a single grocery batch.
          The current build keeps the route in place so the structure matches the product plan.
        </p>
      </section>
    </main>
  )
}
