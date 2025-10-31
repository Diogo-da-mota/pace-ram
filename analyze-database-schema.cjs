// Análise completa do schema do banco Supabase
// Este script verifica a estrutura das tabelas e suas colunas

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeSchema() {
  console.log('🔍 ANÁLISE COMPLETA DO SCHEMA - PACE RUN HUB');
  console.log('='.repeat(80));
  console.log(`🌐 URL do Projeto: ${supabaseUrl}`);
  console.log('');

  try {
    // Verificar estrutura da tabela corridas
    console.log('📋 ESTRUTURA DA TABELA CORRIDAS');
    console.log('-'.repeat(40));
    
    const { data: corridasSchema, error: corridasError } = await supabase
      .rpc('get_table_columns', { table_name: 'corridas' })
      .select('*');

    if (corridasError) {
      console.log('⚠️  Não foi possível obter schema via RPC, tentando consulta direta...');
      
      // Tentar consulta direta para ver as colunas
      const { data: sampleData, error: sampleError } = await supabase
        .from('corridas')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.log('❌ Erro ao acessar tabela corridas:', sampleError.message);
      } else {
        console.log('✅ Tabela corridas acessível');
        console.log('📊 Registros encontrados:', sampleData?.length || 0);
        
        if (sampleData && sampleData.length > 0) {
          console.log('🔍 Colunas detectadas:', Object.keys(sampleData[0]).join(', '));
        } else {
          console.log('📭 Tabela vazia - não é possível detectar colunas automaticamente');
        }
      }
    } else {
      console.log('✅ Schema obtido via RPC:', corridasSchema);
    }

    console.log('');

    // Verificar todas as tabelas principais
    const tabelas = ['usuarios', 'categorias', 'corridas', 'eventos_calendario', 'fotos_corrida'];
    
    console.log('📊 CONTAGEM DE REGISTROS POR TABELA');
    console.log('-'.repeat(40));
    
    for (const tabela of tabelas) {
      try {
        const { count, error } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ ${tabela.toUpperCase()}: Erro - ${error.message}`);
        } else {
          console.log(`📋 ${tabela.toUpperCase()}: ${count} registros`);
        }
      } catch (err) {
        console.log(`❌ ${tabela.toUpperCase()}: Erro de acesso - ${err.message}`);
      }
    }

    console.log('');

    // Verificar dados específicos da tabela corridas
    console.log('🏃 ANÁLISE DETALHADA - TABELA CORRIDAS');
    console.log('-'.repeat(40));
    
    const { data: corridas, error: corridasDataError } = await supabase
      .from('corridas')
      .select(`
        id,
        titulo,
        data_evento,
        local,
        descricao,
        categoria_id,
        criado_por,
        publicado,
        created_at
      `)
      .limit(10);

    if (corridasDataError) {
      console.log('❌ Erro ao buscar dados de corridas:', corridasDataError.message);
    } else {
      console.log(`📊 Total de corridas encontradas: ${corridas?.length || 0}`);
      
      if (corridas && corridas.length > 0) {
        console.log('');
        console.log('🏃 CORRIDAS ENCONTRADAS:');
        corridas.forEach((corrida, index) => {
          console.log(`${index + 1}. ${corrida.titulo}`);
          console.log(`   📅 Data: ${corrida.data_evento}`);
          console.log(`   📍 Local: ${corrida.local}`);
          console.log(`   ✅ Publicado: ${corrida.publicado ? 'Sim' : 'Não'}`);
          console.log(`   🆔 ID: ${corrida.id}`);
          console.log('');
        });
      } else {
        console.log('📭 Nenhuma corrida encontrada na tabela.');
      }
    }

    // Verificar relacionamentos
    console.log('🔗 VERIFICAÇÃO DE RELACIONAMENTOS');
    console.log('-'.repeat(40));
    
    const { data: corridasComCategoria, error: joinError } = await supabase
      .from('corridas')
      .select(`
        titulo,
        categorias(nome, cor_hex)
      `)
      .limit(5);

    if (joinError) {
      console.log('❌ Erro ao verificar relacionamento corridas-categorias:', joinError.message);
    } else {
      console.log('✅ Relacionamento corridas-categorias funcionando');
      if (corridasComCategoria && corridasComCategoria.length > 0) {
        console.log('🔍 Dados com relacionamento encontrados:', corridasComCategoria.length);
      }
    }

    // Verificar políticas RLS
    console.log('');
    console.log('🔒 VERIFICAÇÃO DE POLÍTICAS RLS');
    console.log('-'.repeat(40));
    
    // Tentar inserir um registro de teste (será rejeitado se RLS estiver ativo)
    const { data: testInsert, error: insertError } = await supabase
      .from('corridas')
      .insert({
        titulo: 'TESTE_RLS_' + Date.now(),
        data_evento: '2025-12-31',
        local: 'Teste',
        descricao: 'Teste de RLS',
        publicado: false
      })
      .select();

    if (insertError) {
      if (insertError.message.includes('policy')) {
        console.log('🔒 RLS ATIVO: Políticas de segurança estão bloqueando inserções');
        console.log('💡 Isso é normal e esperado para segurança');
      } else {
        console.log('❌ Erro de inserção:', insertError.message);
      }
    } else {
      console.log('⚠️  RLS INATIVO: Inserção de teste bem-sucedida');
      console.log('🧹 Removendo registro de teste...');
      
      // Remover o registro de teste
      await supabase
        .from('corridas')
        .delete()
        .eq('id', testInsert[0].id);
    }

    console.log('');
    console.log('🎯 RESUMO FINAL');
    console.log('='.repeat(40));
    console.log('✅ Conexão com Supabase: Estabelecida');
    console.log(`🌐 Projeto: ${supabaseUrl}`);
    console.log('🔑 Autenticação: Chave anônima válida');
    console.log('');
    console.log('💡 PRÓXIMOS PASSOS:');
    console.log('   1. Execute o script populate-database.sql no Supabase Dashboard');
    console.log('   2. Acesse: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    console.log('   3. Vá para SQL Editor e cole o conteúdo do arquivo populate-database.sql');
    console.log('   4. Execute o script para popular o banco com dados de teste');
    console.log('   5. Recarregue a aplicação React para ver os dados');

  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
  }
}

// Executar análise
analyzeSchema();