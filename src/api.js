import axios from 'axios';

class Api {
  constructor(config) {
    this.http = axios.create(config);
  }

  async getCompanyByID(identifier) {
    const url = `/companies/${identifier}`;

    try {
      return await this.fetch(url);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        return {};
      }

      throw e;
    }
  }

  async getCompaniesByName(name, limit = 5) {
    const url = '/companies/query';

    const config = {
      params: {
        name,
        limit,
      },
    };

    return this.fetch(url, config);
  }

  async getRegions() {
    return this.fetch('/regions');
  }

  async getCompaniesByParams(params) {
    const url = '/companies/selection';

    const config = {
      params,
    };

    return this.fetch(url, config);
  }

  async fetch(url, config) {
    const r = await this.http.get(url, config);

    return r.data.data;
  }
}

const config = {
  baseURL: process.env.API_URL || 'http://127.0.0.1:8080',
  timeout: process.env.API_TIMEOUT || 1000,
};

const api = new Api(config);

export default api;
