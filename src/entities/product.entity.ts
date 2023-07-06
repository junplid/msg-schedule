export interface Plans {
  readonly id: number;
  name: string;
  price: number;
}

export interface Product<PlansI = Plans[]> {
  readonly id: number;
  name: string;
  price: number;
  plans: PlansI;
}
