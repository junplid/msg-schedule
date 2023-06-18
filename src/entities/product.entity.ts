export interface Plans {
  name: string;
  price: number;
}

export interface Product {
  readonly id: number;
  name?: string;
  price?: number;
  plans?: Plans[];
}
