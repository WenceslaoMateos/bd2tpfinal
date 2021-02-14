<template>
    <div id="playground">
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
                <b-navbar-brand href="#">AprendeMongo</b-navbar-brand>
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
                <div class="btn-group ml-3">
                    <button
                        type="button"
                        class="btn btn-secondary dropdown-toggle"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        Db: {{ selectedDbName }}
                    </button>
                    <div class="dropdown-menu">
                        <a
                            v-for="item in availableDbs"
                            class="dropdown-item"
                            href="#"
                            @click.prevent="selectDb(item.id)"
                        >
                            {{ item.name }}
                        </a>
                    </div>
                </div>
                <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
                <b-collapse id="nav-collapse" is-nav>
                    <!-- Right aligned nav items -->
                    <b-navbar-nav class="ml-auto" v-if="registered === true">
                        <div class="btn-group ml-auto">
                            <button
                                type="button"
                                class="btn btn-secondary dropdown-toggle"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                Guests
                            </button>
                            <form class="dropdown-menu p-4" style="min-width:300px" >
                                <div
                                    v-for="item in invitedGuests"
                                    class="input-group mb-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                    </svg>
                                    <input type="text" readonly class="form-control-plaintext" id="staticEmail" :value="item.username" >
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary btn-sm" type="button" @click.prevent="eraseGuest(item.id)">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="input-group mb-3">
                                    <input v-model="guest" type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon2">
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button" @click.prevent="addGuest">Add</button>
                                    </div>
                                </div>
                            </form>
                        </div>
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
                :disabled="getSelectedDbId() !== ''"
                data-toggle="tooltip"
                data-placement="bottom"
                title="Only enabled on your own Db"
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
            guest: "",
            username: "Unknown",
            errorTitle: "Unknown Title",
            errorBody: "Unknown Body",
            availableDbs: [],
            invitedGuests: [],
            selectedDbName: "Unknown"
        };
    },
    mounted: function () {
        this.checkAccessToken();
    },
    methods: {
        clearUserAndPass() {
            this.user = "";
            this.pass = "";
        },
        login() {
            this.loginUser(this.user, this.pass);
            this.clearUserAndPass();
        },
        register() {
            this.registerUser(this.user, this.pass);
            this.clearUserAndPass();
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
                        this.refreshDatabases();
                        this.refreshGuests();
                        this.showPlayground();
                    },
                    (error) => {
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
                    }
                );
            } else {
                this.createGenericUser();
            }
        },
        getUserRegistered(callback, errorCallback) {
            axios.get(config.myURLBackend + "/is_registered", this.getOAuthConfig()).then(
                (response) => {
                    callback(response.data);
                },
                (error) => {
                    errorCallback(error);
                }
            );
        },
        getQueryHistory(callback, errorCallback) {
            axios.get(config.myURLBackend + "/query_history", this.getOAuthConfig()).then(
                (response) => {
                    callback(response.data);
                },
                (error) => {
                    errorCallback(error);
                }
            );
        },
        refreshDatabases() {
            axios.get(config.myURLBackend + "/get_invited_to", this.getOAuthConfig()).then(
                (response) => {
                    // Recreate the database array with the response.
                    this.availableDbs = [ 
                        {
                            id: "",
                            name: (this.registered ? this.username : "anonymous")
                        }
                    ];

                    for (const user of response.data) {
                        this.availableDbs.push({
                            id: user._id,
                            name: user.username,
                        });
                    }

                    this.refreshDbSelectedName();
                },
                (error) => {
                    errorCallback(error);
                }
            );
        },
        getSelectedDbId() {
            var selectedDbId = localStorage.getItem('selectedDbId');
            if (!selectedDbId) {
                selectedDbId = "";
            }

            return selectedDbId;
        },
        refreshDbSelectedName() {
            var selectedDbId = this.getSelectedDbId();
            var found = false;
            for (const db of this.availableDbs) {
                if (selectedDbId === db.id) {
                    this.selectedDbName = db.name;
                    found = true;
                }
            }

            // Reset the selected db id if it's not available.
            if (!found) {
                localStorage.setItem('selectedDbId', null);
                this.selectedDbName = this.availableDbs[0].name;
            }
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
            // Do nothing.
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
            const params = new URLSearchParams();
            params.append("newName", newName);
            params.append("newPassword", newPassword);
            axios
                .post(config.myURLBackend + "/register", params, this.getOAuthConfig())
                .then(
                    (response) => {
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
            localStorage.setItem("selectedDbId", null);
            this.checkAccessToken();
        },
        runQuery() {
            const params = new URLSearchParams();
            params.append("query", this.queryText);
            params.append("otherId", this.getSelectedDbId());

            axios
                .post(config.myURLBackend + "/run_query", params, this.getOAuthConfig())
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
        addGuest() {
            if (this.guest !== "") {
                const params = new URLSearchParams();
                params.append("toName", this.guest);

                axios
                    .post(config.myURLBackend + "/invite_user", params, this.getOAuthConfig())
                    .then(
                        (response) => {
                            this.refreshGuests();
                        },
                        (error) => {
                            this.showError(error);
                        }
                    );

                this.guest = "";
            }
        },
        eraseGuest(userId) {
            const params = new URLSearchParams();
                params.append("toId", userId);

                axios
                    .post(config.myURLBackend + "/uninvite_user", params, this.getOAuthConfig())
                    .then(
                        (response) => {
                            this.refreshGuests();
                        },
                        (error) => {
                            this.showError(error);
                        }
                    );
        },
        refreshGuests() {
            axios.get(config.myURLBackend + "/get_invited_from", this.getOAuthConfig()).then(
                (response) => {
                    this.invitedGuests = [];
                    for (const user of response.data) {
                        this.invitedGuests.push({
                            id: user._id,
                            username: user.username
                        });
                    }
                },
                (error) => {
                    errorCallback(error);
                }
            );
        },
        selectDb(userId) {
            localStorage.setItem('selectedDbId', userId);
            this.refreshDbSelectedName();
        },
        getOAuthConfig() {
            var accessToken = localStorage.getItem("accessToken");
            return { headers: { Authorization: `Bearer ${accessToken}` } };
        }
    },
};
</script>
