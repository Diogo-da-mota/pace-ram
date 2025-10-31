/**
 * Script para popular o banco Supabase com dados de teste
 * Cria categorias, usuários e corridas de exemplo
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de teste
const categorias = [
  { nome: 'Maratona', descricao: 'Corridas de 42,195 km', cor_hex: '#E11D48', ativo: true },
  { nome: 'Meia Maratona', descricao: 'Corridas de 21,097 km', cor_hex: '#3B82F6', ativo: true },
  { nome: '10K', descricao: 'Corridas de 10 quilômetros', cor_hex: '#10B981', ativo: true },
  { nome: '5K', descricao: 'Corridas de 5 quilômetros', cor_hex: '#F59E0B', ativo: true },
  { nome: 'Trail Run', descricao: 'Corridas em trilhas', cor_hex: '#8B5CF6', ativo: true }
];

const usuarios = [
  {
    nome: 'Admin Sistema',
    email: 'admin@pacerunhub.com',
    tipo_usuario: 'admin',
    ativo: true
  },
  {
    nome: 'João Silva',
    email: 'joao@email.com',
    tipo_usuario: 'usuario',
    ativo: true
  }
];

const corridas = [
  {
    titulo: 'Maratona Internacional de São Paulo 2024',
    data_evento: '2024-12-31',
    local: 'São Paulo, SP - Ibirapuera',
    descricao: 'A maior maratona da América Latina com percurso pelos principais pontos turísticos de São Paulo.',
    imagem_principal: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    link_externo: 'https://maratonasp.com.br',
    texto_rodape: 'Inscrições até 15/12/2024',
    categoria_nome: 'Maratona',
    publicado: true
  },
  {
    titulo: 'Corrida de Reis - Rio de Janeiro 2025',
    data_evento: '2025-01-06',
    local: 'Rio de Janeiro, RJ - Copacabana',
    descricao: 'Tradicional corrida de início de ano na orla de Copacabana.',
    imagem_principal: 'https://images.unsplash.com/photo-1544737151-6e4b9d1b2e3f?w=800&h=600&fit=crop',
    link_externo: 'https://corridadereis.com.br',
    texto_rodape: 'Evento gratuito',
    categoria_nome: '10K',
    publicado: true
  },
  {
    titulo: 'Trail Run Serra da Mantiqueira',
    data_evento: '2025-02-15',
    local: 'Campos do Jordão, SP',
    descricao: 'Corrida em trilha pela Serra da Mantiqueira com paisagens deslumbrantes.',
    imagem_principal: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
    link_externo: 'https://trailmantiqueira.com.br',
    texto_rodape: 'Vagas limitadas',
    categoria_nome: 'Trail Run',
    publicado: true
  },
  {
    titulo: 'Meia Maratona de Brasília',
    data_evento: '2025-03-20',
    local: 'Brasília, DF',
    descricao: 'Percurso pela Esplanada dos Ministérios e Eixo Monumental.',
    imagem_principal: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop',
    link_externo: 'https://meiamaratonabsb.com.br',
    texto_rodape: 'Medalha para todos',
    categoria_nome: 'Meia Maratona',
    publicado: true
  },
  {
    titulo: 'Corrida Noturna Ibirapuera',
    data_evento: '2025-04-10',
    local: 'São Paulo, SP - Parque Ibirapuera',
    descricao: 'Corrida noturna pelas alamedas do Parque Ibirapuera.',
    imagem_principal: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&h=600&fit=crop',
    link_externo: 'https://corridanoturna.com.br',
    texto_rodape: 'Kit com camiseta',
    categoria_nome: '5K',
    publicado: true
  }
];

async function popularCategorias() {
  console.log('📂 Inserindo categorias...');
  
  for (const categoria of categorias) {
    const { data, error } = await supabase
      .from('categorias')
      .upsert(categoria, { onConflict: 'nome' })
      .select();
    
    if (error) {
      console.log(`❌ Erro ao inserir categoria ${categoria.nome}:`, error.message);
    } else {
      console.log(`✅ Categoria ${categoria.nome} inserida`);
    }
  }
}

async function popularUsuarios() {
  console.log('\n👥 Inserindo usuários...');
  
  for (const usuario of usuarios) {
    const { data, error } = await supabase
      .from('usuarios')
      .upsert(usuario, { onConflict: 'email' })
      .select();
    
    if (error) {
      console.log(`❌ Erro ao inserir usuário ${usuario.email}:`, error.message);
    } else {
      console.log(`✅ Usuário ${usuario.email} inserido`);
    }
  }
}

async function popularCorridas() {
  console.log('\n🏃 Inserindo corridas...');
  
  // Buscar categorias e usuários para fazer os relacionamentos
  const { data: categoriasDB } = await supabase.from('categorias').select('*');
  const { data: usuariosDB } = await supabase.from('usuarios').select('*');
  
  const adminUser = usuariosDB?.find(u => u.tipo_usuario === 'admin');
  
  if (!adminUser) {
    console.log('❌ Usuário admin não encontrado');
    return;
  }
  
  for (const corrida of corridas) {
    const categoria = categoriasDB?.find(c => c.nome === corrida.categoria_nome);
    
    if (!categoria) {
      console.log(`❌ Categoria ${corrida.categoria_nome} não encontrada para corrida ${corrida.titulo}`);
      continue;
    }
    
    const corridaData = {
      titulo: corrida.titulo,
      data_evento: corrida.data_evento,
      local: corrida.local,
      descricao: corrida.descricao,
      imagem_principal: corrida.imagem_principal,
      link_externo: corrida.link_externo,
      texto_rodape: corrida.texto_rodape,
      categoria_id: categoria.id,
      criado_por: adminUser.id,
      publicado: corrida.publicado
    };
    
    const { data, error } = await supabase
      .from('corridas')
      .insert(corridaData)
      .select();
    
    if (error) {
      console.log(`❌ Erro ao inserir corrida ${corrida.titulo}:`, error.message);
    } else {
      console.log(`✅ Corrida ${corrida.titulo} inserida`);
    }
  }
}

async function verificarResultados() {
  console.log('\n📊 VERIFICANDO RESULTADOS:');
  console.log('=' .repeat(40));
  
  // Contar registros em cada tabela
  const tabelas = ['categorias', 'usuarios', 'corridas'];
  
  for (const tabela of tabelas) {
    const { count, error } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${tabela}: Erro ao contar`);
    } else {
      console.log(`✅ ${tabela}: ${count} registros`);
    }
  }
  
  // Mostrar algumas corridas
  console.log('\n🏃 CORRIDAS INSERIDAS:');
  const { data: corridasInseridas, error } = await supabase
    .from('corridas')
    .select(`
      titulo,
      data_evento,
      local,
      publicado,
      categorias(nome)
    `)
    .order('data_evento');
  
  if (error) {
    console.log('❌ Erro ao buscar corridas:', error.message);
  } else {
    corridasInseridas?.forEach((corrida, index) => {
      const status = corrida.publicado ? '📢' : '📝';
      console.log(`   ${index + 1}. ${status} ${corrida.titulo} (${corrida.data_evento})`);
      console.log(`      📍 ${corrida.local}`);
      console.log(`      🏷️  ${corrida.categorias?.nome}`);
      console.log('');
    });
  }
}

async function main() {
  console.log('🚀 POPULANDO BANCO DE DADOS SUPABASE');
  console.log('=' .repeat(50));
  console.log(`🌐 Projeto: ${supabaseUrl}`);
  console.log('');
  
  try {
    await popularCategorias();
    await popularUsuarios();
    await popularCorridas();
    await verificarResultados();
    
    console.log('\n🎉 POPULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('💡 Agora você pode:');
    console.log('   • Acessar a aplicação React');
    console.log('   • Ver as corridas na página inicial');
    console.log('   • Fazer login no dashboard');
    console.log('   • Verificar dados no Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Erro durante a população:', error.message);
    process.exit(1);
  }
}

// Executar
main();