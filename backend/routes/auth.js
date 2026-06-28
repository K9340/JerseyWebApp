const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = function(db) {
  // POST /api/auth/google
  router.post('/google', async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'OAuth Access Token payload is required' });
      }

      // Verify Google Access Token directly with Google APIs
      const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      const { sub, email, name, picture } = googleResponse.data;

      if (!email) {
        return res.status(400).json({ error: 'Google account has no email verification' });
      }

      // Upsert user profile into PostgreSQL database
      const upsertQuery = `
        INSERT INTO users (id, email, name, picture)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          picture = EXCLUDED.picture
      `;
      await db.query(upsertQuery, [sub, email, name, picture]);

      // Generate a secure JWT session token valid for 7 days
      const sessionToken = jwt.sign(
        { id: sub, email, name, picture },
        process.env.JWT_SECRET || 'FUTURA_JWT_SECRET_KEY',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Authentication successful',
        token: sessionToken,
        user: {
          id: sub,
          email,
          name,
          picture
        }
      });

    } catch (error) {
      console.error('Google Auth verification error:', error.response?.data || error.message);
      res.status(401).json({ error: 'Invalid Google access token' });
    }
  });

  return router;
};
