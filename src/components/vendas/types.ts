export type VendaFotografo = {
  nome: string;
  tipo: 'socio' | 'freelancer';
  valorVendido: number;
  contaBancaria?: number;
  valorPago?: number;
  valorLiquido?: number;
  porcentagem?: number;
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
  totalVendidoSite: number;
  comissaoPercentual: number;
  valorLiquido: number; // Readonly from DB
  dividirLucros?: boolean;
  vendas: VendaFotografo[];
  despesas?: Despesa[];
};
