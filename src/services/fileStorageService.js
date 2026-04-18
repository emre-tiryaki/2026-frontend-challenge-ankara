const STORAGE_KEY = "investigationFiles";

export const fileStorageService = {
    /**
     * Tüm dosyaları localStorage'dan al
     */
    getAllFiles() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Dosyalar okunurken hata:", error);
            return [];
        }
    },

    /**
     * Belirli bir dosyayı ID'ye göre al
     */
    getFileById(fileId) {
        const files = this.getAllFiles();
        return files.find((f) => f.id === fileId) || null;
    },

    /**
     * Yeni dosya oluştur
     */
    createFile(name) {
        const files = this.getAllFiles();
        const newFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name || "Yeni Dosya",
            createdAt: new Date().toISOString(),
            savedEvidences: [],
            layout: {},
            connections: [],
        };
        files.push(newFile);
        this.saveFiles(files);
        return newFile;
    },

    /**
     * Dosya adını değiştir
     */
    renameFile(fileId, newName) {
        const files = this.getAllFiles();
        const file = files.find((f) => f.id === fileId);
        if (file) {
            file.name = newName;
            this.saveFiles(files);
            return file;
        }
        return null;
    },

    /**
     * Dosyayı sil
     */
    deleteFile(fileId) {
        const files = this.getAllFiles();
        const filtered = files.filter((f) => f.id !== fileId);
        this.saveFiles(filtered);
    },

    /**
     * Dosyaya delil ekle (evidenceId)
     */
    addEvidenceToFile(fileId, eventId, eventType) {
        const files = this.getAllFiles();
        const file = files.find((f) => f.id === fileId);
        if (file) {
            const evidenceKey = `${eventType}-${eventId}`;
            if (!file.savedEvidences.includes(evidenceKey)) {
                file.savedEvidences.push(evidenceKey);
                // Layout ve position verisi ekle
                if (!file.layout[evidenceKey]) {
                    file.layout[evidenceKey] = { x: 100, y: 100 };
                }
            }
            this.saveFiles(files);
            return file;
        }
        return null;
    },

    /**
     * Dosyadan delil çıkar
     */
    removeEvidenceFromFile(fileId, evidenceKey) {
        const files = this.getAllFiles();
        const file = files.find((f) => f.id === fileId);
        if (file) {
            file.savedEvidences = file.savedEvidences.filter(
                (e) => e !== evidenceKey,
            );
            delete file.layout[evidenceKey];
            file.connections = file.connections.filter(
                (conn) =>
                    conn.source !== evidenceKey && conn.target !== evidenceKey,
            );
            this.saveFiles(files);
            return file;
        }
        return null;
    },

    /**
     * Delil pozisyonunu güncelle (canvas üzerinde)
     */
    updateEvidencePosition(fileId, evidenceKey, x, y) {
        const files = this.getAllFiles();
        const file = files.find((f) => f.id === fileId);
        if (file && file.layout) {
            file.layout[evidenceKey] = { x, y };
            this.saveFiles(files);
            return file;
        }
        return null;
    },

    /**
     * Bağlantı (connection/edge) ekle
     */
    addConnection(fileId, source, target, label = "") {
        const files = this.getAllFiles();
        const file = files.find((f) => f.id === fileId);
        if (file) {
            const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newConnection = {
                id: connectionId,
                source,
                target,
                label,
            };
            file.connections.push(newConnection);
            this.saveFiles(files);
            return newConnection;
        }
        return null;
    },

    /**
     * Bağlantı sil
     */
    deleteConnection(fileId, connectionId) {
        const files = this.getAllFiles();
        const file = files.find((f) => f.id === fileId);
        if (file) {
            file.connections = file.connections.filter(
                (c) => c.id !== connectionId,
            );
            this.saveFiles(files);
            return file;
        }
        return null;
    },

    /**
     * Bağlantı labelını güncelle
     */
    updateConnectionLabel(fileId, connectionId, label) {
        const files = this.getAllFiles();
        const file = files.find((f) => f.id === fileId);
        if (file) {
            const connection = file.connections.find(
                (c) => c.id === connectionId,
            );
            if (connection) {
                connection.label = label;
                this.saveFiles(files);
                return connection;
            }
        }
        return null;
    },

    /**
     * Tüm dosyaları localStorage'a kaydet
     */
    saveFiles(files) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
        } catch (error) {
            console.error("Dosyalar kaydedilirken hata:", error);
        }
    },
};
