// app/components/ModelPreloader.js
"use client";
import { useGLTF } from '@react-three/drei';
import { availableModels } from '../data/cityModels';

// This component doesn't render anything visible.
// Its only job is to trigger the loading of all models.
export default function ModelPreloader() {
  // useGLTF.preload can take an array of URLs
  useGLTF.preload(availableModels.map(model => model.url));
  return null;
}