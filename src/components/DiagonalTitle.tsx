interface DiagonalTitleProps {
  leftText?: string;
  rightText?: string;
  maxWidth?: string;
}

const DiagonalTitle = ({ 
  leftText = "Corridas", 
  rightText = "Recentes",
  maxWidth = "max-w-7xl"
}: DiagonalTitleProps) => {
  // Verificar se é especificamente o título "Corridas Recentes"
  const isCorridasRecentes = leftText === "Corridas" && rightText === "Recentes";
  // Verificar se é especificamente o título "Redes Sociais"
  const isRedesSociais = leftText === "Redes" && rightText === "Sociais";
  
  return (
    <div className={`w-full mb-12 ${isRedesSociais ? 'mt-12 md:mt-0' : ''}`}>
      {/* Container centralizado com a mesma largura dos cards */}
      <div className={`${maxWidth} mx-auto`}>
        {/* Títulos com barra decorativa do lado esquerdo */}
        <div className="flex items-center gap-4">
          {/* Diminuir comprimento da barra (w-20 -> w-16) e aumentar grossura (h-1 -> h-2) */}
          <div className="w-16 h-2 bg-blue-600 rounded flex-shrink-0"></div>
        
        <h2 className={`${
          // Igualar fonte de "Dúvidas" com "REDES SOCIAIS" - todos usam mesmo tamanho agora
          isRedesSociais ? 'text-4xl md:text-2xl lg:text-5xl' : 'text-4xl md:text-2xl lg:text-5xl'
        } font-light ${
          isCorridasRecentes ? 'text-white' : 
          isRedesSociais ? 'text-black dark:text-white' : 
          'text-gray-900 dark:text-white'
        }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
          <span className="font-bold tracking-wide">{leftText}</span>
          {rightText && (
            <span className={`ml-2 font-light ${
              isCorridasRecentes ? 'text-white' : 
              isRedesSociais ? 'text-black dark:text-white' :
              'text-gray-700 dark:text-gray-300'
            }`}>
              {rightText}
            </span>
          )}
        </h2>
        </div>
      </div>
    </div>
  );
};

export default DiagonalTitle;