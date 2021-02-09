<template>
  <div class="hello">
    <h1>Prueba de API combinada con front</h1>
    <h2>Response: {{ msg }}</h2>
  </div>
</template>

<script>
import axios from 'axios'
import config from '../resources/config'

export default {
  components: {
  },
  name: 'playground',
  data () {
    return {
      msg: ''
    }
  },
  mounted: function () {
    this.getCredentials()
  },
  methods: {
    runQuery (queryScript, accessToken) {
      const postConfig = {
        headers: { Authorization: `Bearer ${accessToken}` }
      }

      const params = new URLSearchParams()
      params.append('query', queryScript)

      axios
        .post(config.myURLBackend + '/run_query', params, postConfig)
        .then((response) => {
          this.msg = response.data
        }, (error) => {
          this.msg = error
        })
    },
    getTokens (data) {
      const params = new URLSearchParams()
      params.append('client_id', config.client_id)
      params.append('client_secret', config.client_secret)
      params.append('grant_type', 'password')
      params.append('username', data.username)
      params.append('password', data.password)

      axios
        .post(config.OAuth, params)
        .then((response) => {
          this.runQuery('db.collection("borrame").find({age:28})', response.data.accessToken)
        }, (error) => {
          this.msg = error
        })
    },
    getCredentials () {
      axios
        .post(config.myURLBackend + '/autoregister')
        .then((response) => {
          this.getTokens(response.data)
        }, (error) => {
          this.msg = error
        })
    }
  }
}
</script>
