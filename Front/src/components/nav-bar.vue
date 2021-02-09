<template>
  <div id="nav-bar">
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="#" @click.prevent="playground">
            Playground
          </b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <!-- Using 'button-content' slot -->
          <b-nav-item href="#" @click.prevent="login">Log-in</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: "nav-bar",
  methods: {
    playground() {
      this.$router.push("/");
    },
    login() {
      this.$router.push("/login");
    },
  },
};
</script>
