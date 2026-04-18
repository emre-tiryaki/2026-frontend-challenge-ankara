# Jotform Frontend Challenge Project

## User Information
Please fill in your information after forking this repository:

- **Name**: Emre Tiryaki

## Project Description
Bu proje, 18 Nisan 2026 gecesi Ankara'da yaşanan gizemli olayları ve Podo'nun kayboluşunu çözmek için tasarlanmış interaktif bir **"Dedektif Kontrol Paneli (Investigation Dashboard)"** uygulamasıdır. 

Uygulama, Jotform API üzerinden 5 farklı formdan (Check-in'ler, Mesajlar, Görülme Kayıtları, Kişisel Notlar ve İsimsiz İhbarlar) gelen karmaşık verileri asenkron (Promise.all) olarak çeker, normalize eder ve tek bir kronolojik zaman çizelgesinde birleştirir.

**Projenin Öne Çıkan Özellikleri:**
* **Etkileşimli Kanıt Ağı (React Flow):** Kullanıcılar şüpheli buldukları verileri özel dosyalara kaydedebilir (LocalStorage destekli) ve sonsuz bir tuval üzerinde sürükle-bırak yöntemiyle aralarında kırmızı ipler çekerek kendi teorilerini kurgulayabilirler.
* **Çapraz Eşlemeli Dinamik Filtreleme:** Sistemdeki tüm veriler eşzamanlı olarak kişi, olay türü ve zaman aralığı (Range Slider) bazında filtrelenerek anında ekrana yansıtılır.
* **Canlı Harita Entegrasyonu (React-Leaflet):** Seçili olayların koordinatları Ankara haritası üzerinde görselleştirilir ve tıklandığında detayları içeren özel olay pencereleri açılır.
* **Dayanıklı API Mimarisi:** Jotform API limitlerine (429 Too Many Requests) ve yetki hatalarına karşı sistemin çökmesini engelleyen otomatik API Anahtarı Değiştirme (Key Rotation) ve Fallback servisi geliştirilmiştir.

## Getting Started

Projeyi yerel bilgisayarınızda kurmak ve çalıştırmak için aşağıdaki adımları izleyin:

### 1. Bağımlılıkları Yükleyin
Terminal üzerinden proje klasörüne gidin ve gerekli tüm paketleri yüklemek için şu komutu çalıştırın:
```bash
npm install
```

### 2. Çevre Değişkenlerini (.env) Ayarlayın
Jotform API'si ile iletişim kurabilmek için form ID'lerine ve API anahtarlarına ihtiyacınız vardır. Projenin kök dizininde `.env` isimli bir dosya oluşturun (veya `.env.example` dosyasının adını değiştirin) ve içeriğini şu şekilde doldurun:

```env
# Jotform API root
VITE_JOTFORM_BASE_URL=YOUR_BASE_URL

# Form IDs
VITE_CHECKINS=YOUR_CHECKINS_ID
VITE_MESSAGES=YOUR_MESSAGES_ID
VITE_SIGHTINGS=YOUR_SIGHTINGS_ID
VITE_PERSONAL_NOTES=YOUR_PERSONAL_NOTES_ID
VITE_ANONYMOUS_TIPS=YOUR_ANONYMOUS_TIPS_ID

# API Keys
VITE_KEY_1=API_KEY_1
VITE_KEY_2=API_KEY_2
VITE_KEY_3=API_KEY_3
```

### 3. Projeyi Çalıştırın
Gerekli ayarları yaptıktan sonra geliştirme sunucusunu başlatmak için şu komutu kullanın:
```bash
npm run dev
```
Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışmaya başlayacaktır.

## Project Structure
- `src/services/apiService.js`: Rate limit korumalı merkezi API yönetim servisi.
- `src/services/dataParser.js`: Ham form verilerini anlamlı objelere dönüştüren normalizasyon katmanı.
- `src/context/InvestigationContext.jsx`: Dosyalama sistemi ve global filtreleme durum yönetimi.
- `src/components/`: Harita, zaman çizelgesi ve sürükle-bırak tuvali gibi tüm arayüz bileşenleri.

# 🚀 Challenge Duyurusu

## 📅 Tarih ve Saat
Cumartesi günü başlama saatinden itibaren üç saattir.

## 🎯 Challenge Konsepti
Bu challenge'da, size özel hazırlanmış bir senaryo üzerine web uygulaması geliştirmeniz istenecektir. Challenge başlangıcında senaryo detayları paylaşılacaktır.Katılımcılar, verilen GitHub reposunu fork ederek kendi geliştirme ortamlarını oluşturacaklardır.

## 📦 GitHub Reposu
Challenge için kullanılacak repo: https://github.com/cemjotform/2026-frontend-challenge-ankara

## 🛠️ Hazırlık Süreci
1. GitHub reposunu fork edin
2. Tercih ettiğiniz framework ile geliştirme ortamınızı hazırlayın
3. Hazırladığınız setup'ı fork ettiğiniz repoya gönderin

## 💡 Önemli Notlar
- Katılımcılar kendi tercih ettikleri framework'leri kullanabilirler
