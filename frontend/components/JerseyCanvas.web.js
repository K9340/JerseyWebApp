import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { drawJerseySide } from './canvasEngine';

export default function JerseyCanvas({ side, state, playerIndex = 0, isGuidesEnabled = true, onPositionChange }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw using standard Canvas Engine
    drawJerseySide(ctx, canvas, side, state, playerIndex, isGuidesEnabled);
  }, [side, state, playerIndex, isGuidesEnabled]);

  return (
    <View style={styles.webContainer}>
      <canvas ref={canvasRef} style={styles.webCanvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090d16',
    borderRadius: 16,
    padding: 16,
  },
  webCanvas: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
  },
});
