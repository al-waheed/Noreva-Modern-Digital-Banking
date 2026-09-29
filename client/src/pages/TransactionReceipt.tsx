import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  ImageDown,
  ReceiptText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

interface Transaction {
  reference: string;
  amount: string | number;
  type: string;
  status: string;
  description?: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  receiver?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const TransactionReceipt = () => {
  const navigate = useNavigate();
  const { reference } = useParams();
  const { token } = useAuth();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await api.get(`/transactions/${reference}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTransaction(response.data.transaction);
      } catch (error) {
        console.error("Failed to load transaction:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && reference) {
      fetchTransaction();
    }
  }, [token, reference]);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const copyReference = async () => {
    if (!transaction) return;

    await navigator.clipboard.writeText(transaction.reference);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const createReceiptCanvas = () => {
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const canvas = document.createElement("canvas");

    const width = 1000;
    const height = 1250;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to create receipt");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Logo
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("NOREVA", width / 2, 65);

    // Title
    ctx.font = "bold 34px Arial";
    ctx.fillText("Transfer Receipt", width / 2, 130);

    // Success icon
    ctx.beginPath();
    ctx.arc(width / 2, 190, 32, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.fillText("✓", width / 2, 200);

    // Status
    ctx.fillStyle = "#15803d";
    ctx.font = "bold 22px Arial";
    ctx.fillText("TRANSFER SUCCESSFUL", width / 2, 255);

    // Amount
    ctx.fillStyle = "#64748b";
    ctx.font = "20px Arial";
    ctx.fillText("Amount sent", width / 2, 315);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 42px Arial";
    ctx.fillText(formatCurrency(transaction.amount), width / 2, 365);

    // Receipt box
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(70, 410, width - 140, 560);

    const drawRow = (label: string, value: string, y: number) => {
      ctx.textAlign = "left";

      ctx.fillStyle = "#64748b";
      ctx.font = "20px Arial";
      ctx.fillText(label, 105, y);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "right";
      ctx.fillText(value, width - 105, y);

      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(105, y + 25);
      ctx.lineTo(width - 105, y + 25);
      ctx.stroke();
    };

    drawRow(
      "From",
      `${transaction.sender?.firstName || ""} ${transaction.sender?.lastName || ""}`,
      455,
    );

    drawRow(
      "To",
      `${transaction.receiver?.firstName || ""} ${transaction.receiver?.lastName || ""}`,
      535,
    );

    drawRow("Description", transaction.description || "Transfer", 615);

    drawRow("Date", formatDate(transaction.createdAt), 695);

    drawRow("Status", transaction.status.toLowerCase(), 775);

    // Reference
    ctx.textAlign = "left";
    ctx.fillStyle = "#64748b";
    ctx.font = "20px Arial";
    ctx.fillText("Transaction reference", 105, 855);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(105, 880, width - 210, 55);

    ctx.fillStyle = "#334155";
    ctx.font = "16px Arial";
    ctx.fillText(transaction.reference, 125, 914);

    // Footer
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px Arial";
    ctx.fillText("Noreva — Modern Digital Banking", width / 2, 1030);

    ctx.fillText(
      "This receipt is a record of your successful transfer.",
      width / 2,
      1060,
    );

    return canvas;
  };

  const downloadImage = () => {
    try {
      if (!transaction) return;

      setIsDownloading(true);

      const canvas = createReceiptCanvas();

      const link = document.createElement("a");

      link.download = `noreva-receipt-${transaction.reference}.png`;
      link.href = canvas.toDataURL("image/png");

      link.click();
    } catch (error) {
      console.error("Failed to download receipt image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadPDF = () => {
    try {
      if (!transaction) return;

      setIsDownloading(true);

      const canvas = createReceiptCanvas();
      const image = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imageWidth = pageWidth - 30;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      pdf.addImage(image, "PNG", 15, 15, imageWidth, imageHeight);

      pdf.save(`noreva-receipt-${transaction.reference}.pdf`);
    } catch (error) {
      console.error("Failed to download receipt PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading receipt...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="font-semibold text-slate-800">Transaction not found</p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isSuccessful = transaction.status.toLowerCase() === "success";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <div className="flex h-10 w-32 items-center justify-center rounded-lg border border-dashed border-slate-300">
            <span className="text-[10px] font-medium text-slate-400">
              NOREVA LOGO
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white">
            <CheckCircle2 size={27} />
          </div>

          <h1 className="mt-4 text-2xl font-semibold">Transfer successful</h1>

          <p className="mt-1 text-sm text-slate-500">
            Your money has been sent successfully.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-7 text-center">
            <p className="text-sm text-slate-500">Amount sent</p>

            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex justify-between gap-6 px-6 py-4">
              <span className="text-sm text-slate-500">From</span>

              <span className="text-right text-sm font-medium">
                {transaction.sender?.firstName} {transaction.sender?.lastName}
              </span>
            </div>

            <div className="flex justify-between gap-6 px-6 py-4">
              <span className="text-sm text-slate-500">To</span>

              <span className="text-right text-sm font-medium">
                {transaction.receiver?.firstName}{" "}
                {transaction.receiver?.lastName}
              </span>
            </div>

            <div className="flex justify-between gap-6 px-6 py-4">
              <span className="text-sm text-slate-500">Description</span>

              <span className="text-right text-sm font-medium">
                {transaction.description || "Transfer"}
              </span>
            </div>

            <div className="flex justify-between gap-6 px-6 py-4">
              <span className="text-sm text-slate-500">Date</span>

              <span className="text-right text-sm font-medium">
                {formatDate(transaction.createdAt)}
              </span>
            </div>

            <div className="flex justify-between gap-6 px-6 py-4">
              <span className="text-sm text-slate-500">Status</span>

              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium capitalize text-green-700">
                {transaction.status.toLowerCase()}
              </span>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-slate-500">Transaction reference</p>

              <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                <span className="break-all text-xs font-medium text-slate-700">
                  {transaction.reference}
                </span>

                <button
                  onClick={copyReference}
                  className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-white hover:text-slate-900"
                  title="Copy reference"
                >
                  <Copy size={16} />
                </button>
              </div>

              {copied && (
                <p className="mt-2 text-xs text-green-600">Reference copied</p>
              )}
            </div>
          </div>
        </section>

        {isSuccessful && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={downloadImage}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImageDown size={17} />
              {isDownloading ? "Preparing..." : "Download image"}
            </button>

            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              {isDownloading ? "Preparing..." : "Download PDF"}
            </button>
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ReceiptText size={17} />
          Done
        </button>
      </main>
    </div>
  );
};

export default TransactionReceipt;
