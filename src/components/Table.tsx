'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Order } from '@/modules/orders/order.model';
import { CheckCircle, XCircle, Edit, RefreshCw } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateTimePtBr, formatCurrencyPtBr } from '@/lib/utils';

const EditModal = dynamic(() => import('@/components/Modal').then(mod => mod.EditModal), { ssr: false });

interface OrdersTableProps {
  orders: Order[];
  totalItems: number;
  searchParams: { page?: string; limit?: string };
  startDate: string;
  endDate: string;
  onFilter: (startDate: string, endDate: string) => void;
  isFilterLoading: boolean;
}

export function OrdersTable({ orders, totalItems, searchParams }: OrdersTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIntegrating, setIsIntegrating] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleIntegrateClick = async (order: Order) => {
    setIsIntegrating(order.id.toString());
    toast.loading('Integrando pedido...');
    try {
      let url = 'https://webhook.clientes.acontece.ai/webhook/send_orders_omie_manual';
      if (order.order_origem === 'mercado_livre') {
        url += '_mercado_livre';
      } else if (order.order_origem === 'shopee') {
        url += '_shopee';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: order.id }),
      });

      if (response.ok) {
        toast.success('Pedido integrado com sucesso!');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Falha ao integrar o pedido: ${errorData.message}` );
      }
    } catch (error) {
      toast.error('Erro ao integrar o pedido.');
    } finally {
      setIsIntegrating(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800 hover:bg-gray-700">
              <TableHead className="text-white text-center">Data</TableHead>
              <TableHead className="text-white text-center">Nº do Pedido</TableHead>
              <TableHead className="text-white text-center">Cliente</TableHead>
              <TableHead className="text-white text-center">Valor Total</TableHead>
              <TableHead className="text-white text-center">Status Integração</TableHead>
              <TableHead className="text-white text-center">Pedido Integração</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.map((order) => (
              <TableRow key={order.id} className="border-gray-800 hover:bg-gray-800/50">
                <TableCell className="text-center">{formatDateTimePtBr(order.order_created)}</TableCell>
                <TableCell className="text-center">{order.order_id_origem}</TableCell>
                <TableCell className="text-center">{order.buyer_name}</TableCell>
                <TableCell className="text-center">R$ {formatCurrencyPtBr(order.total_amount)}</TableCell>
                <TableCell className="text-center">
                  {order.order_destiny_created ? (
                    <span className="flex items-center justify-center text-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Integrado
                    </span>
                  ) : (
                    <span className="flex items-center justify-center text-red-500">
                      <XCircle className="h-4 w-4 mr-1" />
                      Não Integrado
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">{order.order_number_destiny || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2 border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400" onClick={() => handleEditClick(order)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                    onClick={() => handleIntegrateClick(order)}
                    disabled={order.order_destiny_created || isIntegrating === order.id}
                  >
                    {isIntegrating === order.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Integrando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Integrar
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        totalItems={totalItems}
        limit={Number(currentSearchParams.get('limit')) || 10}
      />
      <EditModal isOpen={isModalOpen} onClose={closeModal} order={selectedOrder} />
    </>
  );
}
