/**
 * Utilitário para padronizar e ordenar distâncias de corridas
 */

// Mapeamento de distâncias padronizadas
const DISTANCE_MAPPING: Record<string, { value: number; display: string }> = {
  'caminhada': { value: 0, display: 'Caminhada' },
  'walk': { value: 0, display: 'Caminhada' },
  '3k': { value: 3, display: '3K' },
  '3km': { value: 3, display: '3K' },
  '5k': { value: 5, display: '5K' },
  '5km': { value: 5, display: '5K' },
  '6k': { value: 6, display: '6K' },
  '6km': { value: 6, display: '6K' },
  '7k': { value: 7, display: '7K' },
  '7km': { value: 7, display: '7K' },
  '8k': { value: 8, display: '8K' },
  '8km': { value: 8, display: '8K' },
  '10k': { value: 10, display: '10K' },
  '10km': { value: 10, display: '10K' },
  '15k': { value: 15, display: '15K' },
  '15km': { value: 15, display: '15K' },
  '21k': { value: 21, display: '21K (Meia Maratona)' },
  '21km': { value: 21, display: '21K (Meia Maratona)' },
  'meia': { value: 21, display: '21K (Meia Maratona)' },
  'meia maratona': { value: 21, display: '21K (Meia Maratona)' },
  '42k': { value: 42, display: '42K (Maratona)' },
  '42km': { value: 42, display: '42K (Maratona)' },
  'maratona': { value: 42, display: '42K (Maratona)' },
};

/**
 * Padroniza uma distância individual
 */
function standardizeDistance(distance: string): { value: number; display: string } | null {
  const normalized = distance.toLowerCase().trim();
  
  // Verifica mapeamento direto
  if (DISTANCE_MAPPING[normalized]) {
    return DISTANCE_MAPPING[normalized];
  }
  
  // Tenta extrair número seguido de 'k' ou 'km'
  const match = normalized.match(/(\d+)\s*k(m)?/);
  if (match) {
    const value = parseInt(match[1]);
    return { value, display: `${value}K` };
  }
  
  return null;
}

/**
 * Padroniza e ordena um array de distâncias
 */
export function standardizeAndSortDistances(distances: string[]): string[] {
  if (!distances || distances.length === 0) {
    return [];
  }
  
  const standardized = distances
    .map(distance => standardizeDistance(distance))
    .filter((item): item is { value: number; display: string } => item !== null)
    .sort((a, b) => a.value - b.value)
    .map(item => item.display);
  
  // Remove duplicatas mantendo a ordem
  return Array.from(new Set(standardized));
}

/**
 * Formata distâncias para exibição inline (sem descrições longas)
 */
export function formatDistancesInline(distances: string[]): string[] {
  const standardized = standardizeAndSortDistances(distances);
  
  return standardized.map(distance => {
    // Para exibição inline, remove as descrições longas
    if (distance.includes('(Meia Maratona)')) {
      return '21K';
    }
    if (distance.includes('(Maratona)')) {
      return '42K';
    }
    return distance;
  });
}