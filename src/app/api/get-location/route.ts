import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function toJSON(obj: unknown) {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  )
}

export async function GET() {
  try {
    const result = await prisma.m_raw_history.findMany({
      where: { id_raw: "667325929160183808" },
      orderBy: { timestamp_gps: "asc" }
    })

    return NextResponse.json(toJSON(result))
  } catch (error: unknown) {
    console.error(error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    )
  }
}
