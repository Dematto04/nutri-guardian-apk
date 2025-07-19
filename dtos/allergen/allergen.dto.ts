export interface Allergen {
  id: number;
  name: string;
  category: string;
  scientificName: string | null;
  description: string;
  isFdaMajor: boolean;
  isEuMajor: boolean;
  createdAt: string; 
  updatedAt: string | null;
}
