<template>
  <div class="market">
    <div class="hello">
      <h1>Market</h1>
        <p>You can view smart names to sale and buy them</p>
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
      <div v-for="item in items" v-bind:key="item">
        <div class="card smartname-card">
          <div class="card-header"><b>{{ item.name }}.{{ item.ext }}</b></div>
          <div class="card-body smartname-info">
              <p><b>Id: </b>{{ item.id }}</p>
              <p><b>Address: </b>{{ item.address }}</p>
              <p><b>Administrator: </b>{{ item.administrator }}</p>
              <p><b>Price: </b>{{ item.price / Math.pow(10, 4) }} ETH</p>
              <form @submit="buy()">
                <p class="smartname-manager">
                    <button type="button" class="btn btn-success smartname-btn" data-toggle="modal" data-target="#buyModal" v-on:click="selectCurrentItem(item)">Buy</button>
                </p>
              </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="buyModal" tabindex="-1" role="dialog" aria-labelledby="buyModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <form @submit="buy()">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="buyModalLabel">Buy smart name</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              Are you sure to buy the smart name for {{ this.currentItem.price / Math.pow(10, 4)}} ETH ?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Buy</button>
            </div>
          </div>
        </form>
      </div>
    </div>
      <div v-if="canWithdraw">
      <form id="registry-form" @submit="withdrawPayments">
        <div class="card smartname-card">
          <div class="card-header bg-secondary text-white">Payments</div>
          <div class="card-body smartname-info">
            <p>You have sell smart names for {{ pendingPayments }} ETH</p>
            <button type="submit" class="btn btn-secondary">Withdraw</button>
          </div>
        </div>
      </form>
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
    this.$store.dispatch('registerWeb3')
  },
  beforeMount () {
    this.getAllSmartNamesToSale()
  },
  components: {},
  data: function () {
    return {
      errors: [],
      infos: [],
      success: false,
      items: [],
      pendingPayments: 0,
      canWithdraw: false,
      currentItem: {}
    }
  },
  methods: {
    toBytes: function (input) { return this.$store.state.web3.utils.fromAscii(input) },
    toAscii: function (input) { return this.$store.state.web3.utils.toAscii(input).replace(/\u0000/g, '') },
    selectCurrentItem: function (item) { this.currentItem = item },
    getAllSmartNamesToSale: async function () {
      this.errors = []
      this.infos = []
      this.success = false
      this.items = []
      this.nbSmartNames = 0

      // Get Smart names
      try {
        // Get smart names to sale
        let itemsIds = await this.$store.state.smartNameMarket.methods.getAllItems().call({ from: this.$store.state.accounts[0] })
        let nbItems = await this.$store.state.smartNameMarket.methods.getNbItemsTotal().call({ from: this.$store.state.accounts[0] })

        // Get all smart names
        for (let i = 0; i < itemsIds.length; i++) {
          // Init
          let item = {}
          let id = itemsIds[i]

          if (id !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            // Get item and smart name info
            let itemInfo = await this.$store.state.smartNameMarket.methods.getItem(id).call({ from: this.$store.state.accounts[0] })
            let smartNameInfo = await this.$store.state.smartNameRegistry.methods.getSmartName(id).call({ from: this.$store.state.accounts[0] })

            item.id = id
            item.address = smartNameInfo[1]
            item.name = this.toAscii(smartNameInfo[2])
            item.ext = this.toAscii(smartNameInfo[3])
            item.administrator = smartNameInfo[4]
            item.record = smartNameInfo[5]
            item.price = itemInfo[1]

            // Store smart name
            this.items.push(item)
          }
        }

        // Check if user have smart name
        if (nbItems === '0') {
          this.errors.push('There are no smart names for sale')
          return false
        }
        this.success = true
        return true
      } catch (error) {
        this.errors.push('The smart names for sale cannot be retrieved')
        // this.errors.push(error)
        return false
      } finally {
        this.checkPendingPayments()
      }
    },
    buy: async function () {
      console.log('BUY ' + this.currentItem.id)
      try {
        if (this.currentItem.price > this.$store.state.balance / Math.pow(10, 4)) {
          this.errors.push('You have not enough money')
          return false
        }

        if (this.currentItem.administrator === this.$store.state.accounts[0]) {
          this.errors.push('You are already the owner of this smart name')
          return false
        }

        // Buy smart name
        await this.$store.state.smartNameMarket.methods.buy(this.currentItem.id).send({ from: this.$store.state.accounts[0], value: this.currentItem.price * Math.pow(10, 14) })
        this.infos.push(this.toAscii(this.currentItem.name) + '.' + this.toAscii(this.currentItem.ext) + ' has been purchased for ' + this.currentItem.price / Math.pow(10, 4) + ' ETH')
        this.getAllSmartNamesToSale()
        this.success = true
        return true
      } catch (error) {
        this.errors.push('This smart name cannot be purchased')
        return false
      } finally {
        $('#buyModal').modal('hide')
      }
    },
    checkPendingPayments: async function () {
      this.pendingPayments = await this.$store.state.smartNameMarket.methods.payments(this.$store.state.accounts[0]).call({ from: this.$store.state.accounts[0] }) / Math.pow(10, 14)
      this.canWithdraw = (this.pendingPayments > 0)
    },
    withdrawPayments: async function () {
      await this.$store.state.smartNameMarket.methods.withdrawPayments(this.$store.state.accounts[0]).send({ from: this.$store.state.accounts[0] })
      this.checkPendingPayments()
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
  margin-left: 3em;
  margin-right: 3em;
  margin-top: 1em;
  width: 10em
}
.address-input {
  width: 100%
}
</style>
