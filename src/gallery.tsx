import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { GalleryPage } from './pages/GalleryPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GalleryPage />
  </StrictMode>,
);
