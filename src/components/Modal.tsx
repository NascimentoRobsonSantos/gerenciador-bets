'use client';

import { Order, OrderProduct } from '@/modules/orders/order.model';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { formatCurrencyPtBr } from '@/lib/utils';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function EditModal({ isOpen, onClose, order }: EditModalProps) {
  const [editedOrder, setEditedOrder] = useState<Order | null>(order);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedOrder(order);
  }, [order]);

  if (!isOpen || !editedOrder) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedOrder(prev => {
      if (!prev) return null;
      if (name === 'total_amount') {
        return { ...prev, [name]: parseFloat(value.replace('.', '').replace(',', '.')) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedOrder(prev => {
      if (!prev) return null;
      const newProducts = [...prev.produtos];
      const product = newProducts[index];

      if (name === 'quantity' || name === 'unit_price') {
        newProducts[index] = { ...product, [name]: Number(value) };
      } else {
        newProducts[index] = { ...product, [name]: value };
      }
      
      return { ...prev, produtos: newProducts };
    });
  };

  const handleSaveChanges = async () => {
    if (!editedOrder) return;
    setIsLoading(true);
    try {
      const response = await fetch('https://webhook.clientes.acontece.ai/webhook/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedOrder),
      });

      if (response.ok) {
        console.log('Order updated successfully');
        onClose();
      } else {
        console.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Editar Pedido</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
          </TabsList>
          <TabsContent value="geral">
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              {/* Client Data */}
              <div className="flex flex-col gap-2 col-span-full">
                <Label htmlFor="buyer_name">Cliente</Label>
                <Input id="buyer_name" name="buyer_name" value={editedOrder.buyer_name} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
              </div>
              <div className="flex flex-col gap-2 col-span-full">
                <Label htmlFor="buyer_cnpj_cpf">CNPJ/CPF</Label>
                <Input id="buyer_cnpj_cpf" name="buyer_cnpj_cpf" value={editedOrder.buyer_cnpj_cpf} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-full">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="order_id_origem">N° Pedido</Label>
                  <Input id="order_id_origem" name="order_id_origem" value={editedOrder.order_id_origem} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="order_origem">Origem</Label>
                  <Input id="order_origem" name="order_origem" value={editedOrder.order_origem} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="total_amount">Valor Total</Label>
                  <Input id="total_amount" name="total_amount" value={formatCurrencyPtBr(editedOrder.total_amount) || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
              </div>

              {/* Address Fields */}
              <div className="flex flex-col gap-2 col-span-full">
                <Label htmlFor="address_street">Endereço</Label>
                <Input id="address_street" name="address_street" value={editedOrder.address_street} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-full">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input id="address_number" name="address_number" value={editedOrder.address_number} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address_complement">Complemento</Label>
                  <Input id="address_complement" name="address_complement" value={editedOrder.address_complement || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address_neighborhood">Bairro</Label>
                  <Input id="address_neighborhood" name="address_neighborhood" value={editedOrder.address_neighborhood || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input id="address_city" name="address_city" value={editedOrder.address_city || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address_state">Estado</Label>
                  <Input id="address_state" name="address_state" value={editedOrder.address_state || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address_zipcode">CEP</Label>
                  <Input id="address_zipcode" name="address_zipcode" value={editedOrder.address_zipcode || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-600" disabled={editedOrder.order_destiny_created} />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="produtos">
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              <h3 className="text-lg font-medium mb-2">Produtos</h3>
              <div className="grid grid-cols-1 gap-2 max-h-[20vh] overflow-y-auto">
                {editedOrder.produtos.map((product, index) => (
                  <div key={product.id} className="grid grid-cols-12 items-center gap-2 p-2 rounded-md bg-gray-800">
                    <Input name="product_sku" placeholder="SKU" value={product.product_sku || ''} onChange={(e) => handleProductChange(index, e)} className="col-span-2 bg-gray-700 border-gray-600" disabled={editedOrder.order_destiny_created} />
                    <Input name="product_title" placeholder="Título" value={product.product_title || ''} onChange={(e) => handleProductChange(index, e)} className="col-span-7 bg-gray-700 border-gray-600" disabled={editedOrder.order_destiny_created} />
                    <Input name="quantity" placeholder="Qtd" value={product.quantity || 0} onChange={(e) => handleProductChange(index, e)} className="col-span-1 bg-gray-700 border-gray-600" disabled={editedOrder.order_destiny_created} />
                    <Input name="unit_price" placeholder="Preço" value={product.unit_price || 0} onChange={(e) => handleProductChange(index, e)} className="col-span-2 bg-gray-700 border-gray-600" disabled={editedOrder.order_destiny_created} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="observacoes">
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
              {/* Additional Info and Observations */}
              <div className="flex flex-col gap-2 col-span-full mt-4">
                <Label htmlFor="additional_info">Informações Adicionais</Label>
                <textarea
                  id="additional_info"
                  name="additional_info"
                  rows={3}
                  value={(editedOrder as any).additional_information || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editedOrder.order_destiny_created}
                ></textarea>
              </div>
              <div className="flex flex-col gap-2 col-span-full">
                <Label htmlFor="observations">Observações</Label>
                <textarea
                  id="observations"
                  name="observations"
                  rows={3}
                  value={(editedOrder as any).observations || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editedOrder.order_destiny_created}
                ></textarea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges} disabled={editedOrder.order_destiny_created || isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}