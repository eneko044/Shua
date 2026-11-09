// Carta de SHUA French Taco, transcrita de la carta física del local.
// Para cambiar un precio o un plato, edita solo este archivo.

// Colores del "corte" del taco en cada tarjeta, de abajo arriba
export const layerColors = {
  'Cordon bleu': '#E9B160', 'Pollo crujiente': '#D9963F', 'Pollo marinado': '#E59A3C', 'Carne picada': '#7A3B22',
  'Patatas fritas': '#F2C230', 'Salsa de queso': '#FFB627', 'Pulled pork': '#8E3B1E', 'Cebolla crujiente': '#C98A3B',
  'Queso raclette': '#F3D58A', 'Cebolla caramelizada': '#8A4A1F', 'Nuggets': '#E3A64B', 'Queso rulo de cabra': '#F7F1E6',
  'Miel': '#E9A21C', 'Falafel': '#6F7A2C', 'Pico de gallo': '#E2382A', 'Guacamole': '#8DB34A', 'Calabacín y berenjena asados': '#5E6B2A',
};

export const tacosCasa = [
  { name: 'French', price: 11.5, color: 'pink',
    sauce: 'Salsa Shua',
    items: ['Cordon bleu', 'Pollo crujiente', 'Pollo marinado', 'Patatas fritas', 'Salsa de queso'] },
  { name: 'Emmy', price: 12.5, color: 'yellow',
    sauce: 'Salsa Emmy',
    items: ['Carne picada', 'Cordon bleu', 'Pollo marinado', 'Patatas fritas', 'Salsa de queso'] },
  { name: 'BBQ Pulled Pork', price: 12, color: 'orange',
    sauce: 'Salsa Búfalo Tasty Grill',
    items: ['Cordon bleu', 'Pollo crujiente', 'Pulled pork', 'Cebolla crujiente', 'Patatas fritas', 'Salsa de queso'] },
  { name: 'Raclette', price: 12, color: 'navy',
    sauce: 'Salsa Shua',
    items: ['Cordon bleu', 'Pollo marinado', 'Patatas fritas', 'Queso raclette', 'Cebolla caramelizada', 'Salsa de queso'] },
  { name: 'Ahuntz', price: 12, color: 'purple',
    sauce: 'Salsa andalouse',
    items: ['Nuggets', 'Pollo marinado', 'Queso rulo de cabra', 'Miel', 'Salsa de queso'] },
  { name: 'Veggie', price: 12, color: 'green', veggie: true,
    sauce: 'Salsa Brasil',
    items: ['Falafel', 'Patatas fritas', 'Pico de gallo', 'Guacamole', 'Calabacín y berenjena asados', 'Salsa de queso'] },
];

export const sizes = [
  { id: 'M', price: 6.9, proteins: 1 },
  { id: 'L', price: 8.9, proteins: 2 },
  { id: 'XL', price: 11.5, proteins: 3 },
];

// color: tono de la capa en el dibujo del taco
export const proteinas = [
  { id: 'cordon', name: 'Cordon bleu', color: '#E9B160' },
  { id: 'braseado', name: 'Pollo braseado', color: '#D98A3A' },
  { id: 'picada', name: 'Carne picada', color: '#7A3B22' },
  { id: 'nuggets', name: 'Nuggets', color: '#E3A64B' },
  { id: 'kentucky', name: 'Pollo Kentucky', color: '#C77A2E' },
  { id: 'kebabTernera', name: 'Kebab ternera', color: '#6B3420' },
  { id: 'kebabPollo', name: 'Kebab pollo', color: '#E59A3C' },
  { id: 'fingers', name: 'Fingers', color: '#D9963F' },
  { id: 'pulled', name: 'Pulled pork BBQ', color: '#8E3B1E' },
  { id: 'falafel', name: 'Falafel', color: '#6F7A2C', veggie: true },
];

export const salsas = [
  { id: 'argelina', name: 'Argelina', hot: true, color: '#E0521E' },
  { id: 'samurai', name: 'Samurai', hot: true, color: '#E9762B' },
  { id: 'bufalo', name: 'Búfalo Tasty Grill', color: '#B2401C' },
  { id: 'andalouse', name: 'Andalouse', color: '#F08A3A' },
  { id: 'curry', name: 'Curry Madras', color: '#E3A21A' },
  { id: 'blanca', name: 'Salsa blanca kebab', color: '#F6EEDC' },
  { id: 'brazil', name: 'Brazil', color: '#F2B640' },
  { id: 'mayo', name: 'Mayonesa', color: '#FBF1C8' },
  { id: 'ketchup', name: 'Ketchup', color: '#C8261B' },
  { id: 'bbq', name: 'Barbacoa', color: '#5B2112' },
  { id: 'mielMostaza', name: 'Miel mostaza', color: '#E8B830' },
  { id: 'sriracha', name: 'Sriracha', hot: true, color: '#D62A1A' },
  { id: 'harissa', name: "L'Harissa", hot: true, color: '#A81F14' },
];

