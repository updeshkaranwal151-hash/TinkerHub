import { ImageData, Category } from '../types.ts';

const CUSTOM_IMAGE_LIBRARY_KEY = 'tinkerhub-custom-image-library';

export const getCustomImageLibrary = (): Record<string, ImageData[]> => {
  try {
    const library = localStorage.getItem(CUSTOM_IMAGE_LIBRARY_KEY);
    return library ? JSON.parse(library) : {};
  } catch (error) {
    console.error("Error retrieving custom image library from localStorage", error);
    return {};
  }
};

export const saveCustomImageLibrary = (library: Record<string, ImageData[]>) => {
  try {
    localStorage.setItem(CUSTOM_IMAGE_LIBRARY_KEY, JSON.stringify(library));
  } catch (error) {
    console.error("Error saving custom image library to localStorage", error);
  }
};

export const deleteCustomImage = (category: Category, urlToDelete: string) => {
  const library = getCustomImageLibrary();
  if (library[category]) {
    library[category] = library[category].filter(img => img.url !== urlToDelete);
    saveCustomImageLibrary(library);
  }
};

export const updateCustomImageName = (category: Category, urlToUpdate: string, newName: string) => {
    const library = getCustomImageLibrary();
    if (library[category]) {
        const imageIndex = library[category].findIndex(img => img.url === urlToUpdate);
        if (imageIndex > -1) {
            library[category][imageIndex].name = newName;
            saveCustomImageLibrary(library);
        }
    }
};

export const clearCustomImageLibrary = () => {
    try {
        localStorage.removeItem(CUSTOM_IMAGE_LIBRARY_KEY);
    } catch (error) {
        console.error("Error clearing custom image library from localStorage", error);
    }
};
