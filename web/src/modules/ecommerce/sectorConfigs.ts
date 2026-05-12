export interface CustomFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  placeholder?: string;
}

export interface SectorConfig {
  id: string;
  label: string;
  productFields: CustomFieldConfig[];
}

export const SECTOR_CONFIGS: Record<string, SectorConfig> = {
  acuacultura: {
    id: 'acuacultura',
    label: 'Acuacultura',
    productFields: [
      { name: 'especie', label: 'Especie', type: 'text', placeholder: 'Ej. Tilapia, Camarón' },
      { name: 'tipoAlimento', label: 'Tipo de Alimento', type: 'select', options: ['Iniciador', 'Crecimiento', 'Engorda', 'Finalizador'] },
      { name: 'proteina', label: '% Proteína', type: 'number', placeholder: 'Ej. 35' },
      { name: 'presentacion', label: 'Presentación', type: 'text', placeholder: 'Ej. Pellets 2mm' }
    ]
  },
  tecnologia: {
    id: 'tecnologia',
    label: 'Tecnología',
    productFields: [
      { name: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej. Apple, Dell' },
      { name: 'procesador', label: 'Procesador', type: 'text', placeholder: 'Ej. M2 Ultra, i9 14th' },
      { name: 'ram', label: 'RAM (GB)', type: 'number', placeholder: 'Ej. 32' },
      { name: 'almacenamiento', label: 'Almacenamiento', type: 'text', placeholder: 'Ej. 1TB SSD NVMe' },
      { name: 'garantia', label: 'Garantía (Meses)', type: 'number', placeholder: '12' }
    ]
  },
  retail: {
    id: 'retail',
    label: 'Retail / General',
    productFields: [
      { name: 'color', label: 'Color', type: 'text', placeholder: 'Ej. Rojo, Azul' },
      { name: 'talla', label: 'Talla / Tamaño', type: 'text', placeholder: 'Ej. XL, 42, Grande' },
      { name: 'material', label: 'Material', type: 'text', placeholder: 'Ej. Algodón, Acero' }
    ]
  }
};
