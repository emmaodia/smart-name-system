<template>
  <div class="my-smart-names">
    <div class="hello">
      <h1>My Smart Names</h1>
        <p>You can view and manage all your registered smart names</p>
    </div>
    <div v-if="infos.length">
        <div class="card smartname-card">
          <div class="card-header bg-success text-white">Success</div>
          <div class="card-body smartname-info">
              <p v-for="info in infos" v-bind:key="info">{{ info }}</p>
          </div>
        </div>
    </div>
    <div v-if="errors.length">
        <div class="card smartname-card">
          <div class="card-header bg-danger text-white">Error</div>
          <div class="card-body smartname-info">
              <p v-for="error in errors" v-bind:key="error">{{ error }}</p>
          </div>
        </div>
    </div>
    <div v-if="success">
      <div v-for="smartName in smartNames" v-bind:key="smartName">
        <div class="card smartname-card">
          <div class="card-header"><b>{{ smartName.name }}.{{ smartName.ext }}</b></div>
          <div class="card-body smartname-info">
              <p><b>Id: </b>{{ smartName.id }}</p>
              <p><b>Address: </b>{{ smartName.address }}</p>
              <p><b>Administrator: </b>{{ smartName.administrator }}</p>
              <p><b>Record: </b>{{ smartName.record }}</p>
              <p class="smartname-manager">
                <button type="button" class="btn btn-secondary smartname-btn" data-toggle="modal" data-target="#modifyRecordModal">Modify Record</button>
                <button type="button" class="btn btn-warning smartname-btn" data-toggle="modal" data-target="#transferModal">Transfer</button>
                <button type="button" class="btn btn-danger smartname-btn" data-toggle="modal" data-target="#abandonModal">Abandon</button>
              </p>
          </div>
        </div>
        <div class="modal fade" id="modifyRecordModal" tabindex="-1" role="dialog" aria-labelledby="modifyRecordModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <form @submit="modifyRecord(smartName)">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="modifyRecordModalLabel">Modify Record</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <input id="newRecordInput" class="address-input" v-model="newRecordInput" type="text" placeholder="Enter the new record (address)">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="modal fade" id="transferModal" tabindex="-1" role="dialog" aria-labelledby="transferModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <form @submit="transferSmartName(smartName)">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="transferModalLabel">Transfer smart name</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  Are you sure to transfer the smart name ? You will no longer be the administrator
                  <input id="newAdministratorInput" class="address-input" v-model="newAdministratorInput" type="text" placeholder="Enter the new administrator (address)">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-warning">Transfer</button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="modal fade" id="abandonModal" tabindex="-1" role="dialog" aria-labelledby="abandonModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <form @submit="abandonSmartName(smartName)">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="abandonModalLabel">Abandon smart name</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  Are you sure to abandon the smart name ? You will no longer be the administrator
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-danger">Abandon</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!success && !errors.length">
      <div class="spinner-grow text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-secondary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-success" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-danger" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-warning" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-info" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-light" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="spinner-grow text-dark" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'my-smart-names',
  beforeCreate () {
    console.log('registerWeb3 Action dispatched from Home.vue')
    this.$store.dispatch('registerWeb3')
  },
  beforeMount () {
    this.getAllSmartNames()
  },
  components: {},
  data: function () {
    return {
      errors: [],
      infos: [],
      success: false,
      smartNames: [],
      nbSmartNames: 0,
      adminAddress: null,
      newRecordInput: null,
      smartNameIdToManage: null,
      newAdministratorInput: null
    }
  },
  methods: {
    toAscii: function (input) { return this.$store.state.web3.utils.toAscii(input).replace(/\u0000/g, '') },
    getAllSmartNames: async function (e) {
      // Init
      this.errors = []
      this.infos = []
      this.success = false
      this.smartNames = []
      this.nbSmartNames = 0
      this.adminAddress = null
      // Get Smart names
      try {
        // Get administrator info
        let adminInfo = await this.$store.state.smartNameRegistry.methods.getAdministrator().call()
        this.adminAddress = adminInfo[0]
        this.nbSmartNames = adminInfo[1]
        this.smartNamesIds = adminInfo[2]

        // Get all smart names
        for (let i = 0; i < this.nbSmartNames; i++) {
          // Init
          let smartName = {}
          let id = this.smartNamesIds[i]
          console.log(id)

          // Get smart name info
          let smartNameInfo = await this.$store.state.smartNameRegistry.methods.getSmartName(id).call()
          console.log(smartNameInfo)
          smartName.id = id
          smartName.address = smartNameInfo[1]
          smartName.name = this.toAscii(smartNameInfo[2])
          smartName.ext = this.toAscii(smartNameInfo[3])
          smartName.administrator = smartNameInfo[4]
          smartName.record = smartNameInfo[5]

          // Store smart name
          this.smartNames.push(smartName)
        }

        // Check if user have smart name
        if (this.nbSmartNames === 0) {
          this.errors.push('You have no smart name registered')
          return false
        }

        this.success = true
        return true
      } catch (error) {
        this.errors.push('You don\'t have smart names registered')
        // this.errors.push(error)
        return false
      }
    },
    modifyRecord: async function (smartName) {
      try {
        this.errors = []
        this.infos = []

        if (!this.newRecordInput) {
          this.errors.push('The new record provided is null')
          return false
        }

        if (!this.$store.state.web3.utils.isAddress(this.newRecordInput)) {
          this.errors.push('The new record provided is not an ethereum address')
          return false
        }

        if (this.newRecordInput === smartName.record) {
          this.errors.push('The new record provided is the same record registered')
          return false
        }

        try {
          // Modify the record of the smart name
          await this.$store.state.smartNameRegistry.methods.modifyRecord(smartName.id, this.newRecordInput).send({ from: this.$store.state.accounts[0] })
          this.getAllSmartNames()
          this.infos.push('The record has been updated with ' + this.newRecordInput)
        } catch (error) {
          this.errors.push('The record cannot be updated')
          return false
        }
        return true
      } finally {
        $('#modifyRecordModal').modal('hide')
      }
    },
    transferSmartName: async function (smartName) {
      try {
        this.errors = []
        this.infos = []

        if (!this.newAdministratorInput) {
          this.errors.push('The new administrator address provided is null')
          return false
        }

        if (!this.$store.state.web3.utils.isAddress(this.newAdministratorInput)) {
          this.errors.push('The new administrator address provided is not an ethereum address')
          return false
        }

        if (this.newAdministratorInput === smartName.administrator) {
          this.errors.push('You are already the administrator of this smart name')
          return false
        }

        try {
          // Modify the record of the smart name
          await this.$store.state.smartNameRegistry.methods.modifyAdministrator(smartName.id, this.newAdministratorInput).send({ from: this.$store.state.accounts[0] })
          this.getAllSmartNames()
          this.infos.push('The smart name has been transfered to ' + this.newRecordInput)
        } catch (error) {
          this.errors.push('The smart name cannot be transfered')
          return false
        }
        return true
      } finally {
        $('#transferModal').modal('hide')
      }
    },
    abandonSmartName: async function (smartName) {
      try {
        this.errors = []
        this.infos = []
        try {
          // Modify the record of the smart name
          await this.$store.state.smartNameRegistry.methods.abandon(smartName.id).send({ from: this.$store.state.accounts[0] })
          this.getAllSmartNames()
          this.infos.push('The smart name has been abandoned')
        } catch (error) {
          this.errors.push('The smart name cannot be abandoned')
          return false
        }
        return true
      } finally {
        $('#abandonModal').modal('hide')
      }
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.smartname-info {
   text-align: left;
   position: center;
}
.smartname-card {
   margin-left: 25%;
   margin-right: 25%;
   margin-top: 2%;
   margin-bottom: 2%;
}
.smartname-manager {
  text-align: center;
}
.smartname-btn {
  margin-left: 3em;
  margin-right: 3em;
  margin-top: 1em;
  width: 10em
}
.address-input {
  width: 100%
}
</style>
