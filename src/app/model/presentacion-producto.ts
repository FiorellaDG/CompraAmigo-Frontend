import { Producto } from './compra';

const IMAGENES: Record<string, string> = {
  'casaca.png': 'casaca-impermeable-azul.jpg',
  'zapatillas.png': 'zapatillas-eco.jpg',
  'polo.png': 'polo-organico.jpg',
};

const IMAGENES_POR_NOMBRE: Record<string, string> = {
  'casaca eco urban': 'casaca-eco-urban.png',
  'zapatillas eco': 'zapatillas-verdes.png',
  'polo verde': 'polo-verde.png',
};

export function tallasProducto(producto: Producto) {
  return producto.tallas?.split(',').map(talla => talla.trim()).filter(Boolean) ?? [];
}

export function imagenProducto(producto: Producto): string | null {
  const ruta = producto.imagen?.replace(/^\//, '');
  if (ruta && /^images\/productos\/[a-z0-9-]+\.(?:jpe?g|png|webp)$/i.test(ruta)) {
    return '/' + ruta;
  }
  const archivo = producto.imagen?.split('/').pop() ?? '';
  const foto = IMAGENES[archivo] ?? IMAGENES_POR_NOMBRE[producto.nombre.trim().toLowerCase()];
  return foto ? '/images/productos/' + foto : null;
}