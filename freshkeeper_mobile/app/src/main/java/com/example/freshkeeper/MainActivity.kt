package com.example.freshkeeper

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.freshkeeper.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    FreshKeeperApp()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FreshKeeperApp(viewModel: MainViewModel = viewModel()) {
    val stats by viewModel.stats.collectAsState()
    val alerts by viewModel.alerts.collectAsState()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("FreshKeeper") }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            Text("Статистика", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(16.dp))

            Column {
                stats.forEach { stat ->
                    Card(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp).fillMaxWidth()) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(stat.deviceName, style = MaterialTheme.typography.titleMedium)
                            Text("Темп: ${stat.currentTemp}°C | Вол: ${stat.currentHumidity}%")
                            Text("TVOC: ${stat.currentTvoc}")
                        }
                    }
                }
            }

            Text("Активні тривоги", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(16.dp))

            LazyColumn(modifier = Modifier.weight(1f)) {
                items(alerts) { alert ->
                    Card(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp).fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                    ) {
                        Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(alert.message, color = MaterialTheme.colorScheme.onErrorContainer)
                                Text(alert.time, style = MaterialTheme.typography.bodySmall)
                            }
                            Button(onClick = { viewModel.resolveAlert(alert.id) }) {
                                Text("Вирішити")
                            }
                        }
                    }
                }
            }
        }
    }
}