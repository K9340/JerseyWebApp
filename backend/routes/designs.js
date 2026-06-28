const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // Save a new design layout or update existing
  router.post('/', async (req, res) => {
    try {
      const {
        id,
        name,
        primaryColor,
        primaryLabel,
        secondaryColor,
        secondaryLabel,
        collarColor,
        textColor,
        fontFamily,
        pattern,
        logoUrl,
        stateJson
      } = req.body;

      if (!id || !name || !stateJson) {
        return res.status(400).json({ error: 'Missing required parameters: id, name, or stateJson' });
      }

      // PostgreSQL ON CONFLICT statement handles insert-or-update atomically
      const queryText = `
        INSERT INTO designs 
          (id, name, primarycolor, primarylabel, secondarycolor, secondarylabel, collarcolor, textcolor, fontfamily, pattern, logourl, statejson) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          primarycolor = EXCLUDED.primarycolor,
          primarylabel = EXCLUDED.primarylabel,
          secondarycolor = EXCLUDED.secondarycolor,
          secondarylabel = EXCLUDED.secondarylabel,
          collarcolor = EXCLUDED.collarcolor,
          textcolor = EXCLUDED.textcolor,
          fontfamily = EXCLUDED.fontfamily,
          pattern = EXCLUDED.pattern,
          logourl = EXCLUDED.logourl,
          statejson = EXCLUDED.statejson
      `;

      await db.query(queryText, [
        id,
        name,
        primaryColor,
        primaryLabel,
        secondaryColor,
        secondaryLabel,
        collarColor,
        textColor,
        fontFamily,
        pattern,
        logoUrl,
        stateJson
      ]);

      res.status(200).json({ message: 'Design saved successfully', id });
    } catch (error) {
      console.error('Error saving design to PostgreSQL:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get a single design layout by ID
  router.get('/:id', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM designs WHERE id = $1', [req.params.id]);
      const design = result.rows[0];
      
      if (!design) {
        return res.status(404).json({ error: 'Design not found' });
      }
      res.json(design);
    } catch (error) {
      console.error('Error fetching design from PostgreSQL:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get all saved designs
  router.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM designs ORDER BY createdat DESC');
      res.json(result.rows);
    } catch (error) {
      console.error('Error listing designs from PostgreSQL:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
