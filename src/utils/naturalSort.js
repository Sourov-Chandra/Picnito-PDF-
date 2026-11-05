/**
 * Natural sorting comparator and utilities.
 * Correctly sorts filenames like:
 * page-1.jpg, page-2.jpg, page-10.jpg
 * instead of alphabetical page-1, page-10, page-2.
 */

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export function naturalCompare(a, b) {
  return collator.compare(a, b);
}

export function sortImages(images, sortType) {
  const list = [...images];

  switch (sortType) {
    case 'name-asc':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case 'natural':
      return list.sort((a, b) => naturalCompare(a.name, b.name));
    case 'date-created':
      return list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    case 'date-modified':
      return list.sort((a, b) => (a.modifiedAt || 0) - (b.modifiedAt || 0));
    case 'size':
      return list.sort((a, b) => (a.size || 0) - (b.size || 0));
    case 'dimensions':
      return list.sort((a, b) => {
        const areaA = (a.width || 0) * (a.height || 0);
        const areaB = (b.width || 0) * (b.height || 0);
        return areaA - areaB;
      });
    default:
      return list;
  }
}
