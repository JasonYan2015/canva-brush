import * as React from 'react';
import { appProcess } from '@canva/platform';
import { ObjectPanel } from './components/objectPanel';
import { SelectedImageOverlay } from './components/selectedImageOverlay';

export function App() {
  const context = appProcess.current.getInfo();

  if (context.surface === 'object_panel') {
    return <ObjectPanel />;
  }

  if (context.surface === 'selected_image_overlay') {
    return <SelectedImageOverlay />;
  }

  throw new Error(`Invalid surface: ${context.surface}`);
}
