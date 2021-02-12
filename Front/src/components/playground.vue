<template>
    <div id="playground">
        <!-- Button trigger modal -->

        <!-- Modal -->
        <div
            class="modal fade"
            id="errorModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="errorModalLabel"
            aria-hidden="true"
        >
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="errorModalLabel">
                            {{ errorTitle }}
                        </h5>
                        <button
                            type="button"
                            class="close"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">{{ errorBody }}</div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-dismiss="modal"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="nav-bar-login">
            <b-navbar toggleable="lg" type="dark" variant="dark">
                <div class="btn-group">
                    <button
                        type="button"
                        class="btn btn-secondary dropdown-toggle"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        Templates
                    </button>
                    <button
                        type="button"
                        class="btn btn-secondary ml-5"
                        @click.prevent="showError(0)"
                        v-if="false"
                    >
                        Error
                    </button>
                    <div class="dropdown-menu">
                        <a
                            class="dropdown-item"
                            @click.prevent="showTemplate(0)"
                            href="#"
                        >
                            Create
                        </a>
                        <a
                            class="dropdown-item"
                            @click.prevent="showTemplate(1)"
                            href="#"
                        >
                            Read
                        </a>
                        <a
                            class="dropdown-item"
                            @click.prevent="showTemplate(2)"
                            href="#"
                        >
                            Update
                        </a>
                        <a
                            class="dropdown-item"
                            @click.prevent="showTemplate(3)"
                            href="#"
                        >
                            Delete
                        </a>
                    </div>
                </div>
                <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

                <b-collapse id="nav-collapse" is-nav>
                    <!-- Right aligned nav items -->
                    <b-navbar-nav class="ml-auto" v-if="registered === true">
                        <!-- Using 'button-content' slot -->
                        <h3>
                            <span class="badge badge-dark">
                                Welcome {{ username }}
                            </span>
                        </h3>
                        <b-nav-item href="#" @click.prevent="logout">
                            Sign out
                        </b-nav-item>
                    </b-navbar-nav>
                    <b-navbar-nav class="ml-auto" v-else>
                        <!-- Using 'button-content' slot -->
                        <form>
                            <input
                                v-model="user"
                                type="text"
                                placeholder="Username"
                            />
                            <input
                                v-model="pass"
                                type="password"
                                placeholder="Password"
                            />
                        </form>
                        <b-nav-item href="#" @click.prevent="login">
                            Sign in
                        </b-nav-item>
                        <b-nav-item href="#" @click.prevent="register">
                            Register
                        </b-nav-item>
                    </b-navbar-nav>
                </b-collapse>
            </b-navbar>
        </div>
        <form class="m-3">
            <div class="form-group row">
                <div class="col-6">
                    <label for="query"> Query </label>
                    <textarea
                        v-model="queryText"
                        style="resize: none"
                        class="form-control"
                        id="query"
                        rows="15"
                    ></textarea>
                </div>
                <div class="row align-items-center mx-3">
                    <button
                        type="button"
                        class="btn btn-secondary mt-5"
                        @click.prevent="runQuery"
                    >
                        Run ►
                    </button>
                </div>
                <div class="col-5">
                    <label for="result"> Result </label>
                    <textarea
                        readonly
                        v-model="resultText"
                        style="resize: none"
                        class="form-control"
                        id="result"
                        rows="15"
                    ></textarea>
                </div>
            </div>
        </form>
        <div class="container">
            <button
                type="button"
                class="btn btn-success"
                @click.prevent="downloadHistory"
            >
                Download History
            </button>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import config from "../resources/config";
import $ from "jquery";

