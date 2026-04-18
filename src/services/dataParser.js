/**
 * Koordinat stringini ("39.93159,32.84967") enlem ve boylam sayılarına çevirir.
 */
const parseCoordinates = (coordString) => {
  if (!coordString) return { lat: null, lng: null };
  const parts = coordString.split(',');
  if (parts.length === 2) {
    return {
      lat: parseFloat(parts[0].trim()),
      lng: parseFloat(parts[1].trim())
    };
  }
  return { lat: null, lng: null };
};

/**
 * "18-04-2026 19:05" formatındaki stringi JS Date objesine veya sıralanabilir bir formata çevirir.
 * Zaman çizelgesi (Timeline) yaparken çok işimize yarayacak.
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  // Gelen format: DD-MM-YYYY HH:mm
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  
  // YYYY-MM-DDTHH:mm:ss formatında standartlaştırıyoruz
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
};

/**
 * Jotform'un karmaşık "answers" objesini, "name" anahtarlarına göre düz bir objeye çevirir.
 * Örn: answers["2"].name = "personName", answers["2"].answer = "Podo" ise => { personName: "Podo" }
 */
const flattenAnswers = (answers) => {
  const flatData = {};
  for (const key in answers) {
    const item = answers[key];
    if (item.name && item.answer !== undefined) {
      flatData[item.name] = item.answer;
    }
  }
  return flatData;
};

// --- FORM BAZLI PARSER FONKSİYONLARI ---

export const parseCheckins = (rawData) => {
  return rawData.map(item => {
    const flat = flattenAnswers(item.answers);
    const coords = parseCoordinates(flat.coordinates);
    return {
      id: item.id,
      type: 'checkin',
      timestampString: flat.timestamp,
      dateObj: parseDate(flat.timestamp),
      location: flat.location,
      lat: coords.lat,
      lng: coords.lng,
      person: flat.personName,
      note: flat.note,
      // Orijinal veriyi saklamak her zaman iyidir
      _raw: item 
    };
  });
};

export const parseMessages = (rawData) => {
  return rawData.map(item => {
    const flat = flattenAnswers(item.answers);
    const coords = parseCoordinates(flat.coordinates);
    return {
      id: item.id,
      type: 'message',
      timestampString: flat.timestamp,
      dateObj: parseDate(flat.timestamp),
      location: flat.location,
      lat: coords.lat,
      lng: coords.lng,
      sender: flat.senderName,
      recipient: flat.recipientName,
      text: flat.text,
      urgency: flat.urgency,
      _raw: item
    };
  });
};

export const parseSightings = (rawData) => {
  return rawData.map(item => {
    const flat = flattenAnswers(item.answers);
    const coords = parseCoordinates(flat.coordinates);
    return {
      id: item.id,
      type: 'sighting',
      timestampString: flat.timestamp,
      dateObj: parseDate(flat.timestamp),
      location: flat.location,
      lat: coords.lat,
      lng: coords.lng,
      person: flat.personName,
      seenWith: flat.seenWith,
      note: flat.note,
      _raw: item
    };
  });
};

export const parsePersonalNotes = (rawData) => {
  return rawData.map(item => {
    const flat = flattenAnswers(item.answers);
    const coords = parseCoordinates(flat.coordinates);
    return {
      id: item.id,
      type: 'note',
      timestampString: flat.timestamp,
      dateObj: parseDate(flat.timestamp),
      location: flat.location,
      lat: coords.lat,
      lng: coords.lng,
      author: flat.authorName,
      mentionedPeople: flat.mentionedPeople ? flat.mentionedPeople.split(',').map(p => p.trim()) : [],
      note: flat.note,
      _raw: item
    };
  });
};

export const parseAnonymousTips = (rawData) => {
  return rawData.map(item => {
    const flat = flattenAnswers(item.answers);
    const coords = parseCoordinates(flat.coordinates);
    return {
      id: item.id,
      type: 'tip',
      timestampString: flat.timestamp,
      dateObj: parseDate(flat.timestamp),
      location: flat.location,
      lat: coords.lat,
      lng: coords.lng,
      suspect: flat.suspectName,
      tipText: flat.tip,
      confidence: flat.confidence,
      _raw: item
    };
  });
};

/**
 * Ttüm verileri tek bir potada (array) birleştirir ve zamana göre kronolojik olarak sıralar.
 * Bu fonksiyon Dashboard'un ana besleyicisi olacak.
 */
export const combineAndSortAllData = ({ checkins, messages, sightings, notes, tips }) => {
  // Tüm parse edilmiş verileri tek bir dizide birleştir
  const allData = [
    ...parseCheckins(checkins || []),
    ...parseMessages(messages || []),
    ...parseSightings(sightings || []),
    ...parsePersonalNotes(notes || []),
    ...parseAnonymousTips(tips || [])
  ];

  // null olan veya eksik tarihli olanları filtrele (güvenlik için)
  const validData = allData.filter(item => item.dateObj !== null);

  // Tarihe (dateObj) göre eskiden yeniye (kronolojik) sırala
  validData.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return validData;
};