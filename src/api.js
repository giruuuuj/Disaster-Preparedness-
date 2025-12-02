import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;

export const getContacts = async (params = {}) => {
  try {
    const res = await API.get('/contacts', { params });
    return res.data?.data || [];
  } catch (e) {
    throw e;
  }
};

export const createContact = async (payload) => {
  try {
    const res = await API.post('/contacts', payload);
    return res.data?.data || {};
  } catch (e) {
    throw e;
  }
};

export const updateContact = async (id, payload) => {
  try {
    const res = await API.put(`/contacts/${id}`, payload);
    return res.data?.data || {};
  } catch (e) {
    throw e;
  }
};

export const deleteContact = async (id) => {
  try {
    const res = await API.delete(`/contacts/${id}`);
    return res.data?.data || true;
  } catch (e) {
    throw e;
  }
};

export const fetchWeather = async (lat, lon, apiKey) => {
  try {
    const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat,
        lon,
        units: "metric",
        appid: apiKey,
      },
    });
    return res.data;
  } catch (e) {
    const status = e.response?.status;
    if (status === 401) {
      throw new Error("Invalid OpenWeather API key (401)");
    }
    throw new Error(e.response?.data?.message || e.message || "Failed to fetch weather");
  }
};

export const fetchForecast = async (lat, lon, apiKey) => {
  try {
    const res = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
      params: {
        lat,
        lon,
        units: "metric",
        appid: apiKey,
      },
    });
    return res.data;
  } catch (e) {
    const status = e.response?.status;
    if (status === 401) {
      throw new Error("Invalid OpenWeather API key (401)");
    }
    throw new Error(e.response?.data?.message || e.message || "Failed to fetch forecast");
  }
};

export const generateGemini = async (apiKey, prompt, model = "gemini-1.5-flash-latest") => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: String(prompt || '') }]}],
    });
    const candidates = res.data?.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    const text = parts.map(p => p.text || '').join('\n').trim();
    return text || '';
  } catch (e) {
    const status = e.response?.status;
    if (status === 401 || status === 403) {
      throw new Error("Invalid or unauthorized Gemini API key");
    }
    throw new Error(e.response?.data?.error?.message || e.message || "Gemini request failed");
  }
};

export const generateGeminiImage = async (apiKey, prompt, model = "gemini-1.5-flash-latest", mime = "image/png") => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: String(prompt || '') }]}],
      generationConfig: { responseMimeType: 'application/json' },
    });
    const candidates = res.data?.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    const first = parts[0] || {};
    const inline = first.inlineData || (parts.find(p => p.inlineData) || {}).inlineData;
    if (inline && inline.data && inline.mimeType) {
      return { mime: inline.mimeType, data: inline.data };
    }
    const text = parts.map(p => p.text || '').join('\n').trim();
    if (text && text.trim().startsWith('{')) {
      try {
        const design = JSON.parse(text);
        return { mime: 'application/json', design };
      } catch (_) {}
    }
    throw new Error('No image data returned');
  } catch (e) {
    const status = e.response?.status;
    if (status === 401 || status === 403) {
      throw new Error("Invalid or unauthorized Gemini API key");
    }
    throw new Error(e.response?.data?.error?.message || e.message || "Gemini request failed");
  }
};

export const searchGoogleImages = async (apiKey, cx, query, num = 3) => {
  try {
    const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx,
        q: String(query || ''),
        searchType: 'image',
        num: Math.min(Math.max(Number(num) || 3, 1), 10),
        safe: 'active',
      },
    });
    const items = res.data?.items || [];
    return items.map((it) => ({
      url: it.link,
      mime: it.mime || '',
      thumbnail: (it.image && it.image.thumbnailLink) || '',
      context: it.image?.contextLink || it.link,
      title: it.title || '',
    }));
  } catch (e) {
    const status = e.response?.status;
    const emsg = e.response?.data?.error?.message || e.message || '';
    const reason = (e.response?.data?.error?.errors || [])[0]?.reason || '';
    if (status === 401 || status === 403) {
      throw new Error('Invalid or unauthorized Google API key');
    }
    if (status === 400 && /Invalid Value/i.test(emsg) && /cx/i.test(emsg)) {
      throw new Error('Invalid Custom Search Engine ID (cx)');
    }
    if (status === 400 && /Invalid Value/i.test(emsg)) {
      throw new Error('Invalid query or parameters');
    }
    if (status === 429 || /dailyLimitExceeded|userRateLimitExceeded|quotaExceeded/i.test(reason)) {
      throw new Error('Google API quota or rate limit exceeded');
    }
    if (/referrer|restrictions|not authorized/i.test(emsg)) {
      throw new Error('Blocked by Google API key restrictions (referrer/IP)');
    }
    throw new Error(emsg || 'Google Image search failed');
  }
};

export const fetchGoogleAirQuality = async (apiKey, lat, lon, regionCode = 'us') => {
  try {
    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${encodeURIComponent(apiKey)}`;
    const res = await axios.post(url, {
      universalAqi: true,
      location: { latitude: Number(lat), longitude: Number(lon) },
      extraComputations: ['HEALTH_RECOMMENDATIONS'],
      languageCode: 'en',
      regionCode: String(regionCode || 'us'),
    });
    const data = res.data || {};
    return data;
  } catch (e) {
    const status = e.response?.status;
    const emsg = e.response?.data?.error?.message || e.message || '';
    if (status === 401 || status === 403) {
      throw new Error('Invalid or unauthorized Google Maps API key');
    }
    if (/referrer|restrictions|not authorized/i.test(emsg)) {
      throw new Error('Blocked by Google Maps API key restrictions');
    }
    throw new Error(emsg || 'Failed to fetch air quality');
  }
};