export default {
    components: {},
    name: "playground",
    data() {
        return {
            msg: "",
            queryText: "",
            resultText: "",
            registered: false,
            user: "",
            pass: "",
            username: "Unknown",
            errorTitle: "Unknown Title",
            errorBody: "Unknown Body",
        };
    },
    mounted: function () {
        this.checkAccessToken();
    },
    methods: {
        downloadHistory() {
            this.getQueryHistory(
                (history) => {
                    var dataStr =
                        "data:text/json;charset=utf-8," +
                        encodeURIComponent(JSON.stringify(history, null, 4));
                    var downloadAnchorNode = document.createElement("a");
                    downloadAnchorNode.setAttribute("href", dataStr);
                    downloadAnchorNode.setAttribute(
                        "download",
                        "history.json"
                    );
                    document.body.appendChild(downloadAnchorNode); // required for firefox
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                },
                (err) => {
                    this.showError(err);
                }
            );
        },
        login() {
            this.loginUser(this.user, this.pass);
        },
        register() {
            this.registerUser(this.user, this.pass);
        },
        logout() {
            this.logoutUser();
        },
        checkAccessToken() {
            var accessToken = localStorage.getItem("accessToken");
            if (accessToken != null) {
                this.getUserRegistered(
                    (data) => {
                        this.username = data.username;
                        this.registered = data.registered;
                        this.showPlayground();
                    },
                    (error) => {
                        console.log(error);
                        this.checkRefreshToken();
                    }
                );
            } else {
                this.createGenericUser();
            }
        },
        checkRefreshToken() {
            var refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken != null) {
                const params = new URLSearchParams();
                params.append("client_id", config.client_id);
                params.append("client_secret", config.client_secret);
                params.append("grant_type", "refresh_token");
                params.append("refresh_token", refreshToken);

                axios.post(config.OAuth, params).then(
                    (response) => {
                        localStorage.setItem(
                            "accessToken",
                            response.data.accessToken
                        );
                        localStorage.setItem(
                            "refreshToken",
                            response.data.refreshToken
                        );
                        this.checkAccessToken();
                    },
                    (error) => {
                        this.createGenericUser();
                        console.log(error);
                    }
                );
            } else {
                this.createGenericUser();
            }
        },
        getUserRegistered(callback, errorCallback) {
            var accessToken = localStorage.getItem("accessToken");
            const getConfig = {
                headers: { Authorization: `Bearer ${accessToken}` },
            };
            axios.get(config.myURLBackend + "/is_registered", getConfig).then(
                (response) => {
                    callback(response.data);
                },
                (error) => {
                    errorCallback(error);
                }
            );
        },
        getQueryHistory(callback, errorCallback) {
            var accessToken = localStorage.getItem("accessToken");
            const getConfig = {
                headers: { Authorization: `Bearer ${accessToken}` },
            };
            axios.get(config.myURLBackend + "/query_history", getConfig).then(
                (response) => {
                    callback(response.data);
                },
                (error) => {
                    errorCallback(error);
                }
            );
        },
        createGenericUser() {
            axios.post(config.myURLBackend + "/autoregister").then(
                (response) => {
                    this.loginUser(
                        response.data.username,
                        response.data.password
                    );
                },
                (error) => {
                    this.showError(error);
                }
            );
        },
        showError(error) {
            var errorName;
            switch (error.response.status) {
                case 400:
                    errorName = "400: Bad Request";
                    break;
                case 401:
                    errorName = "401: Unauthorized";
                    break;
                case 403:
                    errorName = "403: Forbidden";
                    break;
                case 404:
                    errorName = "404: Not Found";
                    break;
                case 410:
                    errorName = "410: Gone";
                    break;
                case 429:
                    errorName = "429: Too Many Requests";
                    break;
                case 500:
                    errorName = "500: Internal Server Error";
                    break;
                case 503:
                    errorName = "503: Service Unavailable";
                    break;
                default:
                    errorName = "Not known";
                    break;
            }

            this.errorTitle = errorName;
            this.errorBody = error.response.data;

            $("#errorModal").modal("show");

            console.log(error);
        },
        showPlayground() {
            // var accessToken = localStorage.getItem('accessToken')
        },
        loginUser(username, password) {
            const params = new URLSearchParams();
            params.append("client_id", config.client_id);
            params.append("client_secret", config.client_secret);
            params.append("grant_type", "password");
            params.append("username", username);
            params.append("password", password);
            axios.post(config.OAuth, params).then(
                (response) => {
                    localStorage.setItem(
                        "accessToken",
                        response.data.accessToken
                    );
                    localStorage.setItem(
                        "refreshToken",
                        response.data.refreshToken
                    );
                    this.checkAccessToken();
                },
                (error) => {
                    this.showError(error);
                }
            );
        },
        registerUser(newName, newPassword) {
            var accessToken = localStorage.getItem("accessToken");
            const postConfig = {
                headers: { Authorization: `Bearer ${accessToken}` },
            };
            const params = new URLSearchParams();
            params.append("newName", newName);
            params.append("newPassword", newPassword);
            axios
                .post(config.myURLBackend + "/register", params, postConfig)
                .then(
                    (response) => {
                        console.log(response);
                        this.checkAccessToken();
                    },
                    (error) => {
                        this.showError(error);
                    }
                );
        },
        logoutUser() {
            this.registered = false;
            localStorage.setItem("accessToken", null);
            localStorage.setItem("refreshToken", null);
            this.checkAccessToken();
        },
        runQuery() {
            var accessToken = localStorage.getItem("accessToken");
            const postConfig = {
                headers: { Authorization: `Bearer ${accessToken}` },
            };

            const params = new URLSearchParams();
            params.append("query", this.queryText);

            axios
                .post(config.myURLBackend + "/run_query", params, postConfig)
                .then(
                    (response) => {
                        this.resultText = JSON.stringify(
                            response.data,
                            null,
                            4
                        );
                    },
                    (error) => {
                        this.showError(error);
                    }
                );
        },
        showTemplate(index) {
            var templateScript = "";
            switch (index) {
                case 0:
                    // Create
                    templateScript =
                        'db.collection("movies").insertMany([' +
                        "\n{" +
                        '\n   "Title": "Simply Irresistible",' +
                        '\n   "US Gross": 4398989,' +
                        '\n   "Worldwide Gross": 4398989,' +
                        '\n   "US DVD Sales": null,' +
                        '\n   "Production Budget": 6000000,' +
                        '\n   "Release Date": "Feb 05 1999",' +
                        '\n   "MPAA Rating": "PG-13",' +
                        '\n   "Running Time min": null,' +
                        '\n   "Distributor": "20th Century Fox",' +
                        '\n   "Source": "Original Screenplay",' +
                        '\n   "Major Genre": "Romantic Comedy",' +
                        '\n   "Creative Type": "Contemporary Fiction",' +
                        '\n   "Director": null,' +
                        '\n   "Rotten Tomatoes Rating": 14,' +
                        '\n   "IMDB Rating": 4.8,' +
                        '\n   "IMDB Votes": 6927' +
                        "\n}," +
                        "\n{" +
                        '\n    "Title": "Summer Catch",' +
                        '\n    "US Gross": 19693891,' +
                        '\n    "Worldwide Gross": 19693891,' +
                        '\n    "US DVD Sales": null,' +
                        '\n    "Production Budget": 17000000,' +
                        '\n    "Release Date": "Aug 24 2001",' +
                        '\n    "MPAA Rating": "PG-13",' +
                        '\n    "Running Time min": null,' +
                        '\n    "Distributor": "Warner Bros.",' +
                        '\n    "Source": "Original Screenplay",' +
                        '\n    "Major Genre": "Comedy",' +
                        '\n    "Creative Type": "Contemporary Fiction",' +
                        '\n    "Director": null,' +
                        '\n    "Rotten Tomatoes Rating": 7,' +
                        '\n    "IMDB Rating": 4.6,' +
                        '\n    "IMDB Votes": 6848' +
                        "\n}" +
                        "\n])";

                    break;
                case 1:
                    // Read
                    templateScript =
                        'db.collection("movies").find(' +
                        "\n{" +
                        '\n   "MPAA Rating":"R"' +
                        "\n})";

                    break;
                case 2:
                    // Update
                    templateScript =
                        'db.collection("movies").updateMany(' +
                        "\n{" +
                        '\n     "Major Genre":' +
                        "\n     {" +
                        '\n         $eq: "Comedy"' +
                        "\n     }" +
                        "\n}," +
                        "\n{" +
                        "\n     $set:" +
                        "\n     {" +
                        '\n         "Major Genre": "Thriller"' +
                        "\n     }" +
                        "\n})";

                    break;
                case 3:
                    // Delete
                    templateScript =
                        'db.collection("movies").deleteOne(' +
                        "\n{" +
                        '\n     "Title": "Oliver!"' +
                        "\n})";

                    break;
                default:
                    break;
            }
            this.queryText = templateScript;
        },
    },
};
</script>
