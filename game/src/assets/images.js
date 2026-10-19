/**
 * URLs das imagens usadas pelo código (a capa é só a tag <img> do index.html).
 * No desenvolvimento são arquivos em `assets/`; no build (`npm run build`)
 * este módulo é substituído por versões embutidas (data URI) para gerar um HTML único.
 */

export const IMAGE_URLS = {
  newsPhoto: new URL('./news-photo.jpg', import.meta.url).href,
  arrestPhoto: new URL('./arrest-photo.jpg', import.meta.url).href,
};
