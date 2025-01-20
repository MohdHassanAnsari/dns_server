"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface DNSRecord {
  name: string;
  type: string;
  value: string;
  ttl: number;
}

const recordTypes = ["A", "AAAA", "CNAME", "NS"];

const getPlaceholder = (type: string) => {
  switch (type) {
    case "A":
      return "192.168.1.1";
    case "AAAA":
      return "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
    case "CNAME":
      return "example.com";
    case "NS":
      return "ns1.example.com";
    default:
      return "Enter value";
  }
};

export default function DNSManager() {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [newRecord, setNewRecord] = useState<DNSRecord>({
    name: "",
    type: "A",
    value: "",
    ttl: 3600,
  });
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/dns");
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast({
        title: "Error",
        description: "Failed to fetch DNS records. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addRecord = async () => {
    try {
      await fetch("http://localhost:8000/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      setIsAddDialogOpen(false);
      setNewRecord({ name: "", type: "A", value: "", ttl: 3600 });
      fetchRecords();
      toast({
        title: "Success",
        description: "DNS record added successfully.",
      });
    } catch (error) {
      console.error("Error adding record:", error);
      toast({
        title: "Error",
        description: "Failed to add DNS record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateRecord = async () => {
    if (editingRecord) {
      try {
        await fetch(
          `http://localhost:8000/dns/${editingRecord.name}/${editingRecord.type}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingRecord),
          }
        );
        setIsEditDialogOpen(false);
        setEditingRecord(null);
        fetchRecords();
        toast({
          title: "Success",
          description: "DNS record updated successfully.",
        });
      } catch (error) {
        console.error("Error updating record:", error);
        toast({
          title: "Error",
          description: "Failed to update DNS record. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const deleteRecord = async (name: string, type: string) => {
    try {
      await fetch(`http://localhost:8000/dns/${name}/${type}`, {
        method: "DELETE",
      });
      fetchRecords();
      toast({
        title: "Success",
        description: "DNS record deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error",
        description: "Failed to delete DNS record. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>DNS Records</CardTitle>
        <CardDescription>Manage your DNS records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add new record</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add new DNS record</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newRecord.name}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setNewRecord({ ...newRecord, type: value })
                    }
                    value={newRecord.type}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Value
                  </Label>
                  <Input
                    id="value"
                    value={newRecord.value}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, value: e.target.value })
                    }
                    className="col-span-3"
                    placeholder={getPlaceholder(newRecord.type)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ttl" className="text-right">
                    TTL
                  </Label>
                  <Input
                    id="ttl"
                    type="number"
                    value={newRecord.ttl}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        ttl: Number.parseInt(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={addRecord}>Add Record</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[200px]">Value</TableHead>
                <TableHead className="w-[100px]">TTL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={`${record.name}-${record.type}`}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.value}</TableCell>
                  <TableCell>{record.ttl}</TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={setIsEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => setEditingRecord(record)}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit DNS record</DialogTitle>
                        </DialogHeader>
                        {editingRecord && (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-name" className="text-right">
                                Name
                              </Label>
                              <Input
                                id="edit-name"
                                value={editingRecord.name}
                                onChange={(e) =>
                                  setEditingRecord({
                                    ...editingRecord,
                                    name: e.target.value,
                                  })
                                }
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-type" className="text-right">
                                Type
                              </Label>
                              <Select
                                onValueChange={(value) =>
                                  setEditingRecord({
                                    ...editingRecord,
                                    type: value,
                                  })
                                }
                                value={editingRecord.type}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {recordTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="edit-value"
                                className="text-right"
                              >
                                Value
                              </Label>
                              <Input
                                id="edit-value"
                                value={editingRecord.value}
                                onChange={(e) =>
                                  setEditingRecord({
                                    ...editingRecord,
                                    value: e.target.value,
                                  })
                                }
                                className="col-span-3"
                                placeholder={getPlaceholder(editingRecord.type)}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-ttl" className="text-right">
                                TTL
                              </Label>
                              <Input
                                id="edit-ttl"
                                type="number"
                                value={editingRecord.ttl}
                                onChange={(e) =>
                                  setEditingRecord({
                                    ...editingRecord,
                                    ttl: Number.parseInt(e.target.value),
                                  })
                                }
                                className="col-span-3"
                              />
                            </div>
                          </div>
                        )}
                        <Button onClick={updateRecord}>Update Record</Button>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the DNS record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteRecord(record.name, record.type)
                            }
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
