<template>
  <section class="section">
    <div v-if="error" class="container">
      <h2 class="title">{{ error.title }}</h2>
      <p class="subtitle">{{ error.help }}</p>
    </div>
    <div v-else class="container">
      <div class="columns">
        <div class="column is-4">

          <div class="field">
            <label for="size" class="label">Размер компании</label>
            <div class="control">
              <div class="select">
                <select id="size" v-model="size" about="about" required>
                  <option value="0" disabled hidden>Выберете размер компании</option>
                  <option value="Малое предприятие">Малое предприятие</option>
                  <option value="Микропредприятие">Микропредприятие</option>
                  <option value="Среднее предприятие">Среднее предприятие</option>
                </select>
              </div>
            </div>
          </div>

          <div class="field">
            <label for="region_codes" class="label">Регион</label>
            <div class="control">
              <div class="select is-multiple">
                <select id="region_codes" size="5" v-model="region_codes" multiple>
                  <option v-for="(name, code) in availableRegions" :key="code" :value="code">
                    {{ name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="checkbox">
              <input type="checkbox" v-model="is_acting" />
              Только действующие компании
            </label>
          </div>

          <div class="field">
            <label for="bankruptcy_probability" class="label">
              Допустимая вероятность банкротства в процентах
            </label>
            <div class="control">
              <input
                id="bankruptcy_probability"
                type="number"
                min="0"
                max="100"
                class="input"
                v-model.number="bankruptcy_probability"
              />
            </div>
          </div>

          <div class="field">

            <label class="label">Допустимые риск-факторы</label>
            <div class="control">
              <label>
                <input type="checkbox" v-model="is_liquidating" />
                Находится в стадии ликвидации
              </label>
            </div>

            <div class="control">
              <label>
                <input type="checkbox" v-model="not_reported_last_year" />
                Не было финансового отчета за прошлый год
              </label>
            </div>

            <div class="control">
              <label>
                <input type="checkbox" v-model="not_in_same_registry" />
                Отсутствует в реестре МСП
              </label>
            </div>

            <div class="control">
              <label>
                <input type="checkbox" v-model="ceo_has_other_companies" />
                Существует более 5 компаний с тем же управляющим
              </label>
            </div>

            <div class="control">
              <label>
                <input type="checkbox" v-model="negative_list_risk" />
                Существует риск быть в негативном списке
              </label>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <button class="button is-link" @click="loadCompanies">Найти</button>
            </div>
          </div>

        </div>
        <div class="column is-8">
          <div class="container" v-if="companies.length">
            <p class="title">Найдено {{ companies.length }} компаний</p>
            <table class="table">
              <thead>
              <tr>
                <th><abbr title="ID">#</abbr></th>
                <th>Название</th>
                <th><abbr title="ИНН">ИНН</abbr></th>
                <th><abbr title="Деятельность">Деятельность</abbr></th>
                <th><abbr title="Вероятность банкротства">ВБ</abbr></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(company, i) in companies" :key="company.itn">
                <th>{{ i + 1 }}</th>
                <td><a :href="'/companies/' + company.itn ">{{ company.name }}</a></td>
                <td>{{ company.itn }}</td>
                <td>{{ company.activity_name | trimmed }}</td>
                <td>{{ company.bankruptcy_probability }}%</td>
              </tr>
              </tbody>
            </table>
          </div>
          <div class="container" v-else-if="requested">
            <p class="title">Компании не найдены</p>
            <p class="subtitle">Попробуйте изменить параметры запроса</p>
          </div>
          <div class="container" v-else>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import api from '../api';

export default {
  name: 'SelectionForm',
  data() {
    return {
      availableRegions: {},
      size: 'Малое предприятие',
      region_codes: ['10'],
      is_acting: true,
      bankruptcy_probability: 5,
      is_liquidating: true,
      not_reported_last_year: true,
      not_in_same_registry: true,
      ceo_has_other_companies: true,
      negative_list_risk: true,
      companies: [],
      error: null,
      requested: false,
      limit: 25,
    };
  },
  methods: {
    async loadAvailableRegions() {
      this.error = null;

      try {
        this.availableRegions = await api.getRegions();
      } catch (e) {
        this.availableRegions = {};
        this.error = {
          title: 'Не удалось установить соединение с удаленным сервером',
          help: 'Попробуйте выполнить запрос еще раз',
        };
      }
    },
    async loadCompanies() {
      this.requested = true;
      this.error = null;

      const params = {
        size: this.size,
        region_codes: this.region_codes.join(','),
        is_acting: this.is_acting,
        bankruptcy_probability: this.bankruptcy_probability,
        is_liquidating: this.is_liquidating,
        not_reported_last_year: this.not_reported_last_year,
        not_in_same_registry: this.not_in_same_registry,
        ceo_has_other_companies: this.ceo_has_other_companies,
        negative_list_risk: this.negative_list_risk,
      };

      try {
        const data = await api.getCompaniesByParams(params);

        this.companies = data === null ? [] : data;
      } catch (e) {
        this.companies = [];

        if (!e.response || e.response.status >= 500) {
          this.error = {
            title: 'Не удалось установить соединение с удаленным сервером',
            help: 'Попробуйте выполнить запрос еще раз',
          };
        }
      }
    },
  },
  filters: {
    trimmed(str) {
      const length = 64;

      return str.length > length
        ? `${str.substring(0, length - 3)}...`
        : str;
    },
  },
  mounted() {
    this.loadAvailableRegions();
  },
};
</script>

<style scoped>
input {
  max-width: 128px;
}
</style>
