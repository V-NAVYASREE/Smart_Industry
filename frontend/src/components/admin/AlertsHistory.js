import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AlertsHistory = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/sensor_data')
      .then(res => {
        const processedData = res.data.map((item, index) => ({
          ...item,
          id: index + 1
        }));
        setAlerts(processedData);
      })
      .catch(err => console.error('Error fetching alerts history:', err));
  }, []);

  const columns = [
    { field: 'timestamp', headerName: 'Timestamp', width: 200 },
    { field: 'user_id', headerName: 'User ID', width: 150 },
    { field: 'pm25', headerName: 'PM2.5', width: 120 },
    { field: 'pm10', headerName: 'PM10', width: 120 },
    { field: 'pm1', headerName: 'PM1', width: 120 },
    { field: 'co', headerName: 'CO', width: 120 },
    { field: 'voc', headerName: 'VOC', width: 120 },
    { field: 'humidity', headerName: 'Humidity (%)', width: 130 },
    { field: 'temperature', headerName: 'Temperature (°C)', width: 150 },
    { field: 'risk_level', headerName: 'Risk Level', width: 150 }
  ];

  // Function to export alerts to Excel
  const exportToExcel = () => {
    // Remove `id` field to keep clean export
    const exportData = alerts.map(({ id, ...rest }) => rest);

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alerts");

    // Write workbook and create Blob
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Save the file
    saveAs(data, "alerts_history_live.xlsx");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Alerts & History</Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={exportToExcel}>
        Download Live Data as Excel
      </Button>

      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={alerts}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(row) => row.id}
          autoHeight={false}
        />
      </Box>
    </Box>
  );
};

export default AlertsHistory;
