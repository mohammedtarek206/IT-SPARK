/**
 * Utility to export data to CSV format compatible with Excel.
 * Handles UTF-8 BOM for Arabic character support.
 */
export const exportToCSV = (data: any[], filename: string, columns: { header: string, key: string }[]) => {
    if (!data || !data.length) return;

    // Create CSV content
    const csvRows = [];

    // Add headers
    csvRows.push(columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(','));

    // Add data rows
    for (const row of data) {
        const values = columns.map(col => {
            const val = getNestedValue(row, col.key);
            const escaped = ('' + (val || '')).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');

    // Add UTF-8 BOM for Excel Arabic support
    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Helper to get value from nested object using dot notation (e.g., 'user.name')
 */
const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};
