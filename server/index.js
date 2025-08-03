// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});


// QR generator POST endpoint
app.post('/api/generate-qr', (req, res) => {
  const { url, id, name } = req.body;
  if (!url || !id || !name) {
    return res.status(400).send('Missing url, id, or name');
  }
  const qrData = `${url}?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
  const html = `
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <title>QR Code Styling</title>
    <script type=\"text/javascript\" src=\"https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js\"></script>
</head>
<body>
<div id=\"canvas\"></div>
<script type=\"text/javascript\">
    const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: \"svg\",
        data: ${JSON.stringify(qrData)},
        image: \"https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg\",
        dotsOptions: {
            color: \"#4267b2\",
            type: \"rounded\"
        },
        backgroundOptions: {
            color: \"#e9ebee\",
        },
        imageOptions: {
            crossOrigin: \"anonymous\",
            margin: 20
        }
    });
    qrCode.append(document.getElementById(\"canvas\"));
</script>
</body>
</html>
`;
  res.set('Content-Type', 'text/html');
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
