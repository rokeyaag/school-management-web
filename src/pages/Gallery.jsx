import { useState, useEffect } from "react";
import { Images, Plus, Trash2, Upload, X, ArrowLeft, Image } from "lucide-react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function Gallery() {
  const { user } = useAuth();
  const isAdmin = user?.role === "school_admin" || user?.role === "super_admin";

  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [newAlbum, setNewAlbum] = useState({ title: "", description: "" });
  const [uploadData, setUploadData] = useState({ image: null, caption: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAlbums(); }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await api.get("/gallery/albums/");
      setAlbums(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbum = async (id) => {
    try {
      const res = await api.get(`/gallery/albums/${id}/`);
      setSelectedAlbum(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const createAlbum = async () => {
    if (!newAlbum.title.trim()) return;
    try {
      await api.post("/gallery/albums/", newAlbum);
      setNewAlbum({ title: "", description: "" });
      setShowCreateModal(false);
      fetchAlbums();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAlbum = async (id) => {
    if (!confirm("এই album মুছে ফেলবেন?")) return;
    try {
      await api.delete(`/gallery/albums/${id}/`);
      setSelectedAlbum(null);
      fetchAlbums();
    } catch (e) {
      console.error(e);
    }
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
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId) => {
    if (!confirm("এই photo মুছে ফেলবেন?")) return;
    try {
      await api.delete(`/gallery/albums/photos/${photoId}/delete/`);
      fetchAlbum(selectedAlbum.id);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {selectedAlbum && (
            <button onClick={() => setSelectedAlbum(null)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Images className="w-7 h-7 text-blue-600" />
              {selectedAlbum ? selectedAlbum.title : "Gallery"}
            </h1>
            <p className="text-sm text-gray-500">
              {selectedAlbum ? `${selectedAlbum.photos?.length || 0} টি ছবি` : `${albums.length} টি album`}
            </p>
          </div>
        </div>
        {isAdmin && !selectedAlbum && (
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" /> নতুন Album
          </button>
        )}
        {isAdmin && selectedAlbum && (
          <div className="flex gap-2">
            <button onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Upload className="w-4 h-4" /> Photo Upload
            </button>
            <button onClick={() => deleteAlbum(selectedAlbum.id)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              <Trash2 className="w-4 h-4" /> Album মুছুন
            </button>
          </div>
        )}
      </div>

      {/* Album Grid */}
      {!selectedAlbum && (
        albums.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Images className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>কোনো album নেই</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {albums.map(album => (
              <div key={album.id} onClick={() => fetchAlbum(album.id)}
                className="bg-white rounded-xl shadow hover:shadow-md cursor-pointer overflow-hidden transition group">
                <div className="h-44 bg-gray-100 overflow-hidden relative">
                  {album.cover_image ? (
                    <img src={album.cover_image} alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <Image className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {album.photo_count} টি ছবি
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 truncate">{album.title}</h3>
                  {album.description && <p className="text-xs text-gray-500 truncate">{album.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Photo Grid */}
      {selectedAlbum && (
        selectedAlbum.photos?.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Image className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>এই album এ কোনো ছবি নেই</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
            {selectedAlbum.photos?.map(photo => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden shadow bg-slate-700 aspect-square">
                <img src={photo.image_url} alt={photo.caption}
                  className="w-full h-full object-cover object-center cursor-pointer group-hover:scale-105 transition duration-300"
                  onClick={() => setLightboxPhoto(photo)} />
                {isAdmin && (
                  <button onClick={() => deletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">নতুন Album তৈরি করুন</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <input type="text" placeholder="Album এর নাম *" value={newAlbum.title}
              onChange={e => setNewAlbum({ ...newAlbum, title: e.target.value })}
              className="w-full border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" />
            <textarea placeholder="বিবরণ (optional)" value={newAlbum.description}
              onChange={e => setNewAlbum({ ...newAlbum, description: e.target.value })}
              className="w-full border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-400" rows={3} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">বাতিল</button>
              <button onClick={createAlbum}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">তৈরি করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Photo Upload করুন</h2>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <input type="file" accept="image/*"
              onChange={e => setUploadData({ ...uploadData, image: e.target.files[0] })}
              className="w-full border rounded-lg px-3 py-2 mb-3" />
            <input type="text" placeholder="Caption (optional)" value={uploadData.caption}
              onChange={e => setUploadData({ ...uploadData, caption: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700">বাতিল</button>
              <button onClick={uploadPhoto} disabled={uploading || !uploadData.image}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setLightboxPhoto(null)}>
          <button className="absolute top-4 right-4 text-white"><X className="w-8 h-8" /></button>
          <img src={lightboxPhoto.image_url} alt={lightboxPhoto.caption}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
          {lightboxPhoto.caption && (
            <p className="absolute bottom-6 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {lightboxPhoto.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}