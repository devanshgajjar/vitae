'use client';

import { Info } from 'lucide-react';

export default function ExportInstructions() {
  return (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <Info className="w-5 h-5 text-blue-700 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <h4 className="font-semibold text-blue-900 mb-1">PDF Export Instructions</h4>
          <p className="text-blue-800 mb-2 font-medium">
            Click "PDF (Harvard)" to open a professionally formatted preview in Harvard CV style.
          </p>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>A new window will open with your formatted resume</li>
            <li>Use your browser's print function (Ctrl/Cmd + P) to save as PDF</li>
            <li>Select "Save as PDF" in the print destination</li>
            <li>The format includes proper Times New Roman font, margins, and spacing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
