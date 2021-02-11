<template>
  <div class="hello">
    <div id="nav-bar-login">
      <b-navbar toggleable="lg" type="dark" variant="dark">
        <div class="btn-group">
          <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Templates
          </button>
          <div class="dropdown-menu">
            <a class="dropdown-item" @click.prevent="showTemplate(0)" href="#">Create</a>
            <a class="dropdown-item" @click.prevent="showTemplate(1)" href="#">Read</a>
            <a class="dropdown-item" @click.prevent="showTemplate(2)" href="#">Update</a>
            <a class="dropdown-item" @click.prevent="showTemplate(3)" href="#">Delete</a>
          </div>
        </div>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto" v-if="registered === true">
            <!-- Using 'button-content' slot -->
            <h3><span class="badge badge-dark">Welcome {{ username }}</span></h3>
            <b-nav-item href="#" @click.prevent="logout">Sign out</b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto" v-else>
            <!-- Using 'button-content' slot -->
            <form>
              <input v-model="user" type="text" placeholder="Username" />
              <input v-model="pass" type="password" placeholder="Password" />
            </form>
            <b-nav-item href="#" @click.prevent="login">Sign in</b-nav-item>
            <b-nav-item href="#" @click.prevent="register">Register</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
    <form class="m-3">
      <div class="form-group row">
        <div class="col-6">
          <label for="query">Query</label>
          <textarea v-model="queryText" style="resize: none;" class="form-control" id="query" rows="15"></textarea>
        </div>
        <div class="row align-items-center mx-3">
          <button type="button" class="btn btn-secondary mt-5" @click.prevent="runQuery">Run ►</button>
        </div>
        <div class="col-5">
          <label for="result">Result</label>
          <textarea readonly v-model="resultText" style="resize: none;" class="form-control" id="result" rows="15"></textarea>
        </div>
      </div>
    </form>
      <!--form>
        <div class="form-group">
          <label for="history">History</label>
          <select multiple class="form-control" id="history">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </div>
      </form -->
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
      msg: '',
      queryText: '',
      resultText: '',
      registered: false,
      user: '',
      pass: '',
      username: 'Unknown'
    }
  },
  mounted: function () {
    this.checkAccessToken()
  },
  methods: {
    login () {
      this.$parent.loginUser(this.user, this.pass)
    },
    register () {
      this.$parent.registerUser(this.user, this.pass)
    },
    logout () {
      this.$parent.logoutUser()
    },
    showTemplate (index) {
      this.$parent.showTemplate(index)
    },
    checkAccessToken () {
      var accessToken = localStorage.getItem('accessToken')
      if (accessToken != null) {
        this.getUserRegistered(
          (data) => {
            this.username = data.username
            this.registered = data.registered
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
          console.log(response)
          this.checkAccessToken()
        }, (error) => {
          this.showError(error)
        })
    },
    logoutUser () {
      this.registered = false
      localStorage.setItem('accessToken', null)
      localStorage.setItem('refreshToken', null)
      this.checkAccessToken()
    },
    runQuery () {
      var accessToken = localStorage.getItem('accessToken')
      const postConfig = {
        headers: { Authorization: `Bearer ${accessToken}` }
      }

      const params = new URLSearchParams()
      params.append('query', this.queryText)

      axios
        .post(config.myURLBackend + '/run_query', params, postConfig)
        .then((response) => {
          this.resultText = JSON.stringify(response.data, null, 4)
        }, (error) => {
          this.showError(error)
        })
    },
    showTemplate (index) {
      var templateScript = ''
      switch (index) {
        case 0:
          templateScript = ''
          break
        case 1:
          templateScript = 'db.collection("movies").find( { Title:"Slam" } )'
          break
        case 2:
          templateScript = ''
          break
        case 3:
          templateScript = ''
          break
        default:
          break
      }

      this.queryText = templateScript
    }
  }
}
</script>
