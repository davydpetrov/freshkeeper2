package com.example.freshkeeper.data

import kotlinx.serialization.Serializable

@Serializable
data class DeviceStats(
    val deviceName: String,
    val serialNumber: String,
    val currentTemp: Double,
    val currentHumidity: Double,
    val currentTvoc: Double,
    val avgTempDay: Double
)

@Serializable
data class Alert(
    val id: Int,
    val deviceId: Int,
    val message: String,
    val severity: String,
    val time: String
)