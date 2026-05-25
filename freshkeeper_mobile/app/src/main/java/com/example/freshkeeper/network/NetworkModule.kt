package com.example.freshkeeper.network

import com.example.freshkeeper.data.Alert
import com.example.freshkeeper.data.DeviceStats
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface FreshKeeperApi {
    @GET("api/Statistics")
    suspend fun getStatistics(): List<DeviceStats>

    @GET("api/Admin/alerts")
    suspend fun getActiveAlerts(): List<Alert>

    @POST("api/Admin/alerts/{id}/resolve")
    suspend fun resolveAlert(@Path("id") alertId: Int)
}