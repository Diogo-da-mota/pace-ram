interface SectionTitleProps {
  title: string;
  subtitle?: string;
  showUnderline?: boolean;
}

const SectionTitle = ({ title, subtitle, showUnderline = false }: SectionTitleProps) => {
  return (
    <div className="text-center mb-12 animate-slide-up">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {showUnderline && (
        <div className="w-60 h-1 bg-blue-600 rounded mx-auto mt-1"></div>
      )}
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;