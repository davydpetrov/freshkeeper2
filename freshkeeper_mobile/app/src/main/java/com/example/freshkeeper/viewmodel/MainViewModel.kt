package com.example.freshkeeper.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.freshkeeper.data.Alert
import com.example.freshkeeper.data.DeviceStats
import com.example.freshkeeper.network.NetworkModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    private val _stats = MutableStateFlow<List<DeviceStats>>(emptyList())
    val stats: StateFlow<List<DeviceStats>> = _stats.asStateFlow()

    private val _alerts = MutableStateFlow<List<Alert>>(emptyList())
    val alerts: StateFlow<List<Alert>> = _alerts.asStateFlow()

    init {
        fetchData()
    }

    fun fetchData() {
        viewModelScope.launch {
            try {
                _stats.value = NetworkModule.api.getStatistics()
                _alerts.value = NetworkModule.api.getActiveAlerts()
            } catch (e: Exception) {
                // Тут варто додати обробку помилок
                e.printStackTrace()
            }
        }
    }

    fun resolveAlert(id: Int) {
        viewModelScope.launch {
            try {
                NetworkModule.api.resolveAlert(id)
                fetchData() // Оновлюємо дані після вирішення
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}