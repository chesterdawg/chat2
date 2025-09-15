export default function SampleA11y() {
  return (
    <div>
      <button aria-label="Open menu"></button>
      <button type="button" onClick={() => alert('clicked')}>Click me</button>
      <img src="/banner.png" alt="" role="presentation" />
      <label htmlFor="q">Search</label>
      <input type="text" id="q" />
    </div>
  );
}
