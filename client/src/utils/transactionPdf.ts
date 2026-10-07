import { jsPDF } from "jspdf";

import type { Transaction } from "../hooks/useTransactionFilters";

interface UserSummary {
  firstName?: string;
  lastName?: string;
  email?: string;
  accountNumber?: string;
}

interface DownloadTransactionPdfArgs {
  filteredTransactions: Transaction[];
  totalReceived: number;
  totalSent: number;
  hasFilters: boolean;
  user: UserSummary | null;
  isReceived: (transaction: Transaction) => boolean;
  formatCurrency: (amount: string | number) => string;
  setIsDownloading: (value: boolean) => void;
  fromDate?: string;
  toDate?: string;
}

const formatPdfDate = (date: string) => {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
};

const getStatementPeriod = (
  filteredTransactions: Transaction[],
  fromDate?: string,
  toDate?: string,
) => {
  if (fromDate && toDate) {
    return `${formatPdfDate(`${fromDate}T00:00:00`)} - ${formatPdfDate(
      `${toDate}T00:00:00`,
    )}`;
  }

  if (fromDate) {
    return `From ${formatPdfDate(`${fromDate}T00:00:00`)}`;
  }

  if (toDate) {
    return `Up to ${formatPdfDate(`${toDate}T00:00:00`)}`;
  }

  if (filteredTransactions.length > 0) {
    const dates = filteredTransactions.map((transaction) =>
      new Date(transaction.createdAt).getTime(),
    );

    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));

    return `${formatPdfDate(
      earliest.toISOString(),
    )} - ${formatPdfDate(latest.toISOString())}`;
  }

  return "All transactions";
};

export const downloadTransactionPdf = async ({
  filteredTransactions,
  totalReceived,
  totalSent,
  hasFilters,
  user,
  isReceived,
  formatCurrency,
  setIsDownloading,
  fromDate,
  toDate,
}: DownloadTransactionPdfArgs) => {
  if (filteredTransactions.length === 0) {
    return;
  }

  setIsDownloading(true);

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 14;

    const darkText = [15, 23, 42] as const;
    const mutedText = [100, 116, 139] as const;
    const border = [226, 232, 240] as const;
    const lightBackground = [248, 250, 252] as const;

    const drawHeader = () => {
      doc.setFillColor(
        lightBackground[0],
        lightBackground[1],
        lightBackground[2],
      );

      doc.rect(0, 0, pageWidth, 31, "F");

      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(19);
      doc.text("NOREVA", margin, 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      doc.text("Modern Digital Banking", margin, 20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text("TRANSACTION HISTORY", pageWidth - margin, 14, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      doc.text(
        `Generated ${formatPdfDate(new Date().toISOString())}`,
        pageWidth - margin,
        20,
        {
          align: "right",
        },
      );
    };

    const drawFooter = () => {
      const pageNumber = doc.getNumberOfPages();

      doc.setDrawColor(border[0], border[1], border[2]);

      doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);

      doc.text("Noreva transaction statement", margin, pageHeight - 6);

      doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 6, {
        align: "right",
      });
    };

    const drawTableHeader = (y: number) => {
      doc.setFillColor(
        lightBackground[0],
        lightBackground[1],
        lightBackground[2],
      );

      doc.rect(margin, y - 5, pageWidth - margin * 2, 9, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);

      doc.text("DATE", margin + 2, y);
      doc.text("DESCRIPTION", margin + 31, y);
      doc.text("TYPE", margin + 91, y);
      doc.text("REFERENCE", margin + 120, y);
      doc.text("STATUS", margin + 184, y);
      doc.text("AMOUNT", pageWidth - margin - 2, y, {
        align: "right",
      });

      return y + 9;
    };

    drawHeader();

    let y = 42;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text("Account holder", margin, y);

    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      margin,
      y,
    );

    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);

    doc.text(user?.email || "—", margin, y);

    y += 5;

    doc.text(`Account number: ${user?.accountNumber || "—"}`, margin, y);

    doc.text(
      `Statement period: ${getStatementPeriod(filteredTransactions, fromDate, toDate)}`,
      pageWidth - margin,
      y,
      {
        align: "right",
      },
    );

    y += 12;

    const summaryWidth = (pageWidth - margin * 2 - 9) / 4;

    const summaryItems = [
      {
        label: "Total received",
        value: formatCurrency(totalReceived),
      },
      {
        label: "Total sent",
        value: formatCurrency(totalSent),
      },
      {
        label: "Transactions",
        value: String(filteredTransactions.length),
      },
      {
        label: "Filtered results",
        value: hasFilters ? "Yes" : "All",
      },
    ];

    summaryItems.forEach((item, index) => {
      const x = margin + index * (summaryWidth + 3);

      doc.setDrawColor(border[0], border[1], border[2]);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, summaryWidth, 19, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      doc.text(item.label.toUpperCase(), x + 4, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(item.value, x + 4, y + 14);
    });

    y += 29;

    y = drawTableHeader(y);

    const rowHeight = 11;

    filteredTransactions.forEach((transaction) => {
      if (y > pageHeight - 22) {
        drawFooter();
        doc.addPage();
        drawHeader();
        y = 42;
        y = drawTableHeader(y);
      }

      const received = isReceived(transaction);
      const otherPerson = received
        ? transaction.sender
        : transaction.receiver;

      const personName = otherPerson
        ? `${otherPerson.firstName} ${otherPerson.lastName}`
        : "Transfer";

      const description = transaction.description || personName;
      const type = received ? "Received" : "Sent";
      const amount = `${received ? "+" : "-"}${formatCurrency(
        transaction.amount,
      )}`;
      const status = transaction.status.toLowerCase();

      doc.setDrawColor(border[0], border[1], border[2]);
      doc.line(margin, y + 4, pageWidth - margin, y + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);

      doc.text(formatPdfDate(transaction.createdAt), margin + 2, y);

      const descriptionText = doc.splitTextToSize(description, 55);
      doc.text(descriptionText[0], margin + 31, y);

      doc.text(type, margin + 91, y);

      doc.setFontSize(6.5);
      doc.text(transaction.reference, margin + 120, y);

      doc.setFontSize(7);
      doc.text(
        status.charAt(0).toUpperCase() + status.slice(1),
        margin + 184,
        y,
      );

      doc.setFont("helvetica", "bold");
      doc.text(amount, pageWidth - margin - 2, y, {
        align: "right",
      });

      y += rowHeight;
    });

    drawFooter();

    doc.save(
      `noreva-transaction-history-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  } catch (error) {
    console.error("Failed to generate transaction PDF:", error);
  } finally {
    setIsDownloading(false);
  }
};
