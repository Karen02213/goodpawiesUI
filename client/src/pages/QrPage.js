import { useState, useRef } from 'react';

function QrPage() {
  const [form, setForm] = useState({ url: '', id: '', name: '' });
  const [qrHtml, setQrHtml] = useState('');
  const iframeRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setQrHtml('');
    const params = new URLSearchParams(form).toString();
    const res = await fetch(`http://localhost:5000/api/generate-qr-image?${params}`, {
      method: 'POST'
    });
    const data = await res.json();
    setQrHtml(
      `<img src="http://localhost:5000/api/generate-qr-image/${data.filename}" alt="QR Code" />`
    );
    setTimeout(() => {
      if (iframeRef.current) iframeRef.current.focus();
    }, 100);
  };

  return (
    <div>
      <h2>Generate QR Code</h2>
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

export default QrPage;