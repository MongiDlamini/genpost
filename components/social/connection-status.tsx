"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle, AlertCircle, Clock, RefreshCw, Wifi } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("connected")
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    // Simulate connection checking
    const interval = setInterval(() => {
      setLastCheck(new Date())
      // In a real app, this would check actual API connectivity
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setStatus("checking")
    // Simulate API check
    setTimeout(() => {
      setStatus("connected")
      setLastCheck(new Date())
    }, 1000)
  }

  const getStatusInfo = () => {
    switch (status) {
      case "connected":
        return {
          icon: CheckCircle,
          color: "bg-green-100 text-green-800",
          text: "All Systems Operational",
        }
      case "disconnected":
        return {
          icon: AlertCircle,
          color: "bg-red-100 text-red-800",
          text: "Connection Issues",
        }
      case "checking":
        return {
          icon: Clock,
          color: "bg-yellow-100 text-yellow-800",
          text: "Checking Status...",
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="space-x-2 bg-transparent">
          <statusInfo.icon className="h-4 w-4" />
          <Badge variant="secondary" className={statusInfo.color}>
            {statusInfo.text}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Status</span>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${status === "checking" ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm">API Connectivity</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Token Status</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Valid
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Rate Limits</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Normal
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">Last checked: {lastCheck.toLocaleTimeString()}</p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
