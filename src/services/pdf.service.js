'use strict';
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { formatDate } = require('../common/helpers/dateHelper');

function generatePdfBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

function addHospitalHeader(doc, title) {
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('HOSPITAL INFORMATION SYSTEM', { align: 'center' })
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(title, { align: 'center' })
    .moveDown();
}

function addPatientInfo(doc, patient) {
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Mã BN: ${patient.patient_id}  |  Họ tên: ${patient.full_name}  |  Ngày sinh: ${formatDate(patient.dob)}`, { align: 'left' })
    .moveDown(0.5);
}

function addTable(doc, headers, rows, startX = 50, startY) {
  const tableTop = startY || doc.y;
  const columnWidths = headers.map(() => 100);

  doc
    .font('Helvetica-Bold')
    .fontSize(9);

  let y = tableTop;
  const x = startX;

  // Header row
  headers.forEach((header, i) => {
    doc
      .rect(x + i * columnWidths[i], y, columnWidths[i], 20)
      .stroke();
    doc.text(header, x + i * columnWidths[i] + 2, y + 5, {
      width: columnWidths[i] - 4,
    });
  });
  y += 20;

  // Data rows
  doc.font('Helvetica').fontSize(8);
  rows.forEach(row => {
    headers.forEach((_, i) => {
      doc
        .rect(x + i * columnWidths[i], y, columnWidths[i], 18)
        .stroke();
      doc.text(String(row[i] || ''), x + i * columnWidths[i] + 2, y + 3, {
        width: columnWidths[i] - 4,
      });
    });
    y += 18;
  });

  doc.y = y;
}

module.exports = { generatePdfBuffer, addHospitalHeader, addPatientInfo, addTable };
