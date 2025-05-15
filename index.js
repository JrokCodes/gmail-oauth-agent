require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get('/', (req, res) => {
  res.send('✅ Gmail OAuth Server is running.');
});

app.get('/auth', (req, res) => {
  const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  res.send(`
    <h2>Gmail Login</h2>
    <a href="${authUrl}" style="font-size:18px">Click here to sign in with Google</a>
  `);
});

app.get('/oauth2/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    console.error('❌ No code returned in query.');
    return res.status(400).send('Missing "code" in query params.');
  }

  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    console.log('\n✅ New Gmail Token Generated!');
    console.log('🔑 Access Token:', access_token);
    console.log('🔁 Refresh Token:', refresh_token);
    console.log('⏳ Expires In:', expires_in, 'seconds');

    res.send(`
      <h2>✅ Gmail successfully connected</h2>
      <p>You may now close this tab.</p>
    `);
  } catch (err) {
    console.error('❌ Token exchange failed:', err.response?.data || err.message);
    res.status(500).send('Token exchange failed. Check server logs.');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});