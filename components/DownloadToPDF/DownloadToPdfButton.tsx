import { Button } from "@mantine/core";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type DownloadButtonProps = {
  pageContentId: string;
  pdfFileName: string;
};

function addFooters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  options: { pageWidth: number; pageHeight: number; image?: HTMLImageElement }
) {
  const { pageWidth, pageHeight, image } = options;
  const footerTextPositionY = pageHeight - 8;
  const footerImagePositionY = footerTextPositionY - 4;

  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setTextColor(44, 46, 51);
    pdf.setFontSize(8);
    pdf.text(`Page: ${i}`, 15, footerTextPositionY, { align: "center" });
    pdf.text("Powered by", pageWidth - 35, footerTextPositionY, {
      align: "center",
    });
    if (image) {
      pdf.addImage(image, "PNG", pageWidth - 26, footerImagePositionY, 15, 5);
    }
  }
}

const DownloadToPdfButton: React.FC<DownloadButtonProps> = ({
  pageContentId,
  pdfFileName,
}) => {
  const handleDownload = async () => {
    const pageContent = document.getElementById(pageContentId);
    if (!pageContent) {
      console.error(`Element with ID '${pageContentId}' not found.`);
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // Adjust the margin value as needed

    // footer image
    const imgSrc = "/logo-request-light.png";
    const footerImg = new Image();
    footerImg.src = imgSrc;

    // generate sections
    const sections = pageContent.children;
    let currentPosition = margin;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const canvas = await html2canvas(section as HTMLElement, {
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (currentPosition + imgHeight > pageHeight - margin) {
        pdf.addPage();
        currentPosition = margin;
      }

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        currentPosition,
        imgWidth,
        imgHeight
      );
      currentPosition += imgHeight + margin;
    }
    addFooters(pdf, { pageWidth, pageHeight, image: footerImg });
    pdf.save(pdfFileName);
  };

  return (
    <Button mt="md" size="md" onClick={handleDownload} fullWidth>
      Download as PDF
    </Button>
  );
};

export default DownloadToPdfButton;
