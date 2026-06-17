import { useState, useRef } from "react";
import { Upload, Download, CheckCircle, XCircle, FileText, X, Users } from "lucide-react";
import api from "../../api/axiosConfig";

export default function StudentBulkUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) {
      setFile(dropped);
      setResult(null);
      setError("");
    } else {
      setError("Only .csv files supported.");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError("");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get("/students/bulk-template/", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_template.csv";
      a.click();
    } catch {
      setError("Template download failed.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/students/bulk-upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      if (res.data.created_count > 0 && onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={22} className="text-blue-600" />
            Bulk Student Import
          </h2>
          <p className="text-sm text-gray-500 mt-1">CSV ফাইল আপলোড করে একসাথে অনেক student add করুন</p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition"
        >
          <Download size={16} />
          Template Download
        </button>
      </div>

      {!result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
            ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
            ${file ? "border-blue-400 bg-blue-50" : ""}`}
        >
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div className="space-y-2">
              <FileText size={40} className="mx-auto text-blue-500" />
              <p className="font-semibold text-blue-700">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="text-red-500 text-xs flex items-center gap-1 mx-auto hover:underline"
              >
                <X size={12} /> Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={40} className="mx-auto text-gray-400" />
              <p className="text-gray-600 font-medium">CSV ফাইল এখানে drag করুন</p>
              <p className="text-sm text-gray-400">অথবা click করে select করুন</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <XCircle size={16} /> {error}
        </div>
      )}

      {file && !result && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Importing...</>
          ) : (
            <><Upload size={18} />Import Students</>
          )}
        </button>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <CheckCircle size={28} className="mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-green-700">{result.created_count}</p>
              <p className="text-sm text-green-600">Students Created</p>
            </div>
            <div className={`border rounded-xl p-4 text-center ${result.error_count > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
              <XCircle size={28} className={`mx-auto mb-1 ${result.error_count > 0 ? "text-red-500" : "text-gray-400"}`} />
              <p className={`text-2xl font-bold ${result.error_count > 0 ? "text-red-700" : "text-gray-500"}`}>{result.error_count}</p>
              <p className={`text-sm ${result.error_count > 0 ? "text-red-600" : "text-gray-500"}`}>Errors</p>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-700 mb-2 text-sm">Error Details:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600">Row {e.row} {e.name ? `(${e.name})` : ""}: {e.errors.join(", ")}</p>
                ))}
              </div>
            </div>
          )}

          {result.created?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <p className="px-4 py-2 bg-gray-50 font-semibold text-sm text-gray-700 border-b">
                Imported Students ({result.created.length})
              </p>
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {result.created.map((s, i) => (
                  <div key={i} className="px-4 py-2 flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <span className="text-gray-500">{s.class} — Roll {s.roll}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset} className="w-full py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
            আরও Import করুন
          </button>
        </div>
      )}
    </div>
  );
}