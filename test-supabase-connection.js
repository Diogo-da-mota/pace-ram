/**
 * Script para testar conexão com Supabase e analisar dados da tabela corridas
 * Análise completa da estrutura e dados do banco
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase - usando as credenciais hardcoded dos scripts existentes
const supabaseUrl = 'https://oowclaofuhcfdqcjmvmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd2NsYW9mdWhjZmRxY2ptdm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3Mzk3NjAsImV4cCI6MjA3MjMxNTc2MH0.9ETMv1iaN7LEcJOHuS26cLpp1cEO4w7BM0bPEoGugvQ';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 ANÁLISE COMPLETA DO SUPABASE - PACE RUN HUB');
console.log('=' .repeat(80));
console.log(`🌐 URL do Projeto: ${supabaseUrl}`);
console.log(`🔑 Chave Anônima: ${supabaseKey.substring(0, 30)}...`);
console.log('');

async function testarConexao() {
  try {
    console.log('🔌 TESTE DE CONEXÃO');
    console.log('-'.repeat(40));
    
    // Teste básico de conexão
    const { data, error } = await supabase.from('corridas').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      console.log('📋 Detalhes do erro:', error);
      return false;
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log(`📊 Total de registros na tabela corridas: ${data || 0}`);
      return true;
    }
  } catch (err) {
    console.log('❌ Erro crítico na conexão:', err.message);
    return false;
  }
}

async function analisarEstruturaBanco() {
  console.log('\n🏗️ ANÁLISE DA ESTRUTURA DO BANCO');
  console.log('-'.repeat(40));
  
  const tabelas = ['usuarios', 'categorias', 'corridas', 'eventos_calendario', 'fotos_corrida'];
  
  for (const tabela of tabelas) {
    try {
      console.log(`\n📋 Tabela: ${tabela.toUpperCase()}`);
      
      // Contar registros
      const { count, error: countError } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`   ❌ Erro ao acessar: ${countError.message}`);
        continue;
      }
      
      console.log(`   📊 Total de registros: ${count || 0}`);
      
      // Se houver dados, mostrar alguns exemplos
      if (count > 0) {
        const { data: exemplos, error: exemploError } = await supabase
          .from(tabela)
          .select('*')
          .limit(3);
        
        if (!exemploError && exemplos && exemplos.length > 0) {
          console.log(`   📝 Exemplo de dados:`);
          exemplos.forEach((item, index) => {
            console.log(`      ${index + 1}. ${JSON.stringify(item, null, 2).substring(0, 200)}...`);
          });
        }
      }
      
    } catch (err) {
      console.log(`   ❌ Erro crítico na tabela ${tabela}: ${err.message}`);
    }
  }
}

async function analisarCorridasDetalhado() {
  console.log('\n🏃 ANÁLISE DETALHADA DA TABELA CORRIDAS');
  console.log('-'.repeat(40));
  
  try {
    // Buscar todas as corridas com joins
    const { data: corridas, error } = await supabase
      .from('corridas')
      .select(`
        *,
        categorias(id, nome, descricao, cor_hex),
        usuarios(id, nome, email, tipo_usuario)
      `)
      .order('criado_em', { ascending: false });
    
    if (error) {
      console.log('❌ Erro ao buscar corridas:', error.message);
      console.log('📋 Detalhes:', error);
      return;
    }
    
    if (!corridas || corridas.length === 0) {
      console.log('📭 Nenhuma corrida encontrada na tabela.');
      console.log('💡 Isso significa que:');
      console.log('   • A tabela existe mas está vazia');
      console.log('   • As políticas RLS podem estar bloqueando o acesso');
      console.log('   • Os dados ainda não foram inseridos');
      return;
    }
    
    console.log(`✅ ${corridas.length} corrida(s) encontrada(s):`);
    console.log('');
    
    corridas.forEach((corrida, index) => {
      console.log(`📌 CORRIDA ${index + 1}:`);
      console.log(`   🏷️  ID: ${corrida.id}`);
      console.log(`   📝 Título: ${corrida.titulo}`);
      console.log(`   📅 Data: ${corrida.data_evento}`);
      console.log(`   📍 Local: ${corrida.local}`);
      console.log(`   📢 Publicado: ${corrida.publicado ? 'Sim' : 'Não'}`);
      console.log(`   🏷️  Categoria: ${corrida.categorias?.nome || 'Sem categoria'}`);
      console.log(`   👤 Criado por: ${corrida.usuarios?.nome || 'Usuário não encontrado'}`);
      console.log(`   🕒 Criado em: ${corrida.criado_em}`);
      
      if (corrida.descricao) {
        console.log(`   📄 Descrição: ${corrida.descricao.substring(0, 100)}...`);
      }
      
      if (corrida.imagem_principal) {
        console.log(`   🖼️  Imagem: ${corrida.imagem_principal}`);
      }
      
      if (corrida.link_externo) {
        console.log(`   🔗 Link: ${corrida.link_externo}`);
      }
      
      console.log('');
    });
    
  } catch (err) {
    console.log('❌ Erro crítico na análise de corridas:', err.message);
  }
}

async function verificarPoliticasRLS() {
  console.log('\n🔒 VERIFICAÇÃO DE POLÍTICAS RLS');
  console.log('-'.repeat(40));
  
  try {
    // Tentar diferentes tipos de consulta para identificar problemas de RLS
    console.log('🔍 Testando acesso direto à tabela corridas...');
    
    const { data: teste1, error: erro1 } = await supabase
      .from('corridas')
      .select('id')
      .limit(1);
    
    if (erro1) {
      console.log('❌ Acesso direto falhou:', erro1.message);
      if (erro1.message.includes('RLS') || erro1.message.includes('policy')) {
        console.log('🔒 Problema identificado: Políticas RLS estão bloqueando o acesso');
      }
    } else {
      console.log('✅ Acesso direto funcionou');
    }
    
    // Testar com função personalizada se existir
    console.log('\n🔍 Testando função get_corridas_publicadas...');
    const { data: teste2, error: erro2 } = await supabase
      .rpc('get_corridas_publicadas', { limite: 5 });
    
    if (erro2) {
      console.log('❌ Função RPC falhou:', erro2.message);
    } else {
      console.log('✅ Função RPC funcionou');
      console.log(`📊 Retornou ${teste2?.length || 0} registros`);
    }
    
  } catch (err) {
    console.log('❌ Erro na verificação de RLS:', err.message);
  }
}

async function main() {
  console.log('🚀 Iniciando análise completa...');
  console.log('');
  
  // 1. Testar conexão básica
  const conexaoOk = await testarConexao();
  
  if (!conexaoOk) {
    console.log('\n❌ Falha na conexão. Verifique:');
    console.log('   • URL do Supabase está correta');
    console.log('   • Chave anônima está válida');
    console.log('   • Projeto Supabase está ativo');
    console.log('   • Conexão com internet está funcionando');
    return;
  }
  
  // 2. Analisar estrutura do banco
  await analisarEstruturaBanco();
  
  // 3. Análise detalhada da tabela corridas
  await analisarCorridasDetalhado();
  
  // 4. Verificar políticas RLS
  await verificarPoliticasRLS();
  
  console.log('\n🎯 RESUMO DA ANÁLISE');
  console.log('=' .repeat(40));
  console.log('✅ Conexão com Supabase: Estabelecida');
  console.log('📊 Projeto: https://oowclaofuhcfdqcjmvmr.supabase.co');
  console.log('🔑 Autenticação: Chave anônima válida');
  console.log('');
  console.log('💡 PRÓXIMOS PASSOS RECOMENDADOS:');
  console.log('   1. Verificar se há arquivo .env configurado');
  console.log('   2. Popular banco com dados de teste');
  console.log('   3. Verificar políticas RLS no Supabase Dashboard');
  console.log('   4. Testar autenticação de usuários');
  console.log('');
  console.log('🔗 Acesse o Supabase Dashboard em:');
  console.log('   https://supabase.com/dashboard/project/oowclaofuhcfdqcjmvmr');
}

// Executar análise
main().catch(error => {
  console.error('❌ Erro fatal na execução:', error);
  process.exit(1);
});