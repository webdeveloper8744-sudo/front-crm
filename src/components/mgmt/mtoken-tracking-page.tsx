"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { searchMTokenSerialNumbers, fetchMTokenSerialNumbers, type MTokenSerialNumber } from "@/store/slices/purchaseOrderSlice"
import { fetchStores, type StoreData } from "@/store/slices/storeSlice" // Import debounce from a utility file or install @types/lodash
import { debounce } from "lodash"

export function MTokenTrackingPage() {
  const dispatch = useAppDispatch()
  const { serialNumbers = [] } = useAppSelector((s) => s.purchaseOrder || {})
  const { stores = [] } = useAppSelector((s) => s.store || {})

  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedStore, setSelectedStore] = React.useState("all")
  const [filterUsed, setFilterUsed] = React.useState<"all" | "used" | "unused">("all")

  React.useEffect(() => {
    dispatch(fetchMTokenSerialNumbers())
    dispatch(fetchStores())
  }, [dispatch])

  // Centralized function to apply filters and dispatch search
  const applyFilters = React.useCallback(
    (query: string, storeId: string) => {
      const params: { query?: string; storeId?: string } = {}
      if (query) params.query = query
      if (storeId && storeId !== "all") params.storeId = storeId

      if (Object.keys(params).length > 0) {
        dispatch(searchMTokenSerialNumbers(params))
      } else {
        dispatch(fetchMTokenSerialNumbers())
      }
    },
    [dispatch],
  )

  // Debounced search handler
  const debouncedSearch = React.useCallback(debounce(applyFilters, 300), [applyFilters])

  const handleSearchChange = (value: string) => {
    const upperCaseValue = value.toUpperCase()
    setSearchTerm(upperCaseValue)
    debouncedSearch(upperCaseValue, selectedStore)
  }

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId)
    applyFilters(searchTerm, storeId)
  }

  const handleStatusChange = (status: "all" | "used" | "unused") => {
    setFilterUsed(status)
    // This is a client-side filter, so we don't need to dispatch anything here.
  }

  const filteredSerials = serialNumbers.filter((serial: MTokenSerialNumber) => {
    if (filterUsed === "used" && !serial.isUsed) return false
    if (filterUsed === "unused" && serial.isUsed) return false
    return true
  })

  const storeName = (storeId: string) => {
    return stores.find((s: StoreData) => s.id === storeId)?.name || "Unknown"
  }

  const handleExport = () => {
    const csv = [
      ["Serial Number", "Store", "Purchase Date", "Status", "Used In Lead", "Created At"],
      ...filteredSerials.map((s) => [
        s.serialNumber,
        storeName(s.storeId),
        s.purchaseDate,
        s.isUsed ? "Used" : "Available",
        s.usedInLeadId || "N/A",
        new Date(s.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mtoken-tracking.csv"
    a.click()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">MToken Tracking Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total MTokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{serialNumbers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{serialNumbers.filter((s) => !s.isUsed).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{serialNumbers.filter((s) => s.isUsed).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter MTokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Serial Number</Label>
              <Input
                placeholder="Enter serial number..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label>Filter by Store</Label>
              <Select value={selectedStore} onValueChange={handleStoreChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store: StoreData) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={filterUsed} onValueChange={(v: "all" | "used" | "unused") => handleStatusChange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unused">Available</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MToken Serial Numbers ({filteredSerials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used In Lead</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSerials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No MToken serial numbers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSerials.map((serial: MTokenSerialNumber) => (
                    <TableRow key={serial.id}>
                      <TableCell className="font-mono font-bold">{serial.serialNumber}</TableCell>
                      <TableCell>{storeName(serial.storeId)}</TableCell>
                      <TableCell>{serial.purchaseDate}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${serial.isUsed ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>
                          {serial.isUsed ? "Used" : "Available"}
                        </span>
                      </TableCell>
                      <TableCell>{serial.usedInLeadId || "-"}</TableCell>
                      <TableCell>{new Date(serial.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
