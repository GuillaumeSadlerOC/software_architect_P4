import { useTranslations } from 'next-intl';

interface FooterProps {
  variant?: 'light' | 'dark';
}

/**
 * Footer common to all pages
 */
export default function Footer({ variant = 'light' }: FooterProps) {
  const t = useTranslations('Common');

  return (
    <footer className="w-full py-4">
      <div className="ds-footer justify-center">
        <p className={`text-base font-normal ${
          variant === 'light' 
            ? 'text-white' 
            : 'text-muted-foreground'
        }`}>
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}