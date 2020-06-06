<template>
  <div id="app">
    <nav-bar/>
    <router-view/>
<!--    <footer-kek/>-->
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
// import FooterKek from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    // FooterKek,
  },
};
</script>

<style scoped lang="scss">
#app {
 height: 100%;
}
</style>
