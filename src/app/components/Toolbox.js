// app/components/Toolbox.js
"use client";
import { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';
import { availableModels } from '../data/cityModels';
import { newItems } from '../data/sceneItems'; // Import the new items
import { X, Lightbulb, Music } from 'lucide-react';
import styles from './Toolbox.module.css';

function ModelPreview({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function Toolbox({ onSelectItem, onToggle }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState(['Furniture', 'Characters']);

  const itemsByCategory = useMemo(() => {
    const allItems = [...availableModels.map(m => ({...m, type: 'model'})), ...newItems];
    return allItems.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {});
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return itemsByCategory;
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = {};
    for (const category in itemsByCategory) {
      const items = itemsByCategory[category].filter(item =>
        item.name.toLowerCase().includes(lowercasedFilter)
      );
      if (items.length > 0) {
        filtered[category] = items;
      }
    }
    return filtered;
  }, [searchTerm, itemsByCategory]);

  const toggleCategory = (category) => {
    setOpenCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  return (
    <div className={styles.toolbox}>
      <div className={styles.panelHeader}>
        <span>Toolbox</span>
        <button onClick={onToggle} className={styles.closeButton}><X size={16} /></button>
      </div>
      <div className={styles.searchBar}>
        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <div className={styles.itemList}>
        {Object.keys(filteredItems).sort().map(category => (
          <div key={category} className={styles.category}>
            <button className={styles.categoryHeader} onClick={() => toggleCategory(category)}>
              {category}
              <span className={`${styles.arrow} ${openCategories.includes(category) ? styles.open : ''}`}>▼</span>
            </button>
            {openCategories.includes(category) && (
              <div className={styles.itemGrid}>
                {filteredItems[category].map(item => (
                  <div key={item.name} className={styles.itemCard} onClick={() => onSelectItem(item)} title={item.name}>
                    <div className={styles.previewCanvas}>
                      {item.type === 'model' && (
                        <Canvas shadows camera={{ position: [2, 2, 2], fov: 25 }}>
                          <Suspense fallback={null}><Stage environment="city" intensity={0.5}><ModelPreview url={item.url} /></Stage></Suspense>
                          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={5} />
                        </Canvas>
                      )}
                      {item.type === 'light' && <Lightbulb className={styles.iconPreview} />}
                      {item.type === 'sound' && <Music className={styles.iconPreview} />}
                    </div>
                    <div className={styles.itemName}>{item.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}