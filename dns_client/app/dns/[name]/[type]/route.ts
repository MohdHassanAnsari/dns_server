import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { name: string; type: string } }
) {
  try {
    const { name, type } = params;
    const body = await request.json();
    const res = await fetch(`http://localhost:8000/dns/${name}/${type}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating DNS record:", error);
    return NextResponse.json(
      { error: "Failed to update DNS record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { name: string; type: string } }
) {
  try {
    const { name, type } = params;
    const res = await fetch(`http://localhost:8000/dns/${name}/${type}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting DNS record:", error);
    return NextResponse.json(
      { error: "Failed to delete DNS record" },
      { status: 500 }
    );
  }
}
