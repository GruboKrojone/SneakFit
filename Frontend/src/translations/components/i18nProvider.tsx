import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import i18n from "../service/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const { locale } = useParams<{ locale: string }>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      if (locale) {
        await i18n.changeLanguage(locale);
      }
      setIsReady(true);
    };

    initI18n();
  }, [locale]);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
