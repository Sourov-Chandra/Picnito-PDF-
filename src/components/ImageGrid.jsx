import React, { useState } from 'react';
import { ImageCard } from './ImageCard';

export function ImageGrid({
  images,
  selectedIds,
  onSelect,
  onRemove,
  onMoveItem,
  onMoveOffset,
  onMoveToFirst,
  onMoveToLast,
}) {
  const [dragIndex, setDragIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== targetIndex) {
      onMoveItem(dragIndex, targetIndex);
    }
    setDragIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {images.map((image, index) => (
          <ImageCard
            key={image.id}
            image={image}
            index={index}
            total={images.length}
            isSelected={selectedIds.has(image.id)}
            isDragging={dragIndex === index}
            onSelect={onSelect}
            onRemove={onRemove}
            onMoveOffset={onMoveOffset}
            onMoveToFirst={onMoveToFirst}
            onMoveToLast={onMoveToLast}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
