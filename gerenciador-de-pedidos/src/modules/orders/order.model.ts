
export interface OrderProduct {
  id: number;
  unit: string;
  pack_id: number | null;
  order_id: number;
  quantity: number;
  unit_price: number;
  product_sku: string;
  product_title: string;
  product_id_origem: string;
}

export interface Order {
  id: number;
  order_id_origem: string;
  order_origem: 'mercado_livre' | 'shopee';
  
  order_id_destiny: string | null;
  order_number_destiny: string | null;
  order_destiny: string | null;
  buyer_id: string;
  buyer_name: string;
  buyer_cnpj_cpf: string;
  buyer_type_cnpj_cpf: 'CNPJ' | 'CPF';
  buyer_taxpayer: string | null;
  address_street: string;
  address_number: string;
  address_zipcode: string;
  address_city: string;
  address_state: string;
  total_amount: number;
  paid_amount: string;
  shipping_mode: string;
  shipping_id: string;
  pack_id: string | null;
  order_status: string;
  order_created: string;
  order_updated: string;
  additional_information: string;
  observations: string;
  address_neighborhood: string;
  order_destiny_created: boolean | null;
  data_created: string;
  nfe_xml_url: string | null;
  nfe_danfe_url: string | null;
  nfe_number: string | null;
  nfe_acess_key: string | null;
  nfe_date_emission: string | null;
  check_send_nfe: boolean | null;
  check_confirmed_ship_order: boolean | null;
  address_complement: string | null;
  produtos: OrderProduct[];
}

export interface ApiResponse {
  totalItems: string;
  data: Order[];
}
