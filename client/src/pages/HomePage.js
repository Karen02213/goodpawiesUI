import { useEffect, useState } from 'react';

function HomePage() {
  const [message, setMessage] = useState('');
  const [cookies, setCookies] = useState(document.cookie);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div>
      <h1>React + Express Home</h1>
      <p>{message}</p>
      <h3>Cookies:</h3>
      <pre>{cookies}</pre>
      <h3>Token:</h3>
      <pre>{token}</pre>
    </div>
  );
}

export default HomePage;