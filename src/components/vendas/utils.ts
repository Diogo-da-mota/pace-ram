import { VendaEvento } from './types';

export const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

export const calcularResumoVenda = (evento: VendaEvento) => {
  const totalBruto = evento.vendas.reduce((acc, v) => acc + v.valorVendido, 0);
  const taxaPlataforma = totalBruto * 0.10;
  const totalLiquido = totalBruto - taxaPlataforma;
  const totalFreelancers = evento.vendas
    .filter(v => v.tipo === 'freelancer')
    .reduce((acc, v) => acc + (v.valorPago || 0), 0);
  const valorDividir = totalLiquido - totalFreelancers;
  const parteIdealCadaSocio = valorDividir / 2;

  const vendaDiogo = evento.vendas.find(v => v.nome === 'Diogo');
  const vendaAziel = evento.vendas.find(v => v.nome === 'Aziel');
  const contaDiogo = vendaDiogo?.contaBancaria || 0;
  const contaAziel = vendaAziel?.contaBancaria || 0;

  const quemPagou = evento.quemPagouFreelancers || 'Diogo';
  const diogoPosFreelancers = quemPagou === 'Diogo' ? contaDiogo - totalFreelancers : contaDiogo;
  const azielPosFreelancers = quemPagou === 'Aziel' ? contaAziel - totalFreelancers : contaAziel;

  let transferencia = 0;
  let quemTransfere = '';
  let quemRecebe = '';
  const diogoFinal = parteIdealCadaSocio;
  const azielFinal = parteIdealCadaSocio;

  if (diogoPosFreelancers > azielPosFreelancers) {
    transferencia = diogoPosFreelancers - parteIdealCadaSocio;
    quemTransfere = 'Diogo';
    quemRecebe = 'Aziel';
  } else if (azielPosFreelancers > diogoPosFreelancers) {
    transferencia = azielPosFreelancers - parteIdealCadaSocio;
    quemTransfere = 'Aziel';
    quemRecebe = 'Diogo';
  }

  return {
    totalBruto,
    taxaPlataforma,
    totalLiquido,
    totalFreelancers,
    valorDividir,
    parteIdealCadaSocio,
    contaDiogo,
    contaAziel,
    quemPagouFreelancers: quemPagou,
    diogoPosFreelancers,
    azielPosFreelancers,
    transferencia,
    quemTransfere,
    quemRecebe,
    diogoFinal,
    azielFinal
  };
};
