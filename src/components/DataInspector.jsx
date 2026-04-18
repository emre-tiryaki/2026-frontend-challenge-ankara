import { useState } from 'react';
import { apiService } from '../services/apiService';  // Servisi import ettiğinden emin ol

export default function DataInspector() {
  const [activeData, setActiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('Seçim Bekleniyor...');

  // Genel veri çekme tetikleyicisi
  const handleFetch = async (title, fetchMethod) => {
    setLoading(true);
    setError(null);
    setCurrentView(title);
    
    try {
      const data = await fetchMethod();
      setActiveData(data);
    } catch (err) {
      setError(err.message);
      setActiveData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>🕵️‍♂️ Jotform Veri İnceleme Ekranı</h2>
      <p>Hangi formun verisini görmek istiyorsan tıkla:</p>

      {/* Kontrol Butonları */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => handleFetch('Check-ins', () => apiService.getCheckins())}>
          📍 Check-ins Getir
        </button>
        <button onClick={() => handleFetch('Messages', () => apiService.getMessages())}>
          ✉️ Messages Getir
        </button>
        <button onClick={() => handleFetch('Sightings', () => apiService.getSightings())}>
          👀 Sightings Getir
        </button>
        <button onClick={() => handleFetch('Personal Notes', () => apiService.getPersonalNotes())}>
          📝 Personal Notes Getir
        </button>
        <button onClick={() => handleFetch('Anonymous Tips', () => apiService.getAnonymousTips())}>
          🕵️‍♀️ Anonymous Tips Getir
        </button>
      </div>

      {/* Durum Göstergeleri */}
      {loading && <p>⏳ Veriler Jotform'dan çekiliyor...</p>}
      {error && <p style={{ color: 'red' }}>❌ Hata: {error}</p>}

      {/* JSON Görüntüleyici */}
      {!loading && !error && activeData && (
        <div style={{
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          padding: '20px',
          borderRadius: '8px',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <h3 style={{ color: '#4CAF50', marginTop: 0 }}>Görüntülenen: {currentView}</h3>
          
          <p style={{ color: '#aaa', fontSize: '14px' }}>
            💡 <strong>İpucu:</strong> Gelen her bir objenin içindeki <code>answers</code> kısmına dikkat et.
            Soruların cevapları orada numaralandırılmış ID'ler şeklinde tutulur (Örn: <code>answers["3"].answer</code>).
          </p>

          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(activeData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}