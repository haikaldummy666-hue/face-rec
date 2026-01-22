import React from 'react';
import { exportToCSV, exportToPDF } from '../../utils/export-utils';
import styles from './ExportData.module.css';

const ExportData = ({ sessionData }) => {
  const handleCSVExport = () => {
    exportToCSV(sessionData, `emotion-data-${Date.now()}.csv`);
  };

  const handlePDFExport = () => {
    exportToPDF(sessionData, `emotion-report-${Date.now()}.pdf`);
  };

  return (
    <div className={styles.exportContainer}>
      <button onClick={handleCSVExport} className={styles.exportButton}>
        Export to CSV
      </button>
      <button onClick={handlePDFExport} className={styles.exportButton}>
        Export to PDF
      </button>
    </div>
  );
};

export default ExportData;