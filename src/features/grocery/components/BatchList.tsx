type BatchSummary = {
  id: string
  title: string
  status: string
}

export function BatchList({ batches }: { batches: BatchSummary[] }) {
  return (
    <div className="batch-list">
      {batches.map((batch) => (
        <article className="batch-card" key={batch.id}>
          <div>
            <strong>{batch.title}</strong>
            <p>{batch.status}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
