
// untuk object interface
// untuk status lebih baik type (fleksibel)


export interface Product {
  id: number;
  name: string;
  price: number;
}

interface Admin extends Product {
  permissions: string[];
}



type ProductStatus = "active" | "inactive" | "out_of_stock";

