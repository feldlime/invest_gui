import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Query.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/companies/:id',
    name: 'Company',
    component: () => import('../views/Company.vue'),
  },
  {
    path: '/query',
    name: 'Query',
    component: Home,
  },
  {
    path: '/selection',
    name: 'Selection',
    component: () => import('../views/Selection.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
