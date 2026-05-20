export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  description?: string;
  options?: MenuOption[];
  addons?: MenuAddon[];
}

export interface MenuOption {
  name: string;
  choices: string[];
  prices?: number[]; // parallel with choices, e.g. [0, 5000, 10000]
}

export interface MenuAddon {
  name: string;
  price: number;
}
