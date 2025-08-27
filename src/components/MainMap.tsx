"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import { LatLngExpression, LatLngBoundsExpression, LatLngTuple } from "leaflet"
import { createEntityIcon } from "@/components/icons/EntityIcon"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"

interface Entity {
  latitude: number
  longitude: number
  angle: number
  label: string
  timestamp: string
}

interface RawEntity {
  latitude?: string | number | null
  longitude?: string | number | null
  angle?: number
  label?: string
  id_history?: number
  timestamp_gps?: string
}

function isRawEntity(obj: unknown): obj is RawEntity {
  return typeof obj === "object" && obj !== null && ("latitude" in obj || "longitude" in obj)
}

const AnimatedMarker = ({ positions }: { positions: Entity[] }) => {
  const markerRef = useRef<L.Marker | null>(null)
  const map = useMap()

  const interpolateAngle = (a1: number, a2: number, t: number) => {
    const diff = ((a2 - a1 + 540) % 360) - 180
    return a1 + diff * t
  }

  useEffect(() => {
    if (!positions.length) return

    let i = 0

    const move = () => {
      const current = positions[i]
      const next = positions[i + 1]
      if (!next) return

      const from: LatLngTuple = [current.latitude, current.longitude]
      const to: LatLngTuple = [next.latitude, next.longitude]

      const duration = Math.max(new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime(), 100)
      const start = performance.now()

      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const lat = from[0] + (to[0] - from[0]) * progress
        const lng = from[1] + (to[1] - from[1]) * progress
        const angle = interpolateAngle(current.angle, next.angle, progress)

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
          markerRef.current.setIcon(createEntityIcon(angle, current.label))
        }

        if (progress < 1) requestAnimationFrame(step)
        else {
          i++
          move()
        }
      }

      requestAnimationFrame(step)
    }

    move()
  }, [positions, map])

  return (
    <Marker
      ref={markerRef}
      position={[positions[0].latitude, positions[0].longitude]}
      icon={createEntityIcon(positions[0].angle, positions[0].label)}
    />
  )
}

export default function MainMap() {
  const [data, setData] = useState<Entity[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/get-location")
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
            timestamp: item.timestamp_gps ?? new Date().toISOString(),
          }))

        setData(mapped)
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const defaultCenter: LatLngExpression = [-2.5489, 118.0149]
  const bounds: LatLngBoundsExpression = [
    [-90, -Infinity],
    [90, Infinity],
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
        {data.length > 0 && <AnimatedMarker positions={data} />}
      </MapContainer>
    </div>
  )
}
