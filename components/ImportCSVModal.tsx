

import React, { useState } from 'react';
import { Component, Category, ComponentLink, MaintenanceRecord } from '../types.ts';
import { ImportIcon } from './Icons.tsx';

interface ImportCSVModalProps {
  onClose: () => void;
  onImport: (components: Omit<Component, 'id' | 'createdAt'>[]) => void;
}

const simpleParseCSV = (csvText: string): Record<string, string>[] => {
    const lines = csvText.trim().replace(/\r/g, '').split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].trim().split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        if (values.length === headers.length) {
            const entry: Record<string, string> = {};
            headers.forEach((header, index) => {
                let value = values[index]?.trim() || '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                value = value.replace(/""/g, '"');
                entry[header] = value;
            });
            data.push(entry);
        }
    }
    return data;
};


const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Omit<Component, 'id' | 'createdAt'>[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            setError('Please upload a valid .csv file.');
            setFile(null);
            setParsedData([]);
            return;
        }
        setFile(selectedFile);
        setError('');
        processFile(selectedFile);
    }
  };

  const processFile = (fileToProcess: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target?.result as string;
            const jsonData = simpleParseCSV(text);
            
            const validCategories = Object.values(Category);
            
            const components: Omit<Component, 'id' | 'createdAt'>[] = jsonData.map((row, index) => {
                const name = row.name;
                const totalQuantity = parseInt(row.totalquantity, 10);
                const category = row.category as Category;

                if (!name || isNaN(totalQuantity) || totalQuantity < 0) {
                    throw new Error(`Row ${index + 2}: Invalid or missing 'name' or 'totalQuantity'.`);
                }
                if (!category || !validCategories.includes(category)) {
                    throw new Error(`Row ${index + 2}: Invalid category "${category}". Must be one of: ${validCategories.join(', ')}`);
                }

                const lowStockThreshold = row.lowstockthreshold ? parseInt(row.lowstockthreshold, 10) : undefined;
                if (lowStockThreshold !== undefined && isNaN(lowStockThreshold)) {
                     throw new Error(`Row ${index + 2}: 'lowStockThreshold' must be a number.`);
                }
                
                let links: ComponentLink[] = [];
                if (row.links) {
                    try {
                        links = JSON.parse(row.links);
                        if (!Array.isArray(links)) throw new Error();
                    } catch {
                        throw new Error(`Row ${index + 2}: Malformed JSON in 'links' column.`);
                    }
                }

                let maintenanceLog: MaintenanceRecord[] = [];
                if (row.maintenancelog) {
                    try {
                        maintenanceLog = JSON.parse(row.maintenancelog);
                        if (!Array.isArray(maintenanceLog)) throw new Error();
                    } catch {
                        throw new Error(`Row ${index + 2}: Malformed JSON in 'maintenanceLog' column.`);
                    }
                }

                return {
                    name,
                    description: row.description || '',
                    category,
                    totalQuantity,
                    imageUrl: row.imageurl || 'https://placehold.co/400x300/1e293b/94a3b8/png?text=No+Image',
                    lowStockThreshold: isNaN(lowStockThreshold as number) ? undefined : lowStockThreshold,
                    issuedTo: [],
                    isAvailable: true,
                    links,
                    isUnderMaintenance: (row.isundermaintenance || 'false').toLowerCase() === 'true',
                    maintenanceLog,
                };
            });
            
            setParsedData(components);
            setError('');
        } catch (err: any) {
            setError(`Error parsing file: ${err.message}`);
            setParsedData([]);
        } finally {
            setIsLoading(false);
        }
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
        setIsLoading(false);
    }
    reader.readAsText(fileToProcess);
  };

  const handleImportClick = () => {
    if (parsedData.length > 0) {
      onImport(parsedData);
    }
  };
  
  const handleDownloadTemplate = () => {
    const headers = ["name", "description", "category", "totalQuantity", "imageUrl", "lowStockThreshold", "links", "isUnderMaintenance", "maintenanceLog"];
    const exampleLinks = JSON.stringify([{ type: "Datasheet", url: "https://example.com/datasheet.pdf" }]);
    const exampleMaintLog = JSON.stringify([{ id: "1", date: new Date().toISOString(), notes: "Replaced faulty wire." }]);
    const exampleRow = [
      `"Arduino Uno"`,
      `"Official Arduino Uno R3 board for beginners, great for electronics projects."`,
      Category.MICROCONTROLLER,
      "10",
      `"https://i.ibb.co/L5B02xT/arduino-uno.png"`,
      "2",
      `"${exampleLinks.replace(/"/g, '""')}"`,
      "false",
      `"${exampleMaintLog.replace(/"/g, '""')}"`,
    ];
    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "tinkerhub-import-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-sky-400">Import Components from CSV</h2>
        
        <div className="space-y-4 flex-grow overflow-y-auto pr-2">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
                <h3 className="font-semibold text-slate-200 mb-2">Instructions</h3>
                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                    <li>Your CSV file must have headers (case-insensitive): <code className="text-xs bg-slate-700 p-1 rounded">name</code>, <code className="text-xs bg-slate-700 p-1 rounded">category</code>, <code className="text-xs bg-slate-700 p-1 rounded">totalQuantity</code>.</li>
                    <li>Optional headers include all other component fields (e.g., <code className="text-xs bg-slate-700 p-1 rounded">isUnderMaintenance</code>).</li>
                    <li>The <code className="text-xs bg-slate-700 p-1 rounded">links</code> and <code className="text-xs bg-slate-700 p-1 rounded">maintenanceLog</code> columns should contain a JSON array string.</li>
                    <li>The <code className="text-xs bg-slate-700 p-1 rounded">category</code> must match one of the existing categories exactly (e.g., "Microcontroller", "Sensor").</li>
                    <li>
                        <button onClick={handleDownloadTemplate} className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                           Download a template file
                        </button> to get started.
                    </li>
                </ul>
            </div>

            <div>
                <label htmlFor="csvFile" className="block text-sm font-medium text-slate-300 mb-2">Upload CSV File</label>
                <input 
                    type="file" 
                    id="csvFile"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
            </div>
            
            {isLoading && <p className="text-center text-slate-300 animate-pulse">Processing file...</p>}
            {error && <p className="text-red-500 text-sm bg-red-900/30 p-3 rounded-md">{error}</p>}
            
            {parsedData.length > 0 && !error && (
                <div>
                    <h3 className="font-semibold text-slate-200 mb-2">Preview ({parsedData.length} components found)</h3>
                    <div className="max-h-60 overflow-y-auto bg-slate-900/50 border border-slate-600 rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="sticky top-0 bg-slate-700">
                                <tr>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Category</th>
                                    <th className="p-2 text-center">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 10).map((comp, index) => (
                                    <tr key={index} className="border-b border-slate-700 last:border-0">
                                        <td className="p-2">{comp.name}</td>
                                        <td className="p-2">{comp.category}</td>
                                        <td className="p-2 text-center">{comp.totalQuantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 10 && <p className="text-center text-xs text-slate-400 p-2">...and {parsedData.length - 10} more.</p>}
                    </div>
                </div>
            )}
        </div>
        
        <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">Cancel</button>
            <button 
                type="button" 
                onClick={handleImportClick}
                disabled={parsedData.length === 0 || !!error || isLoading}
                className="py-2 px-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ImportIcon /> Import {parsedData.length > 0 ? parsedData.length : ''} Components
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCSVModal;