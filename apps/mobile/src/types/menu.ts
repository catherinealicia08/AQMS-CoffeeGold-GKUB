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
}

export interface MenuAddon {
  name: string;
  price: number;
}
