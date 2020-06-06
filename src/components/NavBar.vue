<template>
  <nav class="bd-navbar navbar has-shadow is-spaced">
    <div class="container">
      <div class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" href="/">
            <span class="icon has-text-primary">
              <i class="fas fa-home"></i>
            </span>
            <span>
              Главная
            </span>
          </a>
          <a class="navbar-item" href="/query">
            <span class="icon has-text-primary">
              <i class="fas fa-search"></i>
            </span>
            <span>
              Поиск
            </span>
          </a>
          <a class="navbar-item" href="/selection">
            <span class="icon has-text-primary">
              <i class="fas fa-vote-yea"></i>
            </span>
            <span>
              Подбор
            </span>
          </a>
          <a class="navbar-item" href="http://40.118.82.131:8080/companies?name=Привет">
            <span class="icon has-text-primary">
              <i class="fas fa-globe"></i>
            </span>
            <span>
              API
            </span>
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
};
</script>

<style scoped lang="scss">
span {
  margin: 0.1em;
}
</style>
