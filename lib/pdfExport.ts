import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
}

export async function exportElementToPDF(
  elementId: string, 
  options: PDFOptions = {}
): Promise<void> {
  const { 
    filename = `report-${new Date().toISOString().split('T')[0]}`, 
    orientation = 'portrait',
    format = 'a4'
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  try {
    // Create canvas from element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate dimensions
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    let imgY = 10;

    // Add image to PDF
    pdf.addImage(
      imgData, 
      'PNG', 
      imgX, 
      imgY, 
      imgWidth * ratio, 
      imgHeight * ratio
    );

    // Save PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

export function generateLeaseReviewReportPDF(
  reviews: any[], 
  stats: any, 
  demoData: any
): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(37, 99, 235); // primary-600
  pdf.text('Lease Review Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  pdf.setFontSize(12);
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

  // Summary Stats
  yPos += 20;
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text('Summary Statistics', 20, yPos);

  yPos += 10;
  pdf.setFontSize(11);
  pdf.setTextColor(71, 85, 105); // slate-600
  pdf.text(`Total Reviews: ${stats.total}`, 20, yPos);
  yPos += 7;
  pdf.text(`Completed: ${stats.completed}`, 20, yPos);
  yPos += 7;
  pdf.text(`Pending: ${stats.pending}`, 20, yPos);
  yPos += 7;
  pdf.text(`Flagged: ${stats.flagged}`, 20, yPos);
  yPos += 7;
  pdf.text(`Average On-Time Payment: ${stats.avgOnTimePayment}%`, 20, yPos);
  yPos += 7;
  pdf.text(`Recommend Renewal: ${stats.recommendRenewal}`, 20, yPos);

  // Reviews Table
  yPos += 20;
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Lease Reviews', 20, yPos);

  // Table headers
  yPos += 10;
  pdf.setFillColor(248, 250, 252); // slate-50
  pdf.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  pdf.text('Tenant', 22, yPos);
  pdf.text('Property', 70, yPos);
  pdf.text('Rating', 120, yPos);
  pdf.text('Status', 145, yPos);
  pdf.text('Renewal', 170, yPos);

  // Table rows
  reviews.forEach((review, index) => {
    const tenant = demoData.tenants.find((t: any) => t.id === review.tenantId);
    const property = demoData.properties.find((p: any) => p.id === review.propertyId);
    
    yPos += 8;
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }

    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    }

    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
    pdf.text(tenantName.substring(0, 20), 22, yPos);
    pdf.text((property?.title || 'Unknown').substring(0, 20), 70, yPos);
    pdf.text(review.complianceRating.charAt(0).toUpperCase() + review.complianceRating.slice(1), 120, yPos);
    pdf.text(review.status.charAt(0).toUpperCase() + review.status.slice(1), 145, yPos);
    pdf.text(review.recommendRenewal ? 'Yes' : 'No', 170, yPos);
  });

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${i} of ${pageCount} - EazyRentals Lease Review Report`, pageWidth / 2, 285, { align: 'center' });
  }

  return pdf;
}

export function generatePaymentReportPDF(
  payments: any[],
  stats: { totalPaid: number; totalOutstanding: number; totalPayments: number },
  demoData: any
): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  pdf.setFontSize(24);
  pdf.setTextColor(37, 99, 235);
  pdf.text('Payment Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  pdf.setFontSize(12);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

  // Financial Summary
  yPos += 20;
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Financial Summary', 20, yPos);

  yPos += 10;
  pdf.setFontSize(11);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Total Payments: ${stats.totalPayments}`, 20, yPos);
  yPos += 7;
  pdf.text(`Total Collected: $${stats.totalPaid.toLocaleString()}`, 20, yPos);
  yPos += 7;
  pdf.text(`Outstanding: $${stats.totalOutstanding.toLocaleString()}`, 20, yPos);

  // Payments Table
  yPos += 20;
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Payment Details', 20, yPos);

  // Table headers
  yPos += 10;
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  pdf.text('Tenant', 22, yPos);
  pdf.text('Amount', 70, yPos);
  pdf.text('Type', 100, yPos);
  pdf.text('Status', 130, yPos);
  pdf.text('Date', 160, yPos);

  // Table rows
  payments.forEach((payment, index) => {
    const tenant = demoData.tenants.find((t: any) => t.id === payment.tenantId);
    
    yPos += 8;
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }

    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    }

    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
    pdf.text(tenantName.substring(0, 18), 22, yPos);
    pdf.text(`$${payment.amount.toLocaleString()}`, 70, yPos);
    pdf.text(payment.type.charAt(0).toUpperCase() + payment.type.slice(1), 100, yPos);
    pdf.text(payment.status.charAt(0).toUpperCase() + payment.status.slice(1), 130, yPos);
    pdf.text(payment.paidDate || payment.dueDate || '-', 160, yPos);
  });

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${i} of ${pageCount} - EazyRentals Payment Report`, pageWidth / 2, 285, { align: 'center' });
  }

  return pdf;
}

export function downloadPDF(pdf: jsPDF, filename: string): void {
  pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
}
