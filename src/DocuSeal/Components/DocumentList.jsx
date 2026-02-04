import { useEffect, useState } from "react";
import { getAllDocument } from "../API/DocuSealServices";
import Loader from "./Loader";
import {
  Calendar,
  SlidersHorizontal,
  Search,
  FileSignature,
  Eye,
} from "lucide-react";

const LIMIT = 10;

export default function DocumentList({ nextStep }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, [page, statusFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const load = async () => {
    try {
      setLoading(true);

      const res = await getAllDocument({
        page,
        limit: LIMIT,
        status: statusFilter,
        search,
      });

      setItems(res.submissions || []);
      setTotalPages(res.pagination.total_pages);
      setTotalCount(res.pagination.total_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    if (item.status === "completed") {
      const pdfUrl = item.documents?.[0]?.url;
      if (!pdfUrl) return alert("Signed PDF not available");
      window.open(pdfUrl, "_blank");
      return;
    }
    if (!item.embed_src) return alert("Signing link not available");
    window.open(item.embed_src, "_blank");
  };

  const StartFlow = () => (
    <div className="w-full flex justify-center">
      <div className="max-w-lg w-full text-center bg-white rounded-2xl border p-8 my-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
          <FileSignature className="h-8 w-8 text-sky-600" />
        </div>
        <h2 className="mb-3 text-3xl font-bold">Document Signature</h2>
        <p className="mb-8 text-gray-500">
          Upload your PDF, place signature fields, and send it for signing.
        </p>
        <button
          onClick={nextStep}
          className="rounded-xl bg-sky-500 px-8 py-3 text-white font-semibold hover:bg-sky-600"
        >
          Get Started
        </button>
      </div>
    </div>
  );

  return (
    <>
      <StartFlow />
      <hr />

      <div className="space-y-4 p-4 md:p-6">
        <h1 className="text-2xl font-bold">Submissions</h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gray-700 hidden sm:block" />
            {["ALL", "PENDING", "COMPLETED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  statusFilter === s
                    ? "bg-sky-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference number…"
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {items.map((item) => {
          const status = item.status?.toUpperCase();
          const docName = item.documents?.[0]?.name || "Document";
          const isCompleted = status === "COMPLETED";

          return (
            <div
              key={item.id}
              className="group flex flex-col md:flex-row md:items-center justify-between
                rounded-2xl border border-gray-200 bg-white p-5 gap-4
                shadow-sm transition-all duration-300
                hover:shadow-lg hover:-translate-y-[2px]"
            >
              <div className="flex flex-col gap-2 p-1">
                <div className="font-bold text-slate-900 truncate max-w-xs text-base tracking-tight">
                  {docName}
                </div>

                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600/80 italic">
                    <span className="text-slate-300 not-italic">•</span>
                    <span>
                      {new Date(item.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`flex items-center justify-center gap-2 px-4 py-1.5
                  rounded-full text-sm font-semibold min-w-[120px]
                  ${
                    isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isCompleted ? "bg-green-600" : "bg-sky-600"
                  }`}
                />
                {status}
              </div>
              {isCompleted && (
                <button
                  onClick={() => handleView(item)}
                  className="inline-flex items-center justify-center gap-2
                  px-5 py-2 rounded-xl font-medium
                  bg-sky-500 text-white
                  transition-all duration-200
                  hover:bg-sky-600 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                  <Eye size={18} />
                  View
                </button>
              )}
            </div>
          );
        })}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * LIMIT + 1}–
              {Math.min(page * LIMIT, totalCount)} of {totalCount}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded border disabled:opacity-40"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded ${
                      page === p
                        ? "bg-sky-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded border disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <Loader show={loading} label="Loading..." />
      </div>
    </>
  );
}
