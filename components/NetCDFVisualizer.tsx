"use client"

import type React from "react";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Activity,
  LineChart,
  ScatterChart,
  Gauge,
  Map,
  BoxSelect,
  Box,
} from "lucide-react";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import type { Data, Layout, PlotData } from "plotly.js";
import { NetCDFReader } from "netcdfjs";

// Dynamic imports for heavy visualization libraries
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      Loading visualization...
    </div>
  ),
});

interface NCVariable {
  dimensions: string[];
  attributes: Array<{ name: string; value: any }>;
  data: number[];
  shape?: number[];
}

interface NCData {
  metadata: {
    dimensions: Record<string, number>;
    globalAttributes: Array<{ name: string; value: any }>;
  };
  variables: Record<string, NCVariable>;
}

export default function NetCDFVisualizer() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ncData, setNcData] = useState<NCData | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string>("");
  const [plotType, setPlotType] = useState<string>("line");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>("plot");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const reader = new NetCDFReader(buffer);

      const dimensions = Object.fromEntries(
        Object.entries(reader.dimensions).map(([name, { size }]) => [
          name,
          size,
        ])
      );

      const globalAttributes = reader.globalAttributes.map((attr) => ({
        name: attr.name,
        value: attr.value,
      }));

      const variables: Record<string, NCVariable> = {};

      for (const variable of reader.variables) {
        variables[variable.name] = {
          dimensions: variable.dimensions,
          attributes: variable.attributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
          data: downsampleData(reader.getDataVariable(variable.name)),
        };
      }

      const processedData = {
        metadata: {
          dimensions,
          globalAttributes,
        },
        variables,
      };

      setNcData(processedData);

      // Auto-select first variable
      if (Object.keys(variables).length > 0) {
        setSelectedVariable(Object.keys(variables)[0]);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Failed to process NetCDF file. Please check the file format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downsampleData = (data: any[], maxPoints = 10000) => {
    if (data.length <= maxPoints) return data;

    const step = Math.ceil(data.length / maxPoints);
    const downsampled = [];
    for (let i = 0; i < data.length; i += step) {
      downsampled.push(data[i]);
    }
    return downsampled;
  };

  const preparePlotData = (): Data[] | null => {
    if (!selectedVariable || !ncData) return null;

    const variable = ncData.variables[selectedVariable];
    const data = variable.data;

    switch (plotType) {
      case "line":
        return [
          {
            type: "scatter",
            mode: "lines+markers",
            x: Array.from({ length: data.length }, (_, i) => i),
            y: data,
            name: selectedVariable,
            line: { color: "#3b82f6" },
          } as PlotData,
        ];

      case "scatter":
        return [
          {
            type: "scatter",
            mode: "markers",
            x: Array.from({ length: data.length }, (_, i) => i),
            y: data,
            name: selectedVariable,
            marker: { color: "#3b82f6", size: 4 },
          } as PlotData,
        ];

      case "histogram":
        return [
          {
            type: "histogram",
            x: data,
            name: selectedVariable,
            marker: { color: "#3b82f6" },
          } as PlotData,
        ];

      case "heatmap":
        const reshaped = reshapeTo2D(data, variable.dimensions);
        return [
          {
            type: "heatmap",
            z: reshaped,
            name: selectedVariable,
            colorscale: "Viridis",
          } as PlotData,
        ];

      case "contour":
        const contourData = reshapeTo2D(data, variable.dimensions);
        return [
          {
            type: "contour",
            z: contourData,
            name: selectedVariable,
            colorscale: "Viridis",
          } as PlotData,
        ];

      case "surface":
        const surfaceData = reshapeTo2D(data, variable.dimensions);
        return [
          {
            type: "surface",
            z: surfaceData,
            name: selectedVariable,
            colorscale: "Viridis",
          } as PlotData,
        ];

      default:
        return null;
    }
  };

  const reshapeTo2D = (data: number[], dims: string[]) => {
    if (!ncData?.metadata.dimensions) return [data];

    // Get actual dimension sizes
    const dimSizes = dims.map(
      (dim) => ncData.metadata.dimensions[dim] || Math.sqrt(data.length)
    );

    if (dimSizes.length === 1) {
      return [data];
    }

    if (dimSizes.length >= 2) {
      const rows = dimSizes[0];
      const cols = dimSizes[1];
      const result = [];

      for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
          const index = i * cols + j;
          row.push(data[index] || 0);
        }
        result.push(row);
      }
      return result;
    }

    return [data];
  };

  const getPlotLayout = (): Partial<Layout> => {
    const baseLayout: Partial<Layout> = {
      title: {
        text: selectedVariable,
        font: { size: 16 },
      },
      autosize: true,
      margin: { l: 60, r: 40, b: 60, t: 80, pad: 4 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
    };

    switch (plotType) {
      case "surface":
        return {
          ...baseLayout,
          scene: {
            xaxis: { title: { text: "X" } },
            yaxis: { title: { text: "Y" } },
            zaxis: { title: { text: selectedVariable } },
          },
        };
      case "heatmap":
      case "contour":
        return {
          ...baseLayout,
          xaxis: { title: { text: "X Index" } },
          yaxis: { title: { text: "Y Index" } },
        };
      case "histogram":
        return {
          ...baseLayout,
          xaxis: { title: { text: selectedVariable } },
          yaxis: { title: { text: "Frequency" } },
        };
      default:
        return {
          ...baseLayout,
          xaxis: { title: { text: "Index" } },
          yaxis: { title: { text: selectedVariable } },
        };
    }
  };

  const renderVisualization = () => {
    if (!selectedVariable || !ncData) return null;

    const plotData = preparePlotData();
    if (!plotData) return null;

    return (
      <div className="w-full h-96">
        <Plot
          data={plotData}
          layout={getPlotLayout()}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
          config={{
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ["pan2d", "lasso2d"],
          }}
        />
      </div>
    );
  };

  const getVariableInfo = (varName: string) => {
    if (!ncData) return null;
    const variable = ncData.variables[varName];
    const dataLength = variable.data.length;
    const dimensions = variable.dimensions.join(" × ");
    return `${dimensions} (${dataLength} points)`;
  };

  const exportToCSV = () => {
    if (!selectedVariable || !ncData) return;

    const variable = ncData.variables[selectedVariable];
    const dimensions = variable.dimensions;

    // For 1D data
    if (dimensions.length === 1) {
      const headers = `${dimensions[0]},value`;
      const rows = variable.data.map((value, index) => `${index},${value}`);
      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${selectedVariable}.csv`);
      return;
    }

    // For 2D data
    if (dimensions.length === 2) {
      const dim1Size =
        ncData.metadata.dimensions[dimensions[0]] ||
        Math.sqrt(variable.data.length);
      const dim2Size =
        ncData.metadata.dimensions[dimensions[1]] ||
        Math.sqrt(variable.data.length);

      const headers = `${dimensions[0]},${dimensions[1]},value`;
      const rows = [];

      for (let i = 0; i < dim1Size; i++) {
        for (let j = 0; j < dim2Size; j++) {
          const index = i * dim2Size + j;
          if (index < variable.data.length) {
            rows.push(`${i},${j},${variable.data[index]}`);
          }
        }
      }
      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${selectedVariable}.csv`);
      return;
    }

    // For higher dimensions, fall back to simple index
    const headers = "index,value";
    const rows = variable.data.map((value, index) => `${index},${value}`);
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${selectedVariable}.csv`);
  };

  const exportToTXT = () => {
    if (!selectedVariable || !ncData) return;

    const variable = ncData.variables[selectedVariable];
    const dimensions = variable.dimensions;

    // For 1D data
    if (dimensions.length === 1) {
      const headers = `${dimensions[0]},value`;
      const rows = variable.data.map((value, index) => `${index},${value}`);
      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${selectedVariable}.txt`);
      return;
    }

    // For 2D data
    if (dimensions.length === 2) {
      const dim1Size =
        ncData.metadata.dimensions[dimensions[0]] ||
        Math.sqrt(variable.data.length);
      const dim2Size =
        ncData.metadata.dimensions[dimensions[1]] ||
        Math.sqrt(variable.data.length);

      const headers = `${dimensions[0]},${dimensions[1]},value`;
      const rows = [];

      for (let i = 0; i < dim1Size; i++) {
        for (let j = 0; j < dim2Size; j++) {
          const index = i * dim2Size + j;
          if (index < variable.data.length) {
            rows.push(`${i},${j},${variable.data[index]}`);
          }
        }
      }

      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${selectedVariable}.txt`);
      return;
    }
    const headers = "index,value";
    const rows = variable.data.map((value, index) => `${index},${value}`);
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${selectedVariable}.txt`);
  };

  const exportToJSON = () => {
    if (!selectedVariable || !ncData) return;

    const variable = ncData.variables[selectedVariable];
    const txtContent = JSON.stringify(
      {
        variable: selectedVariable,
        dimensions: variable.dimensions,
        attributes: variable.attributes,
        data: variable.data,
      },
      null,
      2
    );

    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
    saveAs(blob, `${selectedVariable}.json`);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-20">
        <h1 className="text-3xl font-bold mb-2 text-white">
          NetCDF Visualizer
        </h1>
        <p className="text-white/90">
          Upload and visualize NetCDF files with interactive charts and plots
        </p>
      </div>

      {/* File Upload Card */}
      <Card className="mb-6 backdrop-blur-sm bg-white/10 border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="text-gray-800/80">
                Select NetCDF File (.nc)
              </Label>
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept=".nc"
                onChange={handleFileChange}
                className="mt-1 bg-white/5 border-gradient-to-r from-indigo-500 to-purple-500 text-gray-800 hover:bg-white/10 focus-visible:ring-white/50"
              />
            </div>

            {error && <div className="text-red-300 text-sm">{error}</div>}

            <Button
              type="submit"
              disabled={!file || isProcessing}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20"
            >
              {isProcessing ? "Processing..." : "Load and Visualize"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {ncData && (
        <div>
          {/* Add this after the plot type selector card */}
          <div>
            <Card className="backdrop-blur-sm bg-white/10 border border-white/20 mt-4 mb-4">
              <CardHeader>
                <CardTitle className="text-black">Export Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={exportToCSV}
                    disabled={!selectedVariable}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                  >
                    <FileText className="h-4 w-4" />
                    Export to CSV
                  </Button>
                  <Button
                    onClick={exportToTXT}
                    disabled={!selectedVariable}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  >
                    <FileText className="h-4 w-4" />
                    Export to TXT
                  </Button>
                  <Button
                    onClick={exportToJSON}
                    disabled={!selectedVariable}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  >
                    <FileText className="h-4 w-4" />
                    Export to JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Controls Panel - Redesigned */}
            <div className="lg:col-span-1 space-y-6">
              {/* Variables Tab List */}
              <Card className="backdrop-blur-sm bg-white/10 border border-white/20 h-full overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-white bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                    Variables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={selectedVariable}
                    onValueChange={setSelectedVariable}
                    className="w-full"
                    orientation="vertical"
                  >
                    <TabsList className="grid gap-2 w-full bg-transparent justify-start">
                      {Object.keys(ncData.variables).map((varName) => (
                        <TabsTrigger
                          key={varName}
                          value={varName}
                          className="justify-start px-4 py-2 text-left backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/10 data-[state=active]:bg-indigo-500 data-[state=active]:border-indigo-400 data-[state=active]:text-white transition-all hover:bg-indigo-500 hover:text-white hover:border-indigo-400"
                        >
                          <div className="font-medium">
                            {varName.charAt(0).toUpperCase() + varName.slice(1)}
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Visualization Panel */}
            <div className="lg:col-span-3">
              <Tabs
                defaultValue="plot"
                className="w-full"
                onValueChange={(value) => setActiveTab(value)}
              >
                <TabsList className="grid w-full grid-cols-2 backdrop-blur-sm bg-white/10 border border-white/20">
                  <TabsTrigger
                    value="plot"
                    className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:border-indigo-400"
                  >
                    <Activity className="h-4 w-4" />
                    Visualization
                  </TabsTrigger>
                  <TabsTrigger
                    value="metadata"
                    className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:border-indigo-400"
                  >
                    <FileText className="h-4 w-4" />
                    Metadata
                  </TabsTrigger>
                </TabsList>

                {/* Plot Type Selector */}
                {activeTab === "plot" && (
                  <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
                    <CardContent>
                      <div className="space-y-4">
                        <Label className="text-black/80">Plot Type</Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          <Button
                            variant={
                              plotType === "line" ? "default" : "outline"
                            }
                            onClick={() => setPlotType("line")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:text-white hover:border-indigo-400 justify-center h-20 gap-1 ${plotType === "line" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"}`}
                          >
                            <LineChart className="h-5 w-5" />
                            <span className="text-sm">Line</span>
                          </Button>
                          <Button
                            variant={
                              plotType === "scatter" ? "default" : "outline"
                            }
                            onClick={() => setPlotType("scatter")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:text-white hover:border-indigo-400 justify-center h-20 gap-1 ${plotType === "scatter" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"}`}
                          >
                            <ScatterChart className="h-5 w-5" />
                            <span className="text-sm">Scatter</span>
                          </Button>
                          <Button
                            variant={
                              plotType === "histogram" ? "default" : "outline"
                            }
                            onClick={() => setPlotType("histogram")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:text-white hover:border-indigo-400 justify-center h-20 gap-1 ${plotType === "histogram" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"}`}
                          >
                            <Gauge className="h-5 w-5" />
                            <span className="text-sm">Histogram</span>
                          </Button>
                          <Button
                            variant={
                              plotType === "heatmap" ? "default" : "outline"
                            }
                            onClick={() => setPlotType("heatmap")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:border-indigo-400 hover:text-white justify-center h-20 gap-1 ${plotType === "heatmap" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"}`}
                          >
                            <Map className="h-5 w-5" />
                            <span className="text-sm">Heatmap</span>
                          </Button>
                          <Button
                            variant={
                              plotType === "contour" ? "default" : "outline"
                            }
                            onClick={() => setPlotType("contour")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:border-indigo-400 hover:text-white justify-center h-20 gap-1 ${plotType === "contour" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"}`}
                          >
                            <BoxSelect className="h-5 w-5" />
                            <span className="text-sm">Contour</span>
                          </Button>
                          <Button
                            variant={
                              plotType === "surface" ? "default" : "outline"
                            }
                            onClick={() => setPlotType("surface")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:border-indigo-400 hover:text-white justify-center h-20 gap-1 ${plotType === "surface" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"}`}
                          >
                            <Box className="h-5 w-5" />
                            <span className="text-sm">3D Surface</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "plot" && (
                  <TabsContent value="plot">
                    <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
                      <CardHeader>
                        <CardTitle className="text-black">
                          {selectedVariable
                            ? `${selectedVariable} - ${plotType}`
                            : "Select a variable to visualize"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedVariable ? (
                          renderVisualization()
                        ) : (
                          <div className="flex items-center justify-center h-96 text-black/70">
                            Select a variable and plot type to begin
                            visualization
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
                <TabsContent value="metadata">
                  <Card className="backdrop-blur-sm bg-white/10 border-2 border-gradient-to-r from-indigo-500 to-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-black">
                        File Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-black/80">
                          Dimensions
                        </h4>
                        <div className="bg-white/5 p-3 rounded-md border border-white/10">
                          <pre className="text-sm text-black/90">
                            {JSON.stringify(
                              ncData.metadata.dimensions,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-black/80">
                          Global Attributes
                        </h4>
                        <div className="bg-white/5 p-3 rounded-md max-h-64 overflow-y-auto border border-white/10">
                          <pre className="text-sm text-black/90">
                            {JSON.stringify(
                              ncData.metadata.globalAttributes,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>

                      {selectedVariable && (
                        <div>
                          <h4 className="font-semibold mb-2 text-black/80">
                            Variable Attributes: {selectedVariable}
                          </h4>
                          <div className="bg-white/5 p-3 rounded-md max-h-64 overflow-y-auto border border-white/10">
                            <pre className="text-sm text-black/90">
                              {JSON.stringify(
                                ncData.variables[selectedVariable].attributes,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
