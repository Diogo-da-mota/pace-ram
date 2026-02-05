import { VendaEvento } from './types';

export const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

export const calcularResumoVenda = (evento: VendaEvento) => {
  // Preferir o valor total vendido do site se disponível (maior que 0), caso contrário usa a soma manual
  const totalBruto = evento.totalVendidoSite > 0 
    ? evento.totalVendidoSite 
    : evento.vendas.reduce((acc, v) => acc + v.valorVendido, 0);

  // Calcular comissão (usar percentual salvo ou padrão 10%)
  const percentualComissao = evento.comissaoPercentual ?? 10;
  const taxaPlataforma = totalBruto * (percentualComissao / 100);
  
  // Líquido é Bruto - Comissão
  const totalLiquido = totalBruto - taxaPlataforma;

  const totalFreelancers = evento.vendas
    .filter(v => v.tipo === 'freelancer')
    .reduce((acc, v) => acc + (v.valorPago || 0), 0);
  
  // Subtrair despesas se houver (assumindo que saem do líquido antes da divisão)
  const totalDespesas = (evento.despesas || []).reduce((acc, d) => acc + d.valor, 0);
  
  const valorDividir = totalLiquido - totalFreelancers - totalDespesas;
  
  let parteIdealDiogo = 0;
  let parteIdealAziel = 0;

  // Se dividirLucros for undefined, assume true (comportamento padrão/antigo)
  const deveDividir = evento.dividirLucros !== false;

  if (deveDividir) {
    // Modo "Dividir Lucros": 50/50 do lucro final
    parteIdealDiogo = valorDividir / 2;
    parteIdealAziel = valorDividir / 2;
  } else {
    // Modo "Não Dividir Lucros": Cada um fica com sua venda líquida menos 50% das despesas
    const totalDespesasGerais = totalFreelancers + totalDespesas;
    const metadeDespesas = totalDespesasGerais / 2;

    const vendaDiogoBruta = evento.vendas
      .filter(v => v.nome === 'Diogo')
      .reduce((acc, v) => acc + v.valorVendido, 0);
    
    const vendaAzielBruta = evento.vendas
      .filter(v => v.nome === 'Aziel')
      .reduce((acc, v) => acc + v.valorVendido, 0);

    // Calcular taxa proporcional
    const taxaDiogo = vendaDiogoBruta * (percentualComissao / 100);
    const taxaAziel = vendaAzielBruta * (percentualComissao / 100);

    const vendaDiogoLiquida = vendaDiogoBruta - taxaDiogo;
    const vendaAzielLiquida = vendaAzielBruta - taxaAziel;

    parteIdealDiogo = vendaDiogoLiquida - metadeDespesas;
    parteIdealAziel = vendaAzielLiquida - metadeDespesas;
  }

  // Mantendo a variável original para compatibilidade visual onde mostra "Cada Sócio"
  // Se não dividir, essa métrica perde um pouco o sentido, mas podemos mostrar a média ou 0
  const parteIdealCadaSocio = deveDividir ? parteIdealDiogo : 0; 

  const vendaDiogo = evento.vendas.find(v => v.nome === 'Diogo');
  const vendaAziel = evento.vendas.find(v => v.nome === 'Aziel');
  const contaDiogo = vendaDiogo?.contaBancaria || 0;
  const contaAziel = vendaAziel?.contaBancaria || 0;

  const quemPagou = evento.quemPagouFreelancers || 'Diogo';
  
  // Ajustar saldo considerando quem pagou freelancers e despesas
  // Assumindo por enquanto que despesas "Caixa" já foram pagas ou saem do montante geral
  // Se despesa tem "quemPagou", deve ser abatido do saldo da pessoa
  
  let diogoGastos = quemPagou === 'Diogo' ? totalFreelancers : 0;
  let azielGastos = quemPagou === 'Aziel' ? totalFreelancers : 0;

  (evento.despesas || []).forEach(despesa => {
    if (despesa.quemPagou === 'Diogo') diogoGastos += despesa.valor;
    if (despesa.quemPagou === 'Aziel') azielGastos += despesa.valor;
  });

  const diogoPosFreelancers = contaDiogo - diogoGastos;
  const azielPosFreelancers = contaAziel - azielGastos;

  let transferencia = 0;
  let quemTransfere = '';
  let quemRecebe = '';
  const diogoFinal = parteIdealDiogo;
  const azielFinal = parteIdealAziel;

  // Lógica de transferência para equalizar
  // O objetivo é que ambos terminem com sua parte ideal (seja ela igual ou proporcional)
  // Diferença entre o que tem (posFreelancers) e o que deveria ter (parteIdeal)
  
  const diferencaDiogo = diogoPosFreelancers - parteIdealDiogo;
  const diferencaAziel = azielPosFreelancers - parteIdealAziel;

  if (diferencaDiogo > 0.01) { // Usando tolerância pequena para float
    transferencia = diferencaDiogo;
    quemTransfere = 'Diogo';
    quemRecebe = 'Aziel';
  } else if (diferencaAziel > 0.01) {
    transferencia = diferencaAziel;
    quemTransfere = 'Aziel';
    quemRecebe = 'Diogo';
  }

  return {
    totalBruto,
    taxaPlataforma,
    percentualComissao,
    totalLiquido,
    totalFreelancers,
    totalDespesas,
    valorDividir,
    parteIdealCadaSocio, // Será usado apenas se dividirLucros for true ou para display genérico
    parteIdealDiogo,
    parteIdealAziel,
    contaDiogo,
    contaAziel,
    quemPagouFreelancers: quemPagou,
    diogoPosFreelancers,
    azielPosFreelancers,
    transferencia,
    quemTransfere,
    quemRecebe,
    diogoFinal,
    azielFinal,
    deveDividir
  };
};
