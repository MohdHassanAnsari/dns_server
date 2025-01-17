"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DNSRecord = {
  id: number;
  name: string;
  type: "A" | "AAAA" | "CNAME" | "NS";
  value: string;
  ttl: number;
};

export default function DNSManagement() {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"A" | "AAAA" | "CNAME" | "NS">("A");
  const [value, setValue] = useState("");
  const [ttl, setTTL] = useState(3600);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/dns");
      if (!res.ok) {
        throw new Error("Failed to fetch DNS records");
      }
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Error fetching DNS records:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const recordData = { name, type, value, ttl };

    try {
      if (editingId) {
        const res = await fetch(`/api/dns/${name}/${type}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recordData),
        });
        if (!res.ok) {
          throw new Error("Failed to update DNS record");
        }
      } else {
        const res = await fetch("/api/dns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recordData),
        });
        if (!res.ok) {
          throw new Error("Failed to add DNS record");
        }
      }

      await fetchRecords();
      resetForm();
    } catch (err) {
      console.error("Error updating/adding record:", err);
    }
  };

  const handleEdit = (record: DNSRecord) => {
    setName(record.name);
    setType(record.type);
    setValue(record.value);
    setTTL(record.ttl);
    setEditingId(record.id);
  };

  const handleDelete = async (id: number) => {
    const recordToDelete = records.find((record) => record.id === id);
    if (recordToDelete) {
      try {
        const res = await fetch(
          `/api/dns/${recordToDelete.name}/${recordToDelete.type}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) {
          throw new Error("Failed to delete DNS record");
        }
        await fetchRecords();
      } catch (err) {
        console.error("Error deleting record:", err);
      }
    }
  };

  const resetForm = () => {
    setName("");
    setType("A");
    setValue("");
    setTTL(3600);
    setEditingId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>DNS Record Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Domain Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Record Type
                </label>
                <Select
                  value={type}
                  onValueChange={(value: "A" | "AAAA" | "CNAME" | "NS") =>
                    setType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="AAAA">AAAA</SelectItem>
                    <SelectItem value="CNAME">CNAME</SelectItem>
                    <SelectItem value="NS">NS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="value" className="text-sm font-medium">
                  Record Value
                </label>
                <Input
                  id="value"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g., 192.168.1.1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="ttl" className="text-sm font-medium">
                  TTL (seconds)
                </label>
                <Input
                  id="ttl"
                  type="number"
                  value={ttl}
                  onChange={(e) => setTTL(parseInt(e.target.value))}
                  placeholder="e.g., 3600"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit">
                {editingId ? "Update" : "Add"} Record
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DNS Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>TTL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.value}</TableCell>
                  <TableCell>{record.ttl}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(record)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(record.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
