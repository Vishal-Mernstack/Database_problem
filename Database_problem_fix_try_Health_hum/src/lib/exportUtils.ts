import { toast } from 'sonner';

export function exportToCSV(data: Record<string, any>[], filename: string, headers?: string[]) {
  if (data.length === 0) {
    toast.error('No data to export');
    return;
  }

  const keys = headers || Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  toast.success(`${filename}.csv downloaded successfully`);
}

export function exportToPDF(title: string, content: string, filename: string) {
  // Create a simple HTML document for PDF-like export
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
    .report-date { color: #666; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #0ea5e9; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="report-date">Generated on: ${new Date().toLocaleDateString()}</p>
  ${content}
  <div class="footer">
    <p>MediCare Hospital Management System</p>
    <p>This is a computer-generated document.</p>
  </div>
</body>
</html>
`;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
  toast.success(`${filename} ready for printing`);
}

export function exportToExcel(data: Record<string, any>[], filename: string) {
  // Export as CSV with .xls extension (Excel can open it)
  if (data.length === 0) {
    toast.error('No data to export');
    return;
  }

  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join('\t'),
    ...data.map(row => keys.map(key => row[key] ?? '').join('\t'))
  ].join('\n');

  downloadFile(csvContent, `${filename}.xls`, 'application/vnd.ms-excel');
  toast.success(`${filename}.xls downloaded successfully`);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate table HTML for PDF exports
export function generateTableHTML(headers: string[], rows: any[][]): string {
  return `
    <table>
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
