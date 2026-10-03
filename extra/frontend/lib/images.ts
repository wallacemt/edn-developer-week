// Imagens dinâmicas (sem API key): Picsum gera uma foto por seed, Pravatar gera um
// avatar por seed. Unsplash abaixo são fotos fixas usadas como banners editoriais.

export function productThumb(seed: string, size = 96): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}

export function avatarFor(seed: string, size = 96): string {
  return `https://i.pravatar.cc/${size}?u=${encodeURIComponent(seed)}`;
}

export const heroWarehouseImage =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=70&auto=format&fit=crop";

export const packagesImage =
  "https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1200&q=70&auto=format&fit=crop";

export const logisticsImage =
  "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?w=1200&q=70&auto=format&fit=crop";
