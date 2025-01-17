import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:8000/dns");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching DNS records:", error);
    return NextResponse.json(
      { error: "Failed to fetch DNS records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch("http://localhost:8000/dns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error adding DNS record:", error);
    return NextResponse.json(
      { error: "Failed to add DNS record" },
      { status: 500 }
    );
  }
}
