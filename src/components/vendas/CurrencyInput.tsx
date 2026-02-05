import React from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CurrencyInput = ({ value, onChange, placeholder, className, disabled }: CurrencyInputProps) => {
  // Formata o valor número para string (ex: 1000 -> "1.000,00")
  const formatValue = (val: number) => {
    if (val === 0 && placeholder) return ''; // Se for 0 e tiver placeholder, retorna vazio (opcional, mas o user pediu placeholder)
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove tudo que não é dígito
    const digits = inputValue.replace(/\D/g, '');
    
    // Converte para número (divide por 100 para considerar os centavos)
    const numberValue = Number(digits) / 100;
    
    onChange(numberValue);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={value === 0 ? '' : formatValue(value)}
      onChange={handleChange}
      placeholder={placeholder || "0,00"}
      className={className}
      disabled={disabled}
    />
  );
};
