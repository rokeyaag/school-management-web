import { useState, useEffect } from "react";
import { Images, Plus, Trash2, Upload, X, ArrowLeft, Image, Eye } from "lucide-react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Gallery() {
  const { user } = useAuth();
  const isAdmin = user?.role === "school_admin" || user?.role === "super_admin";
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [newAlbum, setNewAlbum] = useState({ title: "", description: "" });
  const [uploadData, setUploadData] = useState({ image: null, caption: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await api.get("/gallery/albums/");
      setAlbums(res.data.results || res.data);
    } catch { toast.error("Failed to load albums"); }
    finally { setLoading(false); }
  };

  const fetchAlbum = async (id) => {
    try {
      const res = await api.get(`/gallery/albums/${id}/`);
      setSelectedAlbum(res.data);
    } catch { toast.error("Failed to load album"); }
  };

  const createAlbum = async () => {
    if (!newAlbum.title.trim()) return;
    try {
      await api.post("/gallery/albums/", newAlbum);
      setNewAlbum({ title: "", description: "" });
      setShowCreateModal(false);
      fetchAlbums();
    } catch { toast.error("Failed to create album"); }
  };

  const deleteAlbum = async (id) => {
    if (!window.confirm("এই album মুছে ফেলবেন?")) return;
    try {
      await api.delete(`/gallery/albums/${id}/`);
      setSelectedAlbum(null);
      fetchAlbums();
    } catch { toast.error("Failed to delete album"); }
  };

  const uploadPhoto = async () => {
    if (!uploadData.image) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append("image", uploadData.image);
      form.append("caption", uploadData.caption);
      await api.post(`/gallery/albums/${selectedAlbum.id}/upload-photo/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadData({ image: null, caption: "" });
      setShowUploadModal(false);
      fetchAlbum(selectedAlbum.id);
    } catch { toast.error("Failed to upload photo"); }
    finally { setUploading(false); }
  };

  const deletePhoto = async (photoId) => {
    if (!window.confirm("এই photo মুছে ফেলবেন?")) return;
    try {
      await api.delete(`/gallery/albums/photos/${photoId}/delete/`);
      fetchAlbum(selectedAlbum.id);
    } catch { toast.error("Failed to delete photo"); }
  };

  const openLightbox = (photo, index) => { setLightboxPhoto(photo); setLightboxIndex(index); };

  const navLightbox = (dir) => {
    const photos = selectedAlbum.photos;
    const newIndex = (lightboxIndex + dir + photos.length) % photos.length;
    setLightboxPhoto(photos[newIndex]);
    setLightboxIndex(newIndex);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {selectedAlbum && (
              <button onClick={() => setSelectedAlbum(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                <Images className="w-6 h-6 text-blue-400" />
                {selectedAlbum ? selectedAlbum.title : "স্কুল Gallery"}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {selectedAlbum ? `${selectedAlbum.photos?.length || 0} টি ছবি` : `${albums.length} টি album`}
              </p>
            </div>
          </div>
          {isAdmin && !selectedAlbum && (
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4" /> নতুন Album
            </button>
          )}
          {isAdmin && selectedAlbum && (
            <div className="flex gap-2">
              <button onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium transition">
                <Upload className="w-4 h-4" /> Photo Upload
              </button>
              <button onClick={() => deleteAlbum(selectedAlbum.id)}
                className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl font-medium transition">
                <Trash2 className="w-4 h-4" /> মুছুন
              </button>
            </div>
          )}
        </div>

        {!selectedAlbum && (
          albums.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500">
              <Images className="w-20 h-20 mb-4 opacity-20" />
              <p className="text-lg">কোনো album নেই</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {albums.map(album => (
                <div key={album.id} onClick={() => fetchAlbum(album.id)}
                  className="group cursor-pointer bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
                  <div className="relative h-52 bg-slate-700 overflow-hidden">
                    {album.cover_image ? (
                      <img src={album.cover_image} alt={album.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Image className="w-12 h-12 text-slate-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="text-white font-semibold text-sm">{album.title}</span>
                      <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">{album.photo_count} ছবি</span>
                    </div>
                  </div>
                  {album.description && (
                    <div className="px-4 py-3 bg-slate-800">
                      <p className="text-slate-400 text-xs truncate">{album.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {selectedAlbum && (
          selectedAlbum.photos?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500">
              <Image className="w-20 h-20 mb-4 opacity-20" />
              <p className="text-lg">কোনো ছবি নেই</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
              {selectedAlbum.photos?.map((photo, index) => (
                <div key={photo.id} className="group relative break-inside-avoid rounded-xl overflow-hidden bg-slate-800 cursor-pointer mb-3">
                  <img src={photo.image_url} alt={photo.caption}
                    className="w-full object-cover object-center group-hover:scale-105 transition duration-300"
                    onClick={() => openLightbox(photo, index)} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300 flex items-center justify-center gap-2">
                    <button onClick={() => openLightbox(photo, index)}
                      className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur text-white p-2 rounded-full transition">
                      <Eye className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                        className="opacity-0 group-hover:opacity-100 bg-red-500/80 text-white p-2 rounded-full transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">নতুন Album তৈরি করুন</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <input type="text" placeholder="Album এর নাম *" value={newAlbum.title}
              onChange={e => setNewAlbum({ ...newAlbum, title: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="বিবরণ (optional)" value={newAlbum.description}
              onChange={e => setNewAlbum({ ...newAlbum, description: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition">বাতিল</button>
              <button onClick={createAlbum}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition">তৈরি করুন</button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">Photo Upload করুন</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <label className="block w-full border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition mb-3">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">{uploadData.image ? uploadData.image.name : "Click করে ছবি select করুন"}</p>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => setUploadData({ ...uploadData, image: e.target.files[0] })} />
            </label>
            <input type="text" placeholder="Caption (optional)" value={uploadData.caption}
              onChange={e => setUploadData({ ...uploadData, caption: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowUploadModal(false)}
                className="px-5 py-2.5 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition">বাতিল</button>
              <button onClick={uploadPhoto} disabled={uploading || !uploadData.image}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition disabled:opacity-40">
                {uploading ? "Uploading..." : "Upload করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxPhoto && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50" onClick={() => setLightboxPhoto(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2 z-10" onClick={() => setLightboxPhoto(null)}>
            <X className="w-6 h-6" />
          </button>
          <button className="absolute left-4 text-white text-3xl bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center z-10"
            onClick={e => { e.stopPropagation(); navLightbox(-1); }}>‹</button>
          <button className="absolute right-4 text-white text-3xl bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center z-10"
            onClick={e => { e.stopPropagation(); navLightbox(1); }}>›</button>
          <img src={lightboxPhoto.image_url} alt={lightboxPhoto.caption}
            className="max-w-[85vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()} />
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIndex + 1} / {selectedAlbum?.photos?.length}
          </p>
        </div>
      )}
    </div>
  );
}