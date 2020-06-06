<template>
  <main>
    <section class="section">
      <div class="container">
        <h1 class="title">Поиск компании по названию</h1>
        <p class="subtitle is-4">
          Здесь Вы можете найти интересующую Вас компанию
        </p>
      </div>
      <div class="container">
        <div class="dropdown" :class="{ 'is-active': companies.length }">
          <div class="dropdown-trigger">
            <div class="control has-icons-left" :class="{ 'is-loading': loading }">
            <span class="icon is-small is-left">
              <i class="fas fa-search"></i>
            </span>
              <label>
                <input
                  class="input"
                  type="text"
                  placeholder="Введите название компании..."
                  autofocus
                  v-model.trim="query"
                />
              </label>
              <p v-if="error" class="help is-danger">{{ error }}</p>
            </div>
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a class="dropdown-item"
                 v-for="company in companies"
                 :key="company.itn"
                 :href="'/companies/' + company.itn"
              >
                {{ company.name }} ({{ company.size }}), ИНН {{ company.itn }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import api from '../api';

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      query: '',
      error: '',
      loading: false,
      companies: [],
    };
  },
  methods: {
    async loadCompanies(name) {
      this.error = '';

      if (!name) {
        this.companies = [];
        return;
      }

      this.loading = true;

      try {
        this.companies = await api.getCompaniesByName(name, 7);
        this.error = '';
      } catch (e) {
        this.companies = [];
        this.error = 'Не удалось связаться с сервером, попробуйте еще раз';
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    query(name) {
      this.loadCompanies(name);
    },
  },
};
</script>

<style scoped lang="scss">
$query-input-max-width: 512px !default;

.container {
  margin-bottom: 2em;
}

.dropdown,
.dropdown-trigger,
.dropdown-menu,
input {
  width: 100%;
  max-width: $query-input-max-width;
}
</style>
