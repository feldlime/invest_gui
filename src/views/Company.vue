<template>
  <main>
    <div v-if="error">
      <section class="section">
        <div class="container">
          <h1 class="title">{{ error.title }}</h1>
          <p class="subtitle is-4">{{ error.help }}</p>
        </div>
      </section>
    </div>
    <div v-else>
      <section class="section">
        <div class="container">
          <h1 class="title">{{ company.name }}</h1>
          <p class="subtitle is-4">{{ company.size }}, {{ company.region_name }}</p>
          <div class="columns">
            <div class="column">
              <h2 class="title is-3">Информация о компании</h2>
              <p class="subtitle is-5">
                ИНН {{ company.itn }}, ОГРН {{ company.psrn }}
              </p>
              <p class="is-5">
                Дата регистрации: {{ company.registered_at }}
              </p>
              <p class="is-5">
                Уставный капитал: {{ company.charter_capital }} руб.
              </p>
              <p class="is-5" v-if="company.activity_code">
                ОКВЭД: {{ company.activity_code }} {{ company.activity_name }}
              </p>
              <span class="icon"></span>
              <h2 class="title is-4 has-text-danger" v-if="!company.is_acting">
                Компания прекратила свое существование
              </h2>
            </div>
            <div class="column">
              <div v-if="company.is_acting">
                <h2 class="title is-3">Индикаторы риска</h2>
                <div v-if="hasRisks" class="content">
                  <ol>
                    <li v-for="risk in Object.keys(risks)" :key="risk">{{ risk }}</li>
                  </ol>
                </div>
                <p v-else class="subtitle is-5">
                <span class="icon has-text-success">
                  <i class="fas fa-check"></i>
                </span>
                  Риск-факторы не обнаружены
                </p>
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <div v-if="company.is_acting">
                <h2 class="title is-3">Банкротство</h2>
                <p v-if="company.bankruptcy_probability !== null" class="subtitle is-5">
                  Вероятность банкротства:
                  <span :class="[ company.bankruptcy_probability < 30
                    ? 'has-text-success'
                    : 'has-text-danger',
                    'has-text-weight-bold',
                    'is-1',
                ]">
                  {{ company.bankruptcy_probability }}%
                </span>
                </p>
                <p v-else class="subtitle is-5">
                <span class="icon has-text-danger">
                  <i class="fas fa-times"></i>
                </span>
                  Нет данных по банкротству
                </p>
                <div v-if="bankruptcyReasons.length" class="content">
                  <p class="subtitle is-5">Основное влияние на показатель оказали:</p>
                  <ol>
                    <li v-for="(obj, idx) in bankruptcyReasons" :key="idx">
                      {{ obj.reason }}: {{ obj.value }}
                    </li>
                  </ol>
                </div>
                <h1 v-if="company.relative_success" class="title is-4">
                  Успешность относительно похожих компаний
                </h1>
              </div>
              <div id="success-graph"></div>
            </div>
            <div class="column">
              <div v-if="company.is_acting">
                <h2 class="title is-3">Финансы</h2>
                <div v-if="company.is_enough_finance_data">
                  <p class="is-5">
                    Прогноз выручки за текущий год:
                    {{ company.revenue_forecast | thousands }} тыс. руб.
                  </p>
                  <p class="is-5">
                    Оценка текущих активов:
                    {{ company.assets_forecast | thousands }} тыс. руб.
                  </p>
                  <p class="is-5">
                    Стадия развития компании:
                    {{ company.dev_stage }}
                  </p>
                </div>
                <p v-else class="subtitle is-5">
                <span class="icon has-text-danger">
                  <i class="fas fa-times"></i>
                </span>
                  Нет данных по финансам
                </p>
              </div>
              <div id="finance-graph"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import { abs, pow } from 'mathjs';
import Plotly from 'plotly.js/lib';
import api from '../api';

export default {
  name: 'Company',
  data() {
    return {
      loading: false,
      error: null,
      company: {},
    };
  },
  computed: {
    risks() {
      return {
        'Находится в стадии ликвидации': this.company.is_liquidating,
        'Не было финансового отчета за прошлый год': this.company.no_finance_report_last_year,
        'Отсутствует в реестре МСП': this.company.not_in_same_registry,
        'Существует более 5 компаний с тем же управляющим': this.company.ceo_has_other_companies,
        'Существует риск быть в негативном списке': this.company.negative_list_risk,
      };
    },
    hasRisks() {
      return Object.values(this.risks).some((r) => r === true);
    },
    hasBankruptcyVars() {
      if (this.company.bankruptcy_vars) {
        return Object.keys(this.company.bankruptcy_vars).length > 0;
      }

      return false;
    },
    bankruptcyReasons() {
      if (!this.hasBankruptcyVars) {
        return [];
      }

      const vars = JSON.parse(JSON.parse(this.company.bankruptcy_vars));

      const tmp = [];
      Object.entries(vars).forEach(([reason, { value, effect }]) => {
        tmp.push({
          effect,
          reason,
          value,
        });
      });

      return tmp.sort((a, b) => {
        const effectA = abs(a.effect);
        const effectB = abs(b.effect);

        if (effectA > effectB) {
          return -1;
        }

        if (effectA < effectB) {
          return 1;
        }

        return 0;
      }).slice(0, 5);
    },
  },
  filters: {
    thousands(value) {
      return Number(value).toFixed(0);
    },
  },
  watch: {
    company(value) {
      if (value.is_enough_finance_data) {
        if (value.dev_stage_coordinates) {
          this.drawFinanceActivityGraph();
        }
        if (value.relative_success) {
          this.drawRelativeSuccessGraph();
        }
      }
    },
  },
  methods: {
    async loadCurrentCompany() {
      this.error = null;
      this.loading = true;

      try {
        this.company = await api.getCompanyByID(this.$route.params.id);

        if (Object.keys(this.company).length === 0) {
          this.error = {
            title: 'Компания не найдена',
            help: 'Попробуйте изменить параметры поиска',
          };
        }
      } catch (e) {
        this.company = {};

        this.error = {
          title: 'Не удалось подключиться к серверу',
          help: 'Попробуйте перезагрузить страницу',
        };
      } finally {
        this.loading = false;
      }
    },
    drawFinanceActivityGraph() {
      const coordinates = JSON.parse(this.company.dev_stage_coordinates);
      const x = [
        -1,
        -1,
        -1,
        -0,
        -0,
        -0,
        +1,
        +1,
        +1,
        +2,
        +2,
        +2,
      ];
      const y = [
        -1,
        -0,
        +1,
        -1,
        -0,
        +1,
        -1,
        -0,
        +1,
        -1,
        -0,
        +1,
      ];
      const w = [
        0.1651,
        0.1175,
        0.0051,
        0.1156,
        0.2619,
        0.0103,
        0.0407,
        0.2242,
        0.0446,
        0.0008,
        0.0046,
        0.0098,
      ];

      const size = w.map((s) => pow(s, 1 / 3) * 100);
      const text = w.map((s) => `${(s * 100).toFixed(2)}%`);

      const opacity = [];
      for (let i = 0; i < 12; i += 1) {
        if (x[i] === coordinates.a && y[i] === coordinates.r) {
          opacity.push(1);
        } else {
          opacity.push(0.2);
        }
      }

      const data = [
        {
          x,
          y,
          mode: 'markers+text',
          text,
          hoverinfo: 'skip',
          marker: {
            size,
            opacity,
            color: 'black',
          },
        },
      ];

      const layout = {
        showlegend: false,
        height: 450,
        width: 600,
        xaxis: {
          tickvals: [-1, 0, 1, 2],
          ticktext: ['Убыль', 'Постоянство', 'Рост', 'Сильный рост'],
          zeroline: false,
          showline: false,
          title: 'Динамика активов',
          automargin: true,
        },
        yaxis: {
          tickvals: [-1, 0, 1],
          ticktext: ['Убыль', 'Постоянство', 'Рост'],
          zeroline: false,
          showline: false,
          title: 'Динамика выручки',
          automargin: true,
        },
        margin: { t: 16, b: 16 },
      };

      Plotly.newPlot('finance-graph', data, layout);
    },
    drawRelativeSuccessGraph() {
      const data = [
        {
          domain: { x: [0, 1], y: [0, 1] },
          value: this.company.relative_success,
          type: 'indicator',
          mode: 'gauge+number',
          gauge: {
            axis: {
              range: [-9, 9],
            },
            bar: {
              color: 'lightgrey',
            },
          },
        },
      ];

      const layout = { width: 500, height: 250, margin: { t: 16, b: 16 } };

      Plotly.newPlot('success-graph', data, layout);
    },
  },
  mounted() {
    this.loadCurrentCompany();
  },
};
</script>
