// Utility functions for updating meta tags dynamically

export const updateMetaTags = (options: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) => {
  const { title, description, image, url } = options;

  // Update document title
  if (title) {
    document.title = title;
  }

  // Update meta description
  if (description) {
    updateMetaTag('description', description);
    updateMetaTag('og:description', description);
    updateMetaTag('twitter:description', description);
  }

  // Update meta title
  if (title) {
    updateMetaTag('og:title', title);
    updateMetaTag('twitter:title', title);
  }

  // Update meta image
  if (image) {
    updateMetaTag('og:image', image);
    updateMetaTag('twitter:image', image);
  }

  // Update meta URL
  if (url) {
    updateMetaTag('og:url', url);
  }
};

const updateMetaTag = (property: string, content: string) => {
  // Handle different meta tag types
  let selector = '';
  let attribute = '';

  if (property.startsWith('og:') || property.startsWith('twitter:')) {
    selector = `meta[property="${property}"]`;
    attribute = 'property';
  } else {
    selector = `meta[name="${property}"]`;
    attribute = 'name';
  }

  let metaTag = document.querySelector(selector) as HTMLMetaElement;
  
  if (metaTag) {
    metaTag.content = content;
  } else {
    // Create new meta tag if it doesn't exist
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, property);
    metaTag.content = content;
    document.head.appendChild(metaTag);
  }
};

export const resetMetaTags = () => {
  updateMetaTags({
    title: 'CPHACO Admin | Quản trị Sổ Tang',
    description: 'Hệ thống quản trị Sổ tang điện tử, quản lý trang tưởng niệm chuyên nghiệp.',
    url: window.location.origin
  });
};