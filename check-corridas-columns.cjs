// Script simples para verificar as colunas da tabela corridas

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCorridasColumns() {
  console.log('🔍 VERIFICANDO COLUNAS DA TABELA CORRIDAS');
  console.log('='.repeat(50));
  
  try {
    // Tentar consulta básica para ver estrutura
    const { data, error } = await supabase
      .from('corridas')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erro ao acessar tabela corridas:', error.message);
      return;
    }

    console.log('✅ Tabela corridas acessível');
    console.log('📊 Registros encontrados:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('🔍 Colunas detectadas:', Object.keys(data[0]).join(', '));
    } else {
      console.log('📭 Tabela vazia');
      
      // Tentar inserir um registro temporário para descobrir as colunas
      console.log('🧪 Tentando descobrir estrutura da tabela...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('corridas')
        .insert({
          titulo: 'TESTE_ESTRUTURA',
          data_evento: '2025-01-01',
          local: 'Teste',
          descricao: 'Teste para descobrir estrutura'
        })
        .select('*');

      if (insertError) {
        console.log('❌ Erro ao inserir teste:', insertError.message);
        
        // Analisar o erro para entender a estrutura
        if (insertError.message.includes('column')) {
          console.log('💡 Informações sobre colunas no erro:', insertError.message);
        }
      } else {
        console.log('✅ Inserção de teste bem-sucedida');
        console.log('🔍 Colunas detectadas:', Object.keys(insertData[0]).join(', '));
        
        // Remover o registro de teste
        await supabase
          .from('corridas')
          .delete()
          .eq('id', insertData[0].id);
        
        console.log('🧹 Registro de teste removido');
      }
    }

    // Verificar outras tabelas também
    console.log('');
    console.log('📋 VERIFICANDO OUTRAS TABELAS');
    console.log('-'.repeat(30));
    
    const tabelas = ['categorias', 'usuarios'];
    
    for (const tabela of tabelas) {
      const { data: tabelaData, error: tabelaError } = await supabase
        .from(tabela)
        .select('*')
        .limit(1);

      if (tabelaError) {
        console.log(`❌ ${tabela}: ${tabelaError.message}`);
      } else {
        console.log(`✅ ${tabela}: ${tabelaData?.length || 0} registros`);
        if (tabelaData && tabelaData.length > 0) {
          console.log(`   Colunas: ${Object.keys(tabelaData[0]).join(', ')}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkCorridasColumns();