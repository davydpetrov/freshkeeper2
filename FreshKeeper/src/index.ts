import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  freshkeeper_db: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Увімкнення CORS, щоб наш React-сайт міг вільно спілкуватися з API
app.use('/api/*', cors());

// Привітання на головній
app.get('/', (c) => c.text('FreshKeeper API працює успішно! 🚀'));

// 1. ПРИЙОМ ТЕЛЕМЕТРІЇ ВІД ESP32 (Wokwi)
app.post('/api/Telemetry', async (c) => {
  const body = await c.req.json<{ serialNumber: string; temperature: number; humidity: number; tvocLevel: number }>();
  
  const device = await c.env.freshkeeper_db.prepare('SELECT id FROM Devices WHERE serialNumber = ?')
    .bind(body.serialNumber).first<{ id: number }>();

  if (!device) return c.json({ error: "Device not registered" }, 404);

  await c.env.freshkeeper_db.prepare(
    'INSERT INTO Measurements (deviceId, temperature, humidity, tvocLevel) VALUES (?, ?, ?, ?)'
  ).bind(device.id, body.temperature, body.humidity, body.tvocLevel).run();

  // Бізнес-логіка аналізу ризиків
  let riskScore = body.tvocLevel;
  if (body.temperature > 8.0) riskScore *= 1.5;
  if (body.humidity > 90.0) riskScore += 20;

  if (riskScore > 150) {
    const recent = await c.env.freshkeeper_db.prepare(`SELECT id FROM Alerts WHERE deviceId = ? AND severity = 'Critical' AND createdAt > datetime('now', '-10 minutes')`).bind(device.id).first();
    if (!recent) {
      await c.env.freshkeeper_db.prepare(`INSERT INTO Alerts (deviceId, message, severity, isResolved) VALUES (?, ?, 'Critical', 0)`).bind(device.id, `Detected spoilage risk! Score: ${riskScore.toFixed(1)}`).run();
    }
  } else if (body.temperature > 12.0) {
    const recent = await c.env.freshkeeper_db.prepare(`SELECT id FROM Alerts WHERE deviceId = ? AND severity = 'Warning' AND createdAt > datetime('now', '-10 minutes')`).bind(device.id).first();
    if (!recent) {
      // ОСЬ ТУТ БУЛА ПОМИЛКА. Додано ', 0' в кінці VALUES
      await c.env.freshkeeper_db.prepare(`INSERT INTO Alerts (deviceId, message, severity, isResolved) VALUES (?, 'Fridge temperature is too high!', 'Warning', 0)`).bind(device.id).run();
    }
  }
  return c.json({ status: "Data processed successfully" }, 200);
});

// 2. СТАТИСТИКА ДЛЯ ДАШБОРДУ КОРИСТУВАЧА
app.get('/api/Statistics', async (c) => {
  const { results: devices } = await c.env.freshkeeper_db.prepare('SELECT id, name as deviceName, serialNumber FROM Devices').all<{ id: number, deviceName: string, serialNumber: string }>();
  const stats = [];

  for (const device of devices) {
    const current = await c.env.freshkeeper_db.prepare('SELECT temperature, humidity, tvocLevel FROM Measurements WHERE deviceId = ? ORDER BY timestamp DESC LIMIT 1').bind(device.id).first<{ temperature: number, humidity: number, tvocLevel: number }>();
    if (!current) continue;

    const avgDay = await c.env.freshkeeper_db.prepare(`SELECT AVG(temperature) as avgTemp, AVG(humidity) as avgHum FROM Measurements WHERE deviceId = ? AND timestamp > datetime('now', '-1 day')`).bind(device.id).first<{ avgTemp: number, avgHum: number }>();

    stats.push({
      deviceName: device.deviceName,
      serialNumber: device.serialNumber,
      currentTemp: current.temperature,
      currentHumidity: current.humidity,
      currentTvoc: current.tvocLevel,
      avgTempDay: avgDay?.avgTemp || current.temperature,
      avgHumidityDay: avgDay?.avgHum || current.humidity
    });
  }
  return c.json(stats);
});

// 3. АДМІН: ОТРИМАТИ РЕАЛЬНИХ КОРИСТУВАЧІВ З БАЗИ D1
app.get('/api/Admin/users', async (c) => {
  const { results } = await c.env.freshkeeper_db.prepare('SELECT id, email FROM Users').all();
  return c.json(results);
});

// 4. АДМІН: ЕКСПОРТ ВСІХ ДАНИХ ТЕЛЕМЕТРІЇ ХОЛОДИЛЬНИКА
app.get('/api/Admin/measurements', async (c) => {
  const { results } = await c.env.freshkeeper_db.prepare('SELECT m.id, d.name as deviceName, m.temperature, m.humidity, m.tvocLevel, m.timestamp FROM Measurements m JOIN Devices d ON m.deviceId = d.id ORDER BY m.timestamp DESC').all();
  return c.json(results);
});

// 5. АДМІН: ОТРИМАТИ АКТИВНІ АЛЕРТИ
app.get('/api/Admin/alerts', async (c) => {
  const { results } = await c.env.freshkeeper_db.prepare(`SELECT id, deviceId, message, severity, createdAt as time FROM Alerts WHERE isResolved = 0 ORDER BY createdAt DESC`).all();
  return c.json(results);
});

// 6. АДМІН: ВИРІШИТИ АЛЕРТ
app.post('/api/Admin/alerts/:id/resolve', async (c) => {
  const id = c.req.param('id');
  await c.env.freshkeeper_db.prepare('UPDATE Alerts SET isResolved = 1 WHERE id = ?').bind(id).run();
  return c.json({ message: "Alert marked as resolved" });
});

// 7. ПОВНА ДОКУМЕНТАЦІЯ SWAGGER
app.get('/api/openapi.json', (c) => {
  return c.json({
    openapi: "3.0.0",
    info: { title: "FreshKeeper API", version: "1.0.0", description: "Повний API для системи моніторингу" },
    paths: {
      "/api/Telemetry": {
        post: {
          summary: "Відправка телеметрії від ESP32",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    serialNumber: { type: "string", example: "ESP32_KITCHEN_01" },
                    temperature: { type: "number", example: 14.5 },
                    humidity: { type: "number", example: 65.0 },
                    tvocLevel: { type: "number", example: 120 }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Дані успішно збережено" },
            "404": { description: "Пристрій не знайдено" }
          }
        }
      },
      "/api/Statistics": {
        get: {
          summary: "Отримання поточної статистики для дашборду",
          responses: { "200": { description: "Масив даних холодильника" } }
        }
      },
      "/api/Admin/users": {
        get: {
          summary: "Отримання списку користувачів",
          responses: { "200": { description: "Масив користувачів" } }
        }
      },
      "/api/Admin/measurements": {
        get: {
          summary: "Експорт всіх логів холодильника",
          responses: { "200": { description: "Масив історичних даних" } }
        }
      },
      "/api/Admin/alerts": {
        get: {
          summary: "Отримання активних тривог",
          responses: { "200": { description: "Масив тривог" } }
        }
      },
      "/api/Admin/alerts/{id}/resolve": {
        post: {
          summary: "Вирішення тривоги",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "Тривогу закрито" } }
        }
      }
    }
  });
});

app.get('/swagger', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FreshKeeper Swagger UI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => { window.ui = SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' }); };
      </script>
    </body>
    </html>
  `);
});

export default app;