// client/src/App.js
import { useEffect, useState, useRef } from 'react';


function App() {
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ url: '', id: '', name: '' });
  const [qrHtml, setQrHtml] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setQrHtml('');
    const res = await fetch('/api/generate-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const html = await res.text();
    setQrHtml(html);
    // For accessibility, focus the iframe after loading
    setTimeout(() => {
      if (iframeRef.current) iframeRef.current.focus();
    }, 100);
  };

  return (
    <div>
      <h1>React + Express new </h1>
      <p>{message}</p>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <div>
          <label>URL: <input name="url" value={form.url} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>ID: <input name="id" value={form.id} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Name: <input name="name" value={form.name} onChange={handleChange} required /></label>
        </div>
        <button type="submit">Generate QR</button>
      </form>
      {qrHtml && (
        <iframe
          ref={iframeRef}
          title="QR Code"
          srcDoc={qrHtml}
          style={{ width: 340, height: 380, border: '1px solid #ccc' }}
          tabIndex={0}
        />
      )}
    </div>
  );
}

export default App;
