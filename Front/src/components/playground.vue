<template>
  <div class="hello">
    <navbar></navbar>
    <h1>Prueba de API combinada con front</h1>
    <h2>Registrado: {{ registered }}</h2>
  </div>
</template>

<script>
import axios from 'axios'
import config from '../resources/config'
import navbar from './nav-bar-login.vue'

export default {
  components: {
    navbar
  },
  name: 'playground',
  data () {
    return {
      msg: '',
      registered: ''
    }
  },
  mounted: function () {
    this.checkAccessToken()
  },
  methods: {
    checkAccessToken () {
      var accessToken = localStorage.getItem('accessToken')
      if (accessToken != null) {
        this.getUserRegistered(
          (data) => {
            this.registered = data.registered ? 'yes' : 'no'
            this.showPlayground()
          },
          (error) => {
            console.log(error)
            this.checkRefreshToken()
          })
      } else {
        this.createGenericUser()
      }
    },
    checkRefreshToken () {
      var refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken != null) {
        const params = new URLSearchParams()
        params.append('client_id', config.client_id)
        params.append('client_secret', config.client_secret)
        params.append('grant_type', 'refresh_token')
        params.append('refresh_token', refreshToken)

        axios
          .post(config.OAuth, params)
          .then((response) => {
            localStorage.setItem('accessToken', response.data.accessToken)
            localStorage.setItem('refreshToken', response.data.refreshToken)
            this.checkAccessToken()
          }, (error) => {
            this.createGenericUser()
            console.log(error)
          })
      } else {
        this.createGenericUser()
      }
    },
    getUserRegistered (callback, errorCallback) {
      var accessToken = localStorage.getItem('accessToken')
      const getConfig = {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
      axios
        .get(config.myURLBackend + '/is_registered', getConfig)
        .then((response) => {
          callback(response.data)
        }, (error) => {
          errorCallback(error)
        })
    },
    getQueryHistory (callback, errorCallback) {
      var accessToken = localStorage.getItem('accessToken')
      const getConfig = {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
      axios
        .get(config.myURLBackend + '/query_history', getConfig)
        .then((response) => {
          callback(response.data)
        }, (error) => {
          errorCallback(error)
        })
    },
    createGenericUser () {
      axios
        .post(config.myURLBackend + '/autoregister')
        .then((response) => {
          this.loginUser(response.data.username, response.data.password)
        }, (error) => {
          this.showError(error)
        })
    },
    showError (error) {
      this.$router.push('/error')
      console.log(error)
    },
    showPlayground () {
      // var accessToken = localStorage.getItem('accessToken')
    },
    loginUser (username, password) {
      const params = new URLSearchParams()
      params.append('client_id', config.client_id)
      params.append('client_secret', config.client_secret)
      params.append('grant_type', 'password')
      params.append('username', username)
      params.append('password', password)
      axios
        .post(config.OAuth, params)
        .then((response) => {
          localStorage.setItem('accessToken', response.data.accessToken)
          localStorage.setItem('refreshToken', response.data.refreshToken)
          this.checkAccessToken()
        }, (error) => {
          this.showError(error)
        })
    },
    registerUser (newName, newPassword) {
      var accessToken = localStorage.getItem('accessToken')
      const postConfig = {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
      const params = new URLSearchParams()
      params.append('newName', newName)
      params.append('newPassword', newPassword)
      axios
        .post(config.myURLBackend + '/register', params, postConfig)
        .then((response) => {
          // TODO: Chequear de nuevo si esta registrado
          console.log(response)
        }, (error) => {
          this.showError(error)
        })
    },
    runQuery (queryScript) {
      var accessToken = localStorage.getItem('accessToken')
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
          this.showError(error)
        })
    }
  }
}
</script>
