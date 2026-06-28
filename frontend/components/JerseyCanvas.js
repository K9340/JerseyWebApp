import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function JerseyCanvas({ side, state, playerIndex = 0, isGuidesEnabled = true }) {
  // Native iOS/Android Path: Compile an inline HTML containing the drawing engine + webview bridge
  const stateJsonStr = JSON.stringify(state);
  const webViewHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #090d16; display: flex; justify-content: center; align-items: center; }
          canvas { max-width: 100%; max-height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <canvas id="webviewCanvas"></canvas>
        <script>
          // Embedding drawing logics directly inside WebView for performance
          const MASTER_REF_WIDTH = 23.5;
          const MASTER_REF_HEIGHT = 28.0;
          const SLEEVE_REF_WIDTH = 11.75;
          const SLEEVE_HALF_REF_HEIGHT = 10.0;
          const SLEEVE_FULL_REF_HEIGHT = 28.0;

          // Simple SVG image drawing helpers
          const svgTemplates = {
            front: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1140"><rect width="800" height="1140" fill="#1e3a8a"/><text x="400" y="570" fill="#facc15" font-size="32" font-family="sans-serif" font-weight="bold" text-anchor="middle">FRONT</text></svg>\`,
            back: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1140"><rect width="800" height="1140" fill="#1e3a8a"/><text x="400" y="570" fill="#facc15" font-size="32" font-family="sans-serif" font-weight="bold" text-anchor="middle">BACK</text></svg>\`,
            halfSleeve: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 235 100"><rect width="235" height="100" fill="#1e3a8a"/><text x="117.5" y="50" fill="#facc15" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">HALF SLEEVE</text></svg>\`,
            fullSleeve: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 235 280"><rect width="235" height="280" fill="#1e3a8a"/><text x="117.5" y="140" fill="#facc15" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">FULL SLEEVE</text></svg>\`
          };

          const canvas = document.getElementById('webviewCanvas');
          const ctx = canvas.getContext('2d');

          let appState = ${stateJsonStr};
          let viewSide = "${side}";
          let pIdx = ${playerIndex};
          let guides = ${isGuidesEnabled ? 'true' : 'false'};

          function render() {
            const dpi = appState.dpi || 100;
            const isSleeve = viewSide === 'leftSleeve' || viewSide === 'rightSleeve';
            const sleeveType = appState.activeSleeveType || 'HALF';
            
            let refW = MASTER_REF_WIDTH;
            let refH = MASTER_REF_HEIGHT;
            if (isSleeve) {
              refW = SLEEVE_REF_WIDTH;
              refH = sleeveType === 'HALF' ? SLEEVE_HALF_REF_HEIGHT : SLEEVE_FULL_REF_HEIGHT;
            }

            const sizeMap = { '7XS': 0.72, '4XS': 0.82, 'S': 0.95, 'M': 1.0, 'L': 1.05, 'XXL': 1.15, '5XL': 1.30 };
            const sizeScale = sizeMap[appState.previewSize] || 1.0;

            const scaleX = sizeScale;
            const scaleY = sizeScale;
            const widthPx = refW * scaleX * dpi;
            const heightPx = refH * scaleY * dpi;

            canvas.width = widthPx;
            canvas.height = heightPx;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, widthPx, heightPx);

            // Draw Background Layout
            const svgCode = svgTemplates[isSleeve ? (sleeveType === 'HALF' ? 'halfSleeve' : 'fullSleeve') : viewSide];
            const img = new Image();
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgCode);
            img.onload = () => {
              ctx.drawImage(img, 0, 0, widthPx, heightPx);
              drawConfigElements(scaleX, scaleY, dpi);
            };
          }

          function drawConfigElements(scaleX, scaleY, dpi) {
            const currentConfig = appState[viewSide];
            const activePlayer = appState.players && appState.players[pIdx] ? appState.players[pIdx] : { name: "ROHIT", number: "45" };

            if (currentConfig) {
              Object.keys(currentConfig).forEach(key => {
                const config = currentConfig[key];
                if (!config.visible) return;

                const isText = (key === 'chestNumber' || key === 'sponsor' || key === 'name' || key === 'number' || key === 'teamName' || key === 'text');
                const x = config.xPosInches * scaleX * dpi;
                const y = config.yPosInches * scaleY * dpi;
                const w = config.targetWidthInches * scaleX * dpi;
                const h = config.maxHeightInches * scaleY * dpi;

                if (isText) {
                  let txt = config.text || '';
                  if (key === 'name') txt = activePlayer.name;
                  if (key === 'number' || key === 'chestNumber') txt = activePlayer.number;

                  ctx.save();
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = config.fgColor || '#facc15';
                  ctx.font = 'bold ' + Math.round(h * 0.8) + 'px sans-serif';
                  ctx.fillText(txt.toUpperCase(), x, y);
                  ctx.restore();
                } else {
                  ctx.save();
                  ctx.strokeStyle = '#facc15';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(x - w/2, y - h/2, w, h);
                  ctx.fillStyle = 'rgba(246, 224, 94, 0.1)';
                  ctx.fillRect(x - w/2, y - h/2, w, h);
                  ctx.restore();
                }
              });
            }

            if (guides) {
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
              ctx.strokeRect(0, 0, canvas.width, canvas.height);
            }
          }

          window.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.state) appState = data.state;
            if (data.side) viewSide = data.side;
            if (data.playerIndex !== undefined) pIdx = data.playerIndex;
            if (data.isGuidesEnabled !== undefined) guides = data.isGuidesEnabled;
            render();
          });

          // Initial Render
          setTimeout(render, 100);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.nativeContainer}>
      <WebView
        originWhitelist={['*']}
        source={{ html: webViewHtml }}
        style={styles.webView}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#090d16',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
