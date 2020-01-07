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
                <button type="button" class="btn btn-primary smartname-btn" data-toggle="modal" data-target="#modifyRecordModal" v-on:click="selectCurrentSmartName(smartName)">Modify Record</button>
                <button v-if="!smartName.isOnSale" type="button" class="btn btn-secondary smartname-btn" data-toggle="modal" data-target="#unlockModal" v-on:click="selectCurrentSmartName(smartName)">Sell</button>
                <button v-if="!smartName.isOnSale" type="button" class="btn btn-warning smartname-btn" data-toggle="modal" data-target="#transferModal" v-on:click="selectCurrentSmartName(smartName)">Transfer</button>
                <button v-if="!smartName.isOnSale" type="button" class="btn btn-danger smartname-btn" data-toggle="modal" data-target="#abandonModal" v-on:click="selectCurrentSmartName(smartName)">Abandon</button>
                <button v-if="smartName.isOnSale" type="button" class="btn btn-secondary smartname-btn" data-toggle="modal" data-target="#cancelSaleModal" v-on:click="selectCurrentSmartName(smartName)">Cancel sale</button>
              </p>
          </div>
        </div>
    </div>

    <div class="modal fade" id="modifyRecordModal" tabindex="-1" role="dialog" aria-labelledby="modifyRecordModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <form @submit="modifyRecord()">
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
                  <button id="submitBtn" type="submit" class="btn btn-primary">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div class="modal fade" id="unlockModal" tabindex="-1" role="dialog" aria-labelledby="unlockModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <form @submit="unlock()">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="unlockModalLabel">Unlock smart name</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <input id="unlockerInput" class="address-input" v-model="unlockerInput" type="password" placeholder="Enter a password">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Unlock</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div class="modal fade" id="sellModal" tabindex="-1" role="dialog" aria-labelledby="sellModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <form @submit="sell()">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="sellModalLabel">Modify Record</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <input id="priceInput" v-model="priceInput" type="number" step=0.0001 placeholder="Enter the price"> ETH
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Sell</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div class="modal fade" id="transferModal" tabindex="-1" role="dialog" aria-labelledby="transferModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <form @submit="transfer()">
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
            <form @submit="abandon()">
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

        <div class="modal fade" id="cancelSaleModal" tabindex="-1" role="dialog" aria-labelledby="cancelSaleModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <form @submit="cancelSale()">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="cancelSaleModalLabel">Cancel the sale of smart name</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  Are you sure to cancel the sale of this smart name ?
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Yes</button>
                </div>
              </div>
            </form>
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
      unlocker: null,
      newRecordInput: null,
      newAdministratorInput: null,
      priceInput: null,
      unlockerInput: null,
      currentSmartName: {}
    }
  },
  methods: {
    toBytes: function (input) { return this.$store.state.web3.utils.fromAscii(input) },
    toAscii: function (input) { return this.$store.state.web3.utils.toAscii(input).replace(/\u0000/g, '') },
    selectCurrentSmartName: function (smartName) { this.currentSmartName = smartName },
    getAllSmartNames: async function () {
      // Init
      this.errors = []
      this.infos = []
      this.success = false
      this.smartNames = []

      // Get Smart names
      try {
        // Get administrator info
        let adminInfo = await this.$store.state.smartNameRegistry.methods.getAdministrator().call({ from: this.$store.state.accounts[0] })
        let smartNamesIds = adminInfo[2]

        // Get all smart names
        for (let i = 0; i < smartNamesIds.length; i++) {
          // Init
          let smartName = {}
          let id = smartNamesIds[i]

          if (id !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            // Get smart name info
            let smartNameInfo = await this.$store.state.smartNameRegistry.methods.getSmartName(id).call({ from: this.$store.state.accounts[0] })
            smartName.id = id
            smartName.address = smartNameInfo[1]
            smartName.name = this.toAscii(smartNameInfo[2])
            smartName.ext = this.toAscii(smartNameInfo[3])
            smartName.administrator = smartNameInfo[4]
            smartName.record = smartNameInfo[5]
            smartName.isOnSale = await this.$store.state.smartNameMarket.methods.isForSale(id).call({ from: this.$store.state.accounts[0] })

            // Store smart name
            this.smartNames.push(smartName)
          }
        }

        this.success = true
        return true
      } catch (error) {
        this.errors.push('You don\'t have smart names registered')
        // this.errors.push(error)
        return false
      }
    },
    modifyRecord: async function () {
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

      if (this.newRecordInput === this.currentSmartName.record) {
        this.errors.push('The new record provided is the same record registered')
        return false
      }

      try {
        // Modify the record of the smart name
        await this.$store.state.smartNameRegistry.methods.modifyRecord(this.currentSmartName.id, this.newRecordInput).send({ from: this.$store.state.accounts[0] })
        this.getAllSmartNames()
        this.infos.push('The record has been updated with ' + this.newRecordInput)
        return true
      } catch (error) {
        this.errors.push('The record cannot be updated')
        return false
      } finally {
        this.newRecordInput = null
        $('#modifyRecordModal').modal('hide')
      }
    },
    transfer: async function () {
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

      if (this.newAdministratorInput === this.currentSmartName.administrator) {
        this.errors.push('You are already the administrator of this smart name')
        return false
      }

      try {
        // Modify the record of the smart name
        await this.$store.state.smartNameRegistry.methods.modifyAdministrator(this.currentSmartName.id, this.newAdministratorInput).send({ from: this.$store.state.accounts[0] })
        this.getAllSmartNames()
        this.infos.push('The smart name has been transfered to ' + this.newRecordInput)
        return true
      } catch (error) {
        this.errors.push('The smart name cannot be transfered')
        return false
      } finally {
        this.newAdministratorInput = null
        $('#transferModal').modal('hide')
      }
    },
    abandon: async function () {
      this.errors = []
      this.infos = []
      try {
        // Abandon the smart name
        await this.$store.state.smartNameRegistry.methods.abandon(this.currentSmartName.id).send({ from: this.$store.state.accounts[0] })
        this.getAllSmartNames()
        this.infos.push('The smart name has been abandoned')
        return true
      } catch (error) {
        this.errors.push('The smart name cannot be abandoned')
        return false
      } finally {
        $('#abandonModal').modal('hide')
      }
    },
    unlock: async function () {
      this.errors = []
      this.infos = []

      if (!this.unlockerInput) {
        this.errors.push('The password cannot be null')
        return false
      }

      // Unlock the smart name with the password
      try {
        this.unlocker = this.unlockerInput
        await this.$store.state.smartNameRegistry.methods.setUnlocker(this.currentSmartName.id, this.toBytes(this.unlocker)).send({ from: this.$store.state.accounts[0] })
        $('#sellModal').modal('show')
        return true
      } catch (error) {
        this.errors.push('The smart name cannot be unlocked')
        return false
      } finally {
        this.unlockerInput = null
        $('#unlockModal').modal('hide')
      }
    },
    sell: async function () {
      this.errors = []
      this.infos = []

      if (!this.unlocker) {
        this.errors.push('The smart name is not unlocked')
        return false
      }

      if (!this.priceInput) {
        this.errors.push('The price cannot be null')
        return false
      }

      if (this.priceInput <= 0) {
        this.errors.push('The price must be more than 0 ETH')
        return false
      }

      try {
        // Put on sale the smart name
        await this.$store.state.smartNameMarket.methods.sell(this.currentSmartName.id, this.priceInput * Math.pow(10, 4), this.toBytes(this.unlocker)).send({ from: this.$store.state.accounts[0] })
        this.getAllSmartNames()
        this.infos.push('The smart name has been put on sale for ' + this.priceInput + ' ETH')
        return true
      } catch (error) {
        this.errors.push('The smart name cannot be put on sale')
        return false
      } finally {
        this.unlocker = null
        this.priceInput = null
        $('#sellModal').modal('hide')
      }
    },
    cancelSale: async function () {
      this.errors = []
      this.infos = []
      try {
        // Cancel the sale of the smart name
        await this.$store.state.smartNameMarket.methods.cancelSale(this.currentSmartName.id).send({ from: this.$store.state.accounts[0] })
        this.getAllSmartNames()
        this.infos.push('The sale of the smart name is canceled')
        return true
      } catch (error) {
        this.errors.push('The sale of this smart name cannot be canceled')
        return false
      } finally {
        $('#cancelSaleModal').modal('hide')
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
  color: #258;
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
  margin-left: 1em;
  margin-right: 1em;
  margin-top: 1em;
  width: 10em
}
.address-input {
  width: 100%
}
</style>
