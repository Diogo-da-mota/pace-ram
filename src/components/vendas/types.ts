export type VendaFotografo = {
  nome: string;
  tipo: 'socio' | 'freelancer';
  valorVendido: number;
  contaBancaria?: number;
  valorPago?: number;
  valorLiquido?: number;
};

export type Despesa = {
  descricao: string;
  valor: number;
  quemPagou: 'Diogo' | 'Aziel' | 'Caixa';
};

export type VendaEvento = {
  id: number;
  nome: string;
  data: string;
  quemPagouFreelancers: 'Diogo' | 'Aziel';
  vendas: VendaFotografo[];
  despesas?: Despesa[];
};
