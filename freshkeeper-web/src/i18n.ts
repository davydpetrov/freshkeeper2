import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_title": "❄️ FreshKeeper Web",
      "role": "Role:",
      "admin_role": "ADMIN",
      "user_role": "USER",
      "logout": "Log out",
      
      "login_title": "FreshKeeper System Login",
      "login_hint": "Enter 'admin' for Admin Panel or any name for Dashboard",
      "enter_nickname": "Your nickname",
      "login_btn": "Log in",
      
      "waiting_data": "⏳ Waiting for ESP32 data from Wokwi... Check if simulator is running.",
      "user_dashboard": "📊 Fridge Dashboard",
      "device": "Device:",
      "last_update": "Last update:",
      "temperature": "Temperature",
      "humidity": "Humidity",
      "daily_avg": "Daily avg:",
      
      "tvoc_title": "☣️ TVOC Gas Level (Spoilage Index):",
      "tvoc_danger": "🚨 WARNING! Food spoilage risk detected in the chamber!",
      "tvoc_safe": "✅ Air is clean. Food is fresh.",
      
      "admin_panel": "🛡️ System Administrator Panel",
      "open_swagger": "🔍 Open Swagger API",
      "export_logs": "📥 Export Fridge Logs",
      
      "current_users": "👥 Current Users (D1)",
      "no_users": "No users found",
      
      "active_alerts": "🚨 Active Threats & Incidents",
      "no_alerts": "✅ All threats resolved. No active alarms.",
      "time_occurred": "Time occurred:",
      "resolve_btn": "Resolve",
      "export_error": "Error exporting data."
    }
  },
  uk: {
    translation: {
      "app_title": "❄️ FreshKeeper Web",
      "role": "Роль:",
      "admin_role": "АДМІН",
      "user_role": "КОРИСТУВАЧ",
      "logout": "Вийти",
      
      "login_title": "Вхід у систему FreshKeeper",
      "login_hint": "Введіть 'admin' для адмінки або будь-яке ім'я для дашборду",
      "enter_nickname": "Ваш нікнейм",
      "login_btn": "Увійти",
      
      "waiting_data": "⏳ Очікування даних від ESP32 з Wokwi... Перевірте, чи запущено симулятор.",
      "user_dashboard": "📊 Панель приладів холодильника",
      "device": "Пристрій:",
      "last_update": "Останнє оновлення:",
      "temperature": "Температура",
      "humidity": "Вологість",
      "daily_avg": "Сер. за добу:",
      
      "tvoc_title": "☣️ Рівень газів TVOC (Індекс зіпсованості):",
      "tvoc_danger": "🚨 УВАГА! Виявлено ризик псування продуктів у камері!",
      "tvoc_safe": "✅ Повітря в нормі. Продукти свіжі.",
      
      "admin_panel": "🛡️ Панель адміністратора системи",
      "open_swagger": "🔍 Відкрити Swagger API",
      "export_logs": "📥 Експорт логів холодильника",
      
      "current_users": "👥 Поточні користувачі (D1)",
      "no_users": "Користувачі відсутні",
      
      "active_alerts": "🚨 Активні загрози та інциденти",
      "no_alerts": "✅ Усі загрози ліквідовано. Сигналів тривоги немає.",
      "time_occurred": "Час виникнення:",
      "resolve_btn": "Вирішити",
      "export_error": "Помилка вивантаження даних."
    }
  }
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;