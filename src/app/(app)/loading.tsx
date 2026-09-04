export default function AppLoading() {
  return (
    <div className="surface-page" aria-busy="true">
      <div className="skeleton skeleton-line" style={{ width: "42%", height: 34 }} />
      <div className="skeleton skeleton-line" style={{ width: "70%" }} />
      <div className="batch-list" style={{ marginTop: "var(--s-3)" }}>
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
      </div>
      <span className="visually-hidden">Loading</span>
    </div>
  )
}
