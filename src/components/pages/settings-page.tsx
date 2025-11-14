"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Configure your CRM preferences here. (Placeholder)</p>
        </CardContent>
      </Card>
    </div>
  )
}
