import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';

export default function AdminPanel() {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Визначаємо напрямок тексту (наприклад, для арабської/івриту був би 'rtl')
  // Для укр/англ це завжди 'ltr', але ми динамічно його задаємо для виконання вимоги
  const textDirection = i18n.language === 'ar' ? 'rtl' : 'ltr';

  // Імітація списку користувачів для "Управління користувачами"
  const [users, setUsers] = useState(['Петров Давид (Адмін)', 'Іван Іваненко (Користувач)', 'Анна Коваленко (Користувач)']);

  // ПРАВИЛЬНЕ СОРТУВАННЯ ЗА ПРАВИЛАМИ МОВИ (Intl.Collator)
  const sortUsers = () => {
    const collator = new Intl.Collator(i18n.language, { sensitivity: 'base' });
    setUsers([...users].sort(collator.compare));
  };

  // ПРАВИЛЬНИЙ ФОРМАТ ДАТИ ТА ЧАСУ (Intl.DateTimeFormat)
  const getCurrentFormattedDate = () => {
    return new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date());
  };

  // РЕАЛЬНИЙ ЕКСПОРТ
  const handleExport = async () => {
    try {
      const response = await fetch('https://freshkeeper.davyd-petrov.workers.dev/api/Statistics');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Backup_${new Date().getTime()}.json`;
      link.click();
    } catch (error) {
      alert('Помилка при експорті.');
    }
  };

  // РЕАЛЬНИЙ ІМПОРТ НА СЕРВЕР
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Відправляємо дані на наш Cloudflare Worker
        const response = await fetch('https://freshkeeper.davyd-petrov.workers.dev/api/Admin/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importedData)
        });

        if (response.ok) {
          alert('Резервну копію успішно відновлено на сервері!');
        } else {
          alert('Сервер відхилив файл.');
        }
      } catch (error) {
        alert('Помилка: невірний формат файлу.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '20px', direction: textDirection }}>
      <h1>{t('adminPanel')}</h1>
      <p>Поточний час системи: <strong>{getCurrentFormattedDate()}</strong></p>

      <div style={{ border: '1px solid #ccc', padding: '15px', margin: '20px 0' }}>
        <h2>Керування даними (Експорт/Імпорт)</h2>
        <button onClick={handleExport} style={{ marginRight: '10px' }}>Завантажити бекап (Експорт)</button>
        
        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()}>Відновити з бекапу (Імпорт)</button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2>Управління користувачами</h2>
        <button onClick={sortUsers}>Сортувати за алфавітом ({i18n.language})</button>
        <ul>
          {users.map((user, idx) => <li key={idx}>{user}</li>)}
        </ul>
      </div>
    </div>
  );
}