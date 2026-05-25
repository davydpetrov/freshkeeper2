import { useTranslation } from 'react-i18next';

export default function UserDashboard() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '20px' }}>
      <h1>{t('dashboard')}</h1>
      <p>Тут будуть графіки {t('temperature')} та вологості...</p>
    </div>
  );
}