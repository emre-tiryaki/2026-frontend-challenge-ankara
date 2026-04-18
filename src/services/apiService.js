// src/apiService.js
import { config } from "../config/env";

class JotformService {
    constructor() {
        this.keys = config.apiKeys;
        this.currentKeyIndex = 0;
        this.baseUrl = config.baseUrl;
    }

    // Aktif API anahtarını döndürür
    getCurrentKey() {
        return this.keys[this.currentKeyIndex];
    }

    // 429 hatası alındığında bir sonraki key'e geçiş yapar
    rotateKey() {
        this.currentKeyIndex++;

        // Eğer tüm key'ler denendiyse ve bittiyse
        if (this.currentKeyIndex >= this.keys.length) {
            this.currentKeyIndex = 0; // İsteğe bağlı: Başa sarabilirsin
            console.error(
                "Kritik Hata: Tüm API anahtarlarının günlük limiti doldu!",
            );
            throw new Error(
                "Sistem geçici olarak kullanılamıyor (API Limit Aşıldı). Lütfen daha sonra tekrar deneyin.",
            );
        }

        console.warn(
            `⚠️ API Limitine takıldı (429). Yeni anahtara geçiliyor... (Aktif Key İndeksi: ${this.currentKeyIndex})`,
        );
    }

    // Merkezi İstek (Fetch) Fonksiyonu
    async request(endpoint, options = {}, retriesLeft = this.keys.length) {
        if (retriesLeft === 0) {
            throw new Error(
                "Tüm API anahtarları ile deneme yapıldı ancak veri çekilemedi.",
            );
        }

        const activeKey = this.getCurrentKey();

        // API Key'i Header yerine URL parametresi olarak ekliyoruz.
        // Eğer endpoint'te zaten bir '?' varsa '&' ile, yoksa '?' ile ekliyoruz.
        const separator = endpoint.includes("?") ? "&" : "?";
        const url = `${this.baseUrl}${endpoint}${separator}apiKey=${activeKey}`;

        try {
            // Artık headers içine APIKEY koymamıza gerek yok
            const response = await fetch(url, options);

            // ... Kodun geri kalanı aynı kalacak (429/401 kontrolleri vs.)
            if (response.status === 429 || response.status === 401) {
                this.rotateKey();
                return this.request(endpoint, options, retriesLeft - 1);
            }

            if (!response.ok) {
                throw new Error(
                    `API İstek Hatası: ${response.status} ${response.statusText}`,
                );
            }

            const responseData = await response.json();

            if (responseData.responseCode === 200) {
                return responseData.content;
            } else {
                throw new Error(
                    responseData.message || "Bilinmeyen bir API hatası oluştu.",
                );
            }
        } catch (error) {
            console.error(`Fetch işlemi başarısız [${endpoint}]:`, error);
            throw error;
        }
    }

    // --- FORM BAZLI VERİ ÇEKME METOTLARI --- //

    // Genel submission çekici
    async getFormSubmissions(formId) {
        return this.request(`/form/${formId}/submissions`);
    }

    async getCheckins() {
        return this.getFormSubmissions(config.formIds.checkins);
    }

    async getMessages() {
        return this.getFormSubmissions(config.formIds.messages);
    }

    async getSightings() {
        return this.getFormSubmissions(config.formIds.sightings);
    }

    async getPersonalNotes() {
        return this.getFormSubmissions(config.formIds.personalNotes);
    }

    async getAnonymousTips() {
        return this.getFormSubmissions(config.formIds.anonymousTips);
    }
}

// Servisi singleton olarak dışa aktarıyoruz, böylece state (currentKeyIndex) uygulama genelinde korunur
export const apiService = new JotformService();
