DO $$
DECLARE
  v_evento_id bigint;
BEGIN
  -- 1. Inserir o Evento e capturar o ID gerado
  INSERT INTO venda_eventos (nome, data, quem_pagou_freelancers)
  VALUES ('Corrida de Rua', '2026-02-01', 'Diogo')
  RETURNING id INTO v_evento_id;

  -- 2. Inserir os Itens de Venda vinculados a este evento
  INSERT INTO venda_itens (evento_id, nome, tipo, valor_vendido, conta_bancaria, valor_pago, valor_liquido)
  VALUES 
    -- Sócios
    (v_evento_id, 'Diogo', 'socio', 2788.51, 6546.59, 0, 0),
    (v_evento_id, 'Aziel', 'socio', 1784.25, 1784.25, 0, 0),
    -- Freelancers
    (v_evento_id, 'Talytta', 'freelancer', 2298.00, 0, 250.00, 2122.00),
    (v_evento_id, 'Franciele', 'freelancer', 1699.00, 0, 250.00, 1568.00),
    (v_evento_id, 'Matheus', 'freelancer', 306.67, 0, 300.00, 0),
    (v_evento_id, 'Vitor', 'freelancer', 306.67, 0, 300.00, 0);

END $$;