export const extras = [
  { id: 'cebCrispy', name: 'Cebolla crispy', price: 0.75, color: '#C98A3B' },
  { id: 'cebCaram', name: 'Cebolla caramelizada', price: 0.75, color: '#8A4A1F' },
  { id: 'cebRoja', name: 'Cebolla roja', price: 0.75, color: '#9C3A73' },
  { id: 'tomate', name: 'Tomate', price: 0.75, color: '#E2382A' },
  { id: 'lechuga', name: 'Lechuga', price: 0.75, color: '#6BB33E' },
  { id: 'pimiento', name: 'Pimiento verde', price: 0.75, color: '#3E8E2F' },
  { id: 'raclette', name: 'Queso raclette', price: 1, color: '#F3D58A' },
  { id: 'mozza', name: 'Queso mozzarella', price: 1, color: '#FBF4E2' },
  { id: 'cabra', name: 'Queso rulo de cabra', price: 1, color: '#F7F1E6' },
  { id: 'monterrey', name: 'Queso Monterrey', price: 1, color: '#F1C764' },
  { id: 'cheddar', name: 'Queso cheddar', price: 1, color: '#F2A42A' },
  { id: 'guaca', name: 'Guacamole', price: 1, color: '#8DB34A' },
  { id: 'bacon', name: 'Bacon bits', price: 1, color: '#A2402B' },
  { id: 'gorgonzola', name: 'Gorgonzola', price: 1, color: '#E8E1C4' },
];

export const salsaExtra = [
  { id: 'xEmmy', name: 'Emmy', price: 0.8, color: '#F0A33A' },
  { id: 'xTrufa', name: 'Trufa', price: 0.8, color: '#EFE6D2' },
  { id: 'xArgelina', name: 'Argelina', note: 'la más pedida', hot: true, price: 0.5, color: '#E0521E' },
  { id: 'xSamurai', name: 'Samurai', note: 'picante suave', hot: true, price: 0.5, color: '#E9762B' },
  { id: 'xBufalo', name: 'Búfalo Tasty Grill', price: 0.5, color: '#B2401C' },
  { id: 'xAndalouse', name: 'Andalouse', price: 0.5, color: '#F08A3A' },
  { id: 'xCurry', name: 'Curry Madras', price: 0.5, color: '#E3A21A' },
  { id: 'xBlanca', name: 'Salsa blanca kebab', price: 0.5, color: '#F6EEDC' },
  { id: 'xBrazil', name: 'Brazil', price: 0.5, color: '#F2B640' },
  { id: 'xMayo', name: 'Mayonesa', price: 0.5, color: '#FBF1C8' },
  { id: 'xKetchup', name: 'Ketchup', price: 0.5, color: '#C8261B' },
  { id: 'xBbq', name: 'Barbacoa', price: 0.5, color: '#5B2112' },
  { id: 'xMielMostaza', name: 'Miel mostaza', price: 0.5, color: '#E8B830' },
  { id: 'xSriracha', name: 'Sriracha', hot: true, price: 0.5, color: '#D62A1A' },
  { id: 'xHarissa', name: "L'Harissa", hot: true, price: 0.5, color: '#A81F14' },
  { id: 'xMiel', name: 'Miel', price: 0.5, color: '#E9A21C' },
];

export const menuPrice = 3.5;

export const shawarma = [
  { name: 'Ternera', desc: 'Salsa yogur, tomate, cebolla, lechuga', price: 10.5 },
  { name: 'Pollo', desc: 'Salsa yogur, tomate, cebolla, lechuga', price: 9 },
  { name: 'Mixto', desc: 'Salsa yogur, tomate, cebolla, lechuga', price: 9.5 },
  { name: 'Vegano', desc: 'Falafel, tomate, cebolla, lechuga, salsa vegana', price: 9, veggie: true },
];

export const completalo = ['Col', 'Pepino', 'Pepinillo', 'Salsa roja picante', 'Calabacín asado', 'Berenjena asada'];

export const pedrata = [
  { name: 'De pollo', price: 6 },
  { name: 'Mixta', price: 7 },
  { name: 'De ternera', price: 7.5 },
];

export const entrantes = [
  { name: 'Alitas', price: 6 },
  { name: 'Fingers', price: 7 },
  { name: 'Falafel', price: 6, veggie: true },
  { name: 'Nuggets', price: 6 },
  { name: 'Patatas', price: 4, veggie: true },
];

export const eur = (n) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// Carta: 11,5 / 10,5 → mostramos "11,50 €"
export const price = eur;
