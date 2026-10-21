/** @file Imagens carregadas uma única vez e compartilhadas (jornal do caso 3 e créditos do final). */
import { IMAGE_URLS } from '../assets/images.js';
import { profile } from '../core/profile.js';

function loadImage(url) {
  const image = typeof Image === 'function' ? new Image() : null;
  if (image) image.src = url;
  return image;
}

/** Foto do detetive usada no recorte de jornal e nos créditos. */
export const NEWS_PHOTO = loadImage(IMAGE_URLS.newsPhoto);
/** Versão feminina da foto do detetive (mesmo enquadramento). */
export const NEWS_PHOTO_FEMALE = loadImage(IMAGE_URLS.newsPhotoFemale);

/** A foto do detetive que combina com o perfil escolhido pelo jogador. */
export const detectivePhoto = () => (profile.female ? NEWS_PHOTO_FEMALE : NEWS_PHOTO);

/** Foto da prisão do engenheiro (jornal do caso 3). */
export const ARREST_PHOTO = loadImage(IMAGE_URLS.arrestPhoto);
