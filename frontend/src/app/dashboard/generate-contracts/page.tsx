"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useRef, useState } from "react";
import { Download, FileText, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import markdown from "remark-parse";
import docx from "remark-docx";
import { unified } from "unified";
import { saveAs } from "file-saver";

const processor = unified().use(markdown).use(docx);

const contractTypeLabels = [
  { label: "Employment Contract", value: "Employment Contract" },
  { label: "Non-Disclosure Agreement", value: "Non-Disclosure Agreement" },
  { label: "Offer Letter", value: "Offer Letter" },
  { label: "Option Grant Letter", value: "Option Grant Letter" },
  { label: "Vesting Schedule", value: "Vesting Schedule" },
];

const supportedLocations = [
  { label: "Malaysia", value: "malaysia" },
  { label: "Singapore", value: "singapore" },
  { label: "Hong Kong", value: "hong-kong" },
];

export default function ContractsPage() {
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "Employment Contract",
    employee_name: "",
    role: "",
    department: "",
    salary: "",
    start_date: "",
    location: "malaysia",
    address: "",
    additional_clauses: "",
  });

  // For Testing
  const [output, setOutput] = useState<string>("");

  const handleExportDOCX = async (text: string) => {
    try {
      const doc = await processor.process(text);
      const arrayBuffer = await doc.result;
      const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      saveAs(blob, "generated_document.docx");
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setOutput("");

      const formDataPayload = { ...formData, salary: "RM " + formData.salary };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataPayload),
      });

      const data = await response.json();
      console.log("API response data:", data);
      setOutput(data.document);
      setGenerating(false);
    } catch (error) {
      console.error("Error generating document:", error);
      setGenerating(false);
    }
  };

  const pdfRef = useRef(null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Generate Contracts
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate employment documents with AI tailored to your needs.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border bg-card lg:col-span-2 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Document Type
              </Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) => {
                  setFormData({ ...formData, document_type: value });
                }}
              >
                <SelectTrigger className="w-full border-border bg-secondary text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {contractTypeLabels.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Employee Name
              </Label>
              <Input
                placeholder="e.g., John Doe"
                value={formData.employee_name}
                onChange={(e) => {
                  setFormData({ ...formData, employee_name: e.target.value });
                }}
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Role
              </Label>
              <Input
                placeholder="e.g., Senior Software Engineer"
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value });
                }}
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Department
              </Label>
              <Input
                placeholder="e.g., Engineering"
                value={formData.department}
                onChange={(e) => {
                  setFormData({ ...formData, department: e.target.value });
                }}
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Salary (RM)
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 8000"
                  value={formData.salary}
                  onChange={(e) => {
                    setFormData({ ...formData, salary: e.target.value });
                  }}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      start_date: e.target.value,
                    });
                  }}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => {
                  setFormData({ ...formData, location: value });
                }}
              >
                <SelectTrigger className="w-full border-border bg-secondary text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {supportedLocations.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Address
              </Label>
              <Textarea
                placeholder="e.g., Jalan Tunku Abdul Rahman"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                }}
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Additional Clauses
              </Label>
              <Textarea
                placeholder="e.g., remote work policy, probation period, stipulations, etc."
                value={formData.additional_clauses}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    additional_clauses: e.target.value,
                  });
                }}
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex">
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="border-border bg-card lg:col-span-3 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Document Preview
            </CardTitle>
            {output && (
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={() => handleExportDOCX(output)}
                className="border-red-500 text-foreground hover:bg-secondary bg-transparent cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </CardHeader>

          <CardContent>
            <div className="flex items-center rounded-lg border-border bg-secondary px-3 py-3">
              {output ? (
                <article className="markdown-body" ref={pdfRef}>
                  <Markdown>{output || "No document generated yet."}</Markdown>
                </article>
              ) : (
                <p className="text-muted-foreground">
                  Generate a document to see the preview here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
