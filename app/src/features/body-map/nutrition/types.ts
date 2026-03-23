export interface NutritionItem {
  name: string;
  value: number;
  unit: string;
  range: string;
  status: 'normal' | 'low' | 'high' | 'deficient';
  category: 'vitamin' | 'mineral';
  description: string;
}
