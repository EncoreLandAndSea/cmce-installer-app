import { jsPDF } from 'jspdf';
import { JobData } from '../store';
import { format } from 'date-fns';
import { loadImage } from './imageStore';

export async function generateReportPDF(job: JobData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(29, 78, 216);
  doc.text('CMCE Installation Report', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Job Details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Site: ${job.customerName}`, 20, y);
  y += 7;
  doc.text(`Address: ${job.siteAddress}`, 20, y);
  y += 7;
  doc.text(`Installer: ${job.installerName}`, 20, y);
  y += 7;
  doc.text(`Date: ${format(new Date(job.installDate), 'PPP')}`, 20, y);
  y += 7;
  doc.text(`Model: ${job.cmceModel}`, 20, y);
  y += 7;
  doc.text(`Serial Number: ${job.cmceSerialNumber}`, 20, y);
  y += 7;
  if (job.primaryDownConductorSize) {
    doc.text(`Primary Down Conductor Size: ${job.primaryDownConductorSize}`, 20, y);
    y += 7;
  }

  // Readings — highlighted box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, y, pageWidth - 40, 16, 2, 2, 'FD');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216);
  doc.text(`OHM Reading: ${job.ohmReading || 'N/A'}`, 26, y + 10);
  doc.text(`Milliamp Reading: ${job.milliampReading || 'N/A'}`, pageWidth / 2 + 4, y + 10);
  y += 24;

  // Photos and Notes
  for (const step of job.steps) {
    if (y > 180) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text(`Section: ${step.title}`, 20, y);
    y += 8;

    // Prefer runtime image, fall back to sessionStorage
    const stepImage = step.image ?? loadImage(step.id);

    if (stepImage) {
      try {
        // Measure actual image dimensions to preserve aspect ratio
        const imgEl = new Image();
        await new Promise<void>((res) => { imgEl.onload = () => res(); imgEl.src = stepImage; });
        const naturalW = imgEl.naturalWidth || 4;
        const naturalH = imgEl.naturalHeight || 3;

        const maxW = pageWidth - 20; // 10px margin each side
        const maxH = 150;
        const ratio = Math.min(maxW / naturalW, maxH / naturalH);
        const imgWidth = Math.round(naturalW * ratio);
        const imgHeight = Math.round(naturalH * ratio);
        const x = (pageWidth - imgWidth) / 2;

        const imgFormat = stepImage.includes('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(stepImage, imgFormat, x, y, imgWidth, imgHeight, undefined, 'FAST');
        y += imgHeight + 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text(`Photo: ${step.title}`, pageWidth / 2, y, { align: 'center' });
        y += 10;
      } catch (err) {
        console.error('Error adding image to PDF:', err);
        doc.setTextColor(220, 38, 38);
        doc.text('[Error rendering image]', 20, y);
        y += 10;
      }
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text('No photo provided for this section.', 20, y);
      y += 10;
    }

    if (step.notes) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const splitNotes = doc.splitTextToSize(`Field Notes: ${step.notes}`, pageWidth - 40);
      doc.text(splitNotes, 20, y);
      y += (splitNotes.length * 6) + 10;
    } else {
      y += 5;
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 15;
  }

  // Additional Photos section
  const additionalPhotos = (job.additionalPhotos ?? []).filter(p => p.image);
  if (additionalPhotos.length > 0) {
    if (y > 200) { doc.addPage(); y = 20; }

    // Section header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text('Additional Photos', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setDrawColor(29, 78, 216);
    doc.setLineWidth(0.8);
    doc.line(20, y, pageWidth - 20, y);
    y += 12;

    const pageHeight = doc.internal.pageSize.getHeight();

    for (const photo of additionalPhotos) {
      if (!photo.image) continue;

      try {
        const imgEl = new Image();
        await new Promise<void>((res) => { imgEl.onload = () => res(); imgEl.src = photo.image!; });
        const naturalW = imgEl.naturalWidth || 4;
        const naturalH = imgEl.naturalHeight || 3;

        const maxW = pageWidth - 20;
        const maxH = 150;
        const ratio = Math.min(maxW / naturalW, maxH / naturalH);
        const imgWidth = Math.round(naturalW * ratio);
        const imgHeight = Math.round(naturalH * ratio);

        // Pre-calculate caption height so we can keep image + caption together
        let captionLines: string[] = [];
        let captionHeight = 0;
        if (photo.caption?.trim()) {
          doc.setFontSize(10);
          captionLines = doc.splitTextToSize(photo.caption.trim(), pageWidth - 40);
          captionHeight = captionLines.length * 6 + 10;
        } else {
          captionHeight = 5; // same as notes-absent gap in steps
        }

        // Check if image + caption + divider fit on current page; if not, new page
        const blockHeight = imgHeight + 8 + captionHeight + 15;
        if (y + blockHeight > pageHeight - 15) { doc.addPage(); y = 20; }

        const x = (pageWidth - imgWidth) / 2;
        const imgFormat = photo.image.includes('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(photo.image, imgFormat, x, y, imgWidth, imgHeight);
        y += imgHeight + 8; // match step spacing

        // Caption below image (matches step's italic label style)
        if (captionLines.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 116, 139);
          doc.text(captionLines, pageWidth / 2, y, { align: 'center' });
          y += captionLines.length * 6 + 10;
        } else {
          y += 5;
        }

        // Divider — same as steps
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(20, y, pageWidth - 20, y);
        y += 15;
      } catch (err) {
        console.error('Error adding additional photo to PDF:', err);
        y += 8;
      }
    }
  }

  // Certification & Signature
  if (job.signature) {
    if (y > 210) {
      doc.addPage();
      y = 20;
    }

    // Certification Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, y, pageWidth - 40, 25, 3, 3, 'FD');
    
    // Draw Checkbox
    doc.setDrawColor(29, 78, 216); // primary blue
    doc.setLineWidth(0.5);
    doc.rect(28, y + 8, 8, 8); // box

    if (job.isCertified) {
      // Draw a checkmark using lines (Unicode ✓ doesn't render in built-in jsPDF fonts)
      doc.setDrawColor(22, 163, 74); // success green
      doc.setLineWidth(1.2);
      // Short left stroke of the tick
      doc.line(29.5, y + 13, 31.5, y + 15.5);
      // Long right stroke of the tick
      doc.line(31.5, y + 15.5, 35, y + 10);
      doc.setLineWidth(0.5); // reset
    }

    // Certification Text
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const certText = "I certify that this CMCE installation was completed in accordance with Encore Land & Sea installation standards.";
    const splitCert = doc.splitTextToSize(certText, pageWidth - 65);
    doc.text(splitCert, 42, y + 12);
    
    y += 35;

    // Signature Label
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Installer Signature', 20, y);
    y += 5;
    doc.addImage(job.signature, 'PNG', 20, y, 50, 20);
  }

  return doc.output('blob');
}

