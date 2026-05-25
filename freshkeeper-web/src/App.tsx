import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<string | null>(null);
  const [inputName, setInputName] = useState('');

  const handleLogin = () => {
    if (inputName.trim() !== '') {
      setUser(inputName.trim().toLowerCase());
    }
  };

  const changeLang = (lang: string) => i18n.changeLanguage(lang);

  // --- ЕКРАН АВТОРИЗАЦІЇ ---
  if (!user) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => changeLang('uk')} style={{ padding: '5px 10px', marginRight: '5px' }}>UA</button>
          <button onClick={() => changeLang('en')} style={{ padding: '5px 10px' }}>EN</button>
        </div>
        <div style={{ background: 'white', padding: '40px', maxWidth: '400px', margin: '0 auto', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2>{t('login_title')}</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>{t('login_hint')}</p>
          <input 
            type="text" 
            placeholder={t('enter_nickname')} 
            value={inputName} 
            onChange={e => setInputName(e.target.value)}
            style={{ padding: '10px', width: '80%', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <br/><br/>
          <button onClick={handleLogin} style={{ padding: '10px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
            {t('login_btn')}
          </button>
        </div>
      </div>
    );
  }

  // --- НАВІГАЦІЯ ПІСЛЯ ВХОДУ ---
  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', margin: 0, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <nav style={{ background: '#2c3e50', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{t('app_title')}</span>
        <div>
          <span style={{ marginRight: '20px', backgroundColor: '#34495e', padding: '5px 10px', borderRadius: '4px' }}>
            {t('role')} <strong>{user === 'admin' ? t('admin_role') : t('user_role')}</strong> ({user})
          </span>
          <button onClick={() => changeLang('uk')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', marginRight: '10px' }}>🇺🇦</button>
          <button onClick={() => changeLang('en')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>🇬🇧</button>
          <button onClick={() => setUser(null)} style={{ marginLeft: '20px', padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {t('logout')}
          </button>
        </div>
      </nav>

      <div style={{ padding: '30px' }}>
        {user === 'admin' ? <AdminPanel /> : <UserDashboard />}
      </div>
    </div>
  );
}

// --- ПАНЕЛЬ КОРИСТУВАЧА ---
function UserDashboard() {
  const { t, i18n } = useTranslation();
  const [fridgeData, setFridgeData] = useState<any>(null);

  useEffect(() => {
    const fetchTelemetry = () => {
      fetch('https://freshkeeper.davyd-petrov.workers.dev/api/Statistics')
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) setFridgeData(data[0]);
        })
        .catch(err => console.error(err));
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date());

  if (!fridgeData) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>{t('waiting_data')}</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>{t('user_dashboard')}</h2>
      <p style={{ color: '#7f8c8d' }}>{t('device')} <strong>{fridgeData.deviceName}</strong> ({fridgeData.serialNumber})</p>
      <p style={{ fontSize: '12px', color: '#95a5a6' }}>{t('last_update')} {formattedDate}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', color: '#555' }}>🌡️ {t('temperature')}</span>
          <h1 style={{ margin: '10px 0 0 0', color: '#1565c0' }}>{fridgeData.currentTemp.toFixed(1)}°C</h1>
          <small style={{ color: '#555' }}>{t('daily_avg')} {fridgeData.avgTempDay.toFixed(1)}°C</small>
        </div>

        <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', color: '#555' }}>💧 {t('humidity')}</span>
          <h1 style={{ margin: '10px 0 0 0', color: '#2e7d32' }}>{fridgeData.currentHumidity.toFixed(0)}%</h1>
          <small style={{ color: '#555' }}>{t('daily_avg')} {fridgeData.avgHumidityDay.toFixed(0)}%</small>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', borderRadius: '6px', backgroundColor: fridgeData.currentTvoc > 150 ? '#ffebee' : '#f1f2f6', borderLeft: fridgeData.currentTvoc > 150 ? '5px solid #c62828' : '5px solid #bdc3c7' }}>
        <strong>{t('tvoc_title')}</strong>
        <h3 style={{ margin: '5px 0 0 0', color: fridgeData.currentTvoc > 150 ? '#c62828' : '#2c3e50' }}>{fridgeData.currentTvoc} ppm</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
          {fridgeData.currentTvoc > 150 ? t('tvoc_danger') : t('tvoc_safe')}
        </p>
      </div>
    </div>
  );
}

// --- ПАНЕЛЬ АДМІНІСТРАТОРА ---
function AdminPanel() {
  const { t } = useTranslation();
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  const loadAdminData = () => {
    fetch('https://freshkeeper.davyd-petrov.workers.dev/api/Admin/users')
      .then(res => res.json())
      .then(data => setRealUsers(data))
      .catch(err => console.error(err));

    fetch('https://freshkeeper.davyd-petrov.workers.dev/api/Admin/alerts')
      .then(res => res.json())
      .then(data => setActiveAlerts(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDataExport = async () => {
    try {
      const response = await fetch('https://freshkeeper.davyd-petrov.workers.dev/api/Admin/measurements');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Fridge_Telemetry_Export_${new Date().toISOString().slice(0,10)}.json`;
      link.click();
    } catch (error) {
      alert(t('export_error'));
    }
  };

  const resolveAlert = async (id: number) => {
    await fetch(`https://freshkeeper.davyd-petrov.workers.dev/api/Admin/alerts/${id}/resolve`, { method: 'POST' });
    loadAdminData();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>{t('admin_panel')}</h2>
        <div>
          <a href="https://freshkeeper.davyd-petrov.workers.dev/swagger" target="_blank" rel="noreferrer" style={{ padding: '8px 15px', backgroundColor: '#8e44ad', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
            {t('open_swagger')}
          </a>
          <button onClick={handleDataExport} style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            {t('export_logs')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>{t('current_users')}</h3>
          {realUsers.length === 0 ? <p style={{ color: '#999' }}>{t('no_users')}</p> : (
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {realUsers.map((u: any) => (
                <li key={u.id} style={{ marginBottom: '8px' }}>
                  <strong>ID:</strong> {u.id} <br />
                  <small style={{ color: '#555' }}>{u.email}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>{t('active_alerts')}</h3>
          {activeAlerts.length === 0 ? <p style={{ color: '#27ae60', fontWeight: 'bold' }}>{t('no_alerts')}</p> : (
            <div>
              {activeAlerts.map((alert: any) => (
                <div key={alert.id} style={{ padding: '12px', marginBottom: '10px', borderRadius: '4px', backgroundColor: alert.severity === 'Critical' ? '#fdecea' : '#fff9db', borderLeft: alert.severity === 'Critical' ? '5px solid #e74c3c' : '5px solid #f1c40f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: alert.severity === 'Critical' ? '#c62828' : '#b78103', fontSize: '12px' }}>[{alert.severity.toUpperCase()}]</span>
                    <p style={{ margin: '3px 0', fontSize: '14px' }}>{alert.message}</p>
                    <small style={{ color: '#777', fontSize: '11px' }}>{t('time_occurred')} {alert.time}</small>
                  </div>
                  <button onClick={() => resolveAlert(alert.id)} style={{ padding: '6px 12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {t('resolve_btn')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}