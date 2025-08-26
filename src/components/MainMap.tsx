"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import { LatLngExpression, LatLngBoundsExpression } from "leaflet"
import { createEntityIcon } from "@/components/icons/EntityIcon"

import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"

interface Entity {
  latitude: number
  longitude: number
  angle: number
  label: string
  ignition: string
}

interface RawEntity {
  latitude?: string | number | null
  longitude?: string | number | null
  angle?: number
  label?: string
  id_history?: number
  ignition?: string
}

function isRawEntity(obj: unknown): obj is RawEntity {
  return (
    typeof obj === "object" &&
    obj !== null &&
    ("latitude" in obj || "longitude" in obj)
  )
}

export default function MainMap() {
  const [data, setData] = useState<Entity[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/get-location", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

        const result = await res.json()
        const rawArray: RawEntity[] = Array.isArray(result) ? result : [result]

        const mapped: Entity[] = rawArray
          .filter(isRawEntity)
          .map((item, idx) => ({
            latitude: Number(item.latitude) || 0,
            longitude: Number(item.longitude) || 0,
            angle: item.angle ?? 0,
            label: item.label ?? `Entity ${item.id_history ?? idx}`,
            ignition: item.ignition ?? "false",
          }))

        setData(mapped)
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const defaultCenter: LatLngExpression = [-2.5489, 118.0149]
  const bounds: LatLngBoundsExpression = [
    [-90, -180],
    [90, 180],
  ]

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        minZoom={3}
        maxZoom={18}
        maxBounds={bounds}
        maxBoundsViscosity={0.5}
        style={{ height: "100vh", width: "100%" }}
        attributionControl={false}
        zoomControl={false}
        worldCopyJump
      >
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />
        {data.map((pos, idx) => (
          <Marker
            key={pos.label ?? idx}
            position={[pos.latitude, pos.longitude]}
            icon={createEntityIcon(pos.angle, pos.label, pos.ignition)}
          />
        ))}
      </MapContainer>
    </div>
  )
}
