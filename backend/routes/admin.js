const express = require('express');
const multer = require('multer');
const router = express.Router();

// Memory storage is perfect for uploading small JSON backup dumps
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = function(db) {

  // Serve Visual Administration Panel
  router.get('/', (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FuturaSport - DB Admin Deck</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
          </style>
      </head>
      <body class="min-h-screen flex flex-col justify-between">
          <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur py-4 px-6">
              <div class="max-w-4xl mx-auto flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                      <div class="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                          <i class="fa-solid fa-database text-xl text-emerald-400"></i>
                      </div>
                      <div>
                          <span class="text-md font-black tracking-tight text-white">FUTURA DATABASE PORTAL</span>
                          <span class="text-[9px] block text-slate-500 font-bold uppercase tracking-wider">PostgreSQL Recovery Deck</span>
                      </div>
                  </div>
                  <div class="flex items-center space-x-2 bg-slate-800 py-1 px-3 rounded-full border border-slate-700 text-[10px] text-emerald-400 font-bold">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Render RDS Active
                  </div>
              </div>
          </header>

          <main class="flex-grow max-w-4xl w-full mx-auto p-6 space-y-6">
              <!-- Info alert -->
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start space-x-4 shadow-xl">
                  <i class="fa-solid fa-circle-info text-2xl text-emerald-400 mt-0.5"></i>
                  <div>
                      <h3 class="text-sm font-bold text-white uppercase tracking-wide">Programmatic Hot Recovery</h3>
                      <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                          This admin interface executes structural transactions to backup and restore layouts, roster grids, and placed checkout data. All transfers use unified JSON serialization to ensure environment safety.
                      </p>
                  </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- CARD 1: BACKUP -->
                  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                      <div class="space-y-3">
                          <div class="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                              <i class="fa-solid fa-cloud-arrow-down text-lg"></i>
                          </div>
                          <h2 class="text-lg font-extrabold text-white">Export Backup JSON</h2>
                          <p class="text-xs text-slate-400 leading-relaxed">
                              Downloads a serialized JSON file containing all rows in the PostgreSQL database (designs, orders, rosters). Safe to run during live client connections.
                          </p>
                      </div>

                      <button onclick="triggerBackup()" class="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-2">
                          <i class="fa-solid fa-download"></i> Download Backup File
                      </button>
                  </div>

                  <!-- CARD 2: RESTORE -->
                  <div class="bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
                      <div class="space-y-3">
                          <div class="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
                              <i class="fa-solid fa-cloud-arrow-up text-lg"></i>
                          </div>
                          <h2 class="text-lg font-extrabold text-white">Import / Restore JSON</h2>
                          <p class="text-xs text-slate-400 leading-relaxed">
                              Select a previously downloaded JSON backup file to overwrite active database configurations.
                          </p>
                          
                          <div class="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl text-[10px] text-rose-400 flex items-start space-x-2">
                              <i class="fa-solid fa-triangle-exclamation text-sm mt-0.5"></i>
                              <span><strong>CRITICAL WARNING:</strong> Restoring will erase all current orders, custom designs, and rosters. This action cannot be undone.</span>
                          </div>

                          <input type="file" id="restoreFile" accept=".json" class="hidden" onchange="handleFileSelect()">
                          <label for="restoreFile" class="flex items-center justify-center border border-dashed border-slate-700 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer bg-slate-950/40 text-xs font-semibold text-slate-400 transition" id="fileLabel">
                              <i class="fa-solid fa-file-code text-emerald-400 mr-2"></i>
                              <span id="fileNameText">Click to select backup.json</span>
                          </label>
                      </div>

                      <button onclick="triggerRestore()" id="restoreBtn" class="mt-6 w-full bg-slate-850 hover:bg-rose-600 hover:text-white border border-slate-700 hover:border-rose-500 text-slate-400 font-extrabold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-2" disabled>
                          <i class="fa-solid fa-upload"></i> Restore Database
                      </button>
                  </div>
              </div>
          </main>

          <footer class="border-t border-slate-850 bg-slate-950 py-4 px-6 text-center text-[10px] text-slate-600 font-bold uppercase tracking-wider">
              FuturaSport Apparel © 2026 | Secure Database Core
          </footer>

          <script>
              let selectedFile = null;

              function handleFileSelect() {
                  const input = document.getElementById('restoreFile');
                  const labelText = document.getElementById('fileNameText');
                  const btn = document.getElementById('restoreBtn');

                  if (input.files && input.files[0]) {
                      selectedFile = input.files[0];
                      labelText.innerText = selectedFile.name;
                      btn.disabled = false;
                      btn.className = "mt-6 w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-2";
                  }
              }

              function triggerBackup() {
                  window.location.href = '/api/admin/backup';
              }

              async function triggerRestore() {
                  if (!selectedFile) return;

                  const confirmRestore = confirm("Are you absolutely sure you want to restore? This will overwrite the entire database.");
                  if (!confirmRestore) return;

                  const formData = new FormData();
                  formData.append('backup', selectedFile);

                  const btn = document.getElementById('restoreBtn');
                  btn.disabled = true;
                  btn.innerText = "Restoring database...";

                  try {
                      const response = await fetch('/api/admin/restore', {
                          method: 'POST',
                          body: formData
                      });
                      const result = await response.json();

                      if (response.ok) {
                          alert("Database Restored successfully: " + result.message);
                      } else {
                          alert("Failed to restore database: " + result.error);
                      }
                  } catch (err) {
                      console.error(err);
                      alert("Network error occurred during database restoration.");
                  } finally {
                      btn.disabled = false;
                      btn.innerText = "Restore Database";
                  }
              }
          </script>
      </body>
      </html>
    `;
    res.send(html);
  });

  // API 1: Backup Database (GET JSON Dump File)
  router.get('/backup', async (req, res) => {
    try {
      const designsResult = await db.query('SELECT * FROM designs');
      const ordersResult = await db.query('SELECT * FROM orders');
      const rostersResult = await db.query('SELECT * FROM rosters');

      const backupData = {
        timestamp: new Date().toISOString(),
        database: 'postgresql',
        version: '1.0.0',
        designs: designsResult.rows,
        orders: ordersResult.rows,
        rosters: rostersResult.rows
      };

      res.setHeader('Content-disposition', `attachment; filename=futurasport_db_backup_${Date.now()}.json`);
      res.setHeader('Content-type', 'application/json');
      res.write(JSON.stringify(backupData, null, 2));
      res.end();

    } catch (error) {
      console.error('Database backup error:', error);
      res.status(500).json({ error: 'Failed to generate database backup' });
    }
  });

  // API 2: Restore Database (POST JSON Dump File)
  router.post('/restore', upload.single('backup'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No backup file provided' });
    }

    const client = await db.connect();
    try {
      const backupJson = JSON.parse(req.file.buffer.toString());

      // Validate structure before executing dangerous truncates
      if (!backupJson.designs || !backupJson.orders || !backupJson.rosters) {
        return res.status(400).json({ error: 'Invalid backup file structure. Missing core tables JSON properties.' });
      }

      await client.query('BEGIN');

      // 1. Wipe existing data
      await client.query('TRUNCATE TABLE rosters, orders, designs CASCADE');

      // 2. Restore Designs
      if (backupJson.designs.length > 0) {
        const designInsert = `
          INSERT INTO designs 
            (id, name, primarycolor, primarylabel, secondarycolor, secondarylabel, collarcolor, textcolor, fontfamily, pattern, logourl, statejson)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        for (const design of backupJson.designs) {
          await client.query(designInsert, [
            design.id,
            design.name,
            design.primarycolor !== undefined ? design.primarycolor : design.primaryColor,
            design.primarylabel !== undefined ? design.primarylabel : design.primaryLabel,
            design.secondarycolor !== undefined ? design.secondarycolor : design.secondaryColor,
            design.secondarylabel !== undefined ? design.secondarylabel : design.secondaryLabel,
            design.collarcolor !== undefined ? design.collarcolor : design.collarColor,
            design.textcolor !== undefined ? design.textcolor : design.textColor,
            design.fontfamily !== undefined ? design.fontfamily : design.fontFamily,
            design.pattern,
            design.logourl !== undefined ? design.logourl : design.logoUrl,
            design.statejson !== undefined ? design.statejson : design.stateJson
          ]);
        }
      }

      // 3. Restore Orders
      if (backupJson.orders.length > 0) {
        const orderInsert = `
          INSERT INTO orders 
            (id, totalprice, discounttier, shippingaddress, shippingcity, shippingzip, shippingphone, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        for (const order of backupJson.orders) {
          await client.query(orderInsert, [
            order.id,
            order.totalprice !== undefined ? order.totalprice : order.totalPrice,
            order.discounttier !== undefined ? order.discounttier : order.discountTier,
            order.shippingaddress !== undefined ? order.shippingaddress : order.shippingAddress,
            order.shippingcity !== undefined ? order.shippingcity : order.shippingCity,
            order.shippingzip !== undefined ? order.shippingzip : order.shippingZip,
            order.shippingphone !== undefined ? order.shippingphone : order.shippingPhone,
            order.status
          ]);
        }
      }

      // 4. Restore Rosters
      if (backupJson.rosters.length > 0) {
        const rosterInsert = `
          INSERT INTO rosters 
            (id, orderid, playername, playernumber, size, fabric, sleeve)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        for (const player of backupJson.rosters) {
          await client.query(rosterInsert, [
            player.id,
            player.orderid !== undefined ? player.orderid : player.orderId,
            player.playername !== undefined ? player.playername : player.playerName,
            player.playernumber !== undefined ? player.playernumber : player.playerNumber,
            player.size,
            player.fabric,
            player.sleeve
          ]);
        }
      }

      // If everything succeeds, commit
      await client.query('COMMIT');

      res.status(200).json({ 
        message: 'Recovery process executed successfully',
        restored: {
          designs: backupJson.designs.length,
          orders: backupJson.orders.length,
          rosters: backupJson.rosters.length
        }
      });

    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error during restoration rollback:', rollbackErr);
      }
      console.error('Database restore error:', error);
      res.status(500).json({ error: 'Failed to restore database from backup file: ' + error.message });
    } finally {
      client.release();
    }
  });

  return router;
};
