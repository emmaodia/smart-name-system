<template>
  <div class="banking">
    <div class="hello">
      <h1>Banking</h1>
        <p>Send ethers to smart name. Ethers is send to the record address associated to the smart name.</p>
    </div>
    <div>
      <form id="registry-form" @submit="send">
        <div class="form-group">
          <input  id="smartNameInput" v-model="smartNameInput" type="text" class="smartname-input" placeholder="Enter a smart name">
          <input  id="amountInput" v-model="amountInput" type="number" step=0.000000000000000001 class="amount-input" placeholder="ETH">
          <small class="form-text text-muted">example : myname.com</small>
        </div>
        <button type="submit" class="btn btn-secondary">Send</button>
        <div v-if="errors.length">
          <div class="card smartname-card">
            <div class="card-header bg-danger text-white">Error</div>
            <div class="card-body smartname-info">
                <p v-for="error in errors" v-bind:key="error">{{ error }}</p>
            </div>
          </div>
        </div>
        <div v-if="success">
          <div class="card smartname-card">
            <div class="card-header bg-success text-white">Success</div>
            <div class="card-body smartname-info">
              <p v-for="info in infos" v-bind:key="info">{{ info }}</p>
            </div>
          </div>
        </div>
        <div v-if="canWithdraw">
          <form id="registry-form" @submit="withdrawPayments">
            <div class="card smartname-card">
              <div class="card-header bg-secondary text-white">Payments</div>
              <div class="card-body smartname-info">
                <p>You received a payment of {{ pendingPayments }} ETH</p>
                <button type="submit" class="btn btn-secondary">Withdraw</button>
              </div>
            </div>
          </form>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'my-smart-names',
  beforeCreate () {
    this.$store.dispatch('registerWeb3')
  },
  beforeMount () {
    this.checkPendingPayments()
  },
  components: {},
  data: function () {
    return {
      errors: [],
      infos: [],
      success: false,
      smartNameInput: null,
      amountInput: 0,
      pendingPayments: 0,
      canWithdraw: false
    }
  },
  methods: {
    toBytes: function (input) { return this.$store.state.web3.utils.fromAscii(input) },
    toAscii: function (input) { return this.$store.state.web3.utils.toAscii(input).replace(/\u0000/g, '') },
    send: async function () {
      // Init
      this.errors = []
      this.infos = []
      this.success = false

      // Check if smart name is null
      if (!this.smartNameInput) {
        this.errors.push('The smart name is null.')
        return false
      }

      // Check if amount is positive
      if (this.amountInput < 0) {
        this.errors.push('The amount of ethers cannot be negative')
        return false
      }

      const data = this.smartNameInput.split('.')
      const name = data[0]
      const ext = data[1]

      // Check format
      if (data.length === 2 && name.length > 0 && name.length <= 16 && ext.length > 0 && ext.length <= 4) {
        try {
          if (this.amountInput * Math.pow(10, 18) > this.$store.state.balance) {
            this.errors.push('You have not enough money')
            return false
          }
          // Send ethers to smart name
          await this.$store.state.smartNameBanking.methods.send(this.toBytes(name), this.toBytes(ext)).send({ from: this.$store.state.accounts[0], value: this.amountInput * Math.pow(10, 18) })
          let record = await this.$store.state.smartNameResolver.methods.resolve(this.toBytes(name), this.toBytes(ext)).call({ from: this.$store.state.accounts[0] })
          this.infos.push(this.amountInput + ' ETH has been sent to ' + this.smartNameInput + '(' + record + ')')
          this.checkPendingPayments()
          this.success = true
          return true
        } catch (error) {
          this.errors.push('This smart name is not registered')
          return false
        }
      } else {
        this.errors.push('The format of the smart name is not correct.')
        return false
      }
    },
    checkPendingPayments: async function () {
      this.pendingPayments = await this.$store.state.smartNameBanking.methods.payments(this.$store.state.accounts[0]).call({ from: this.$store.state.accounts[0] }) / Math.pow(10, 18)
      this.canWithdraw = (this.pendingPayments > 0)
    },
    withdrawPayments: async function () {
      await this.$store.state.smartNameBanking.methods.withdrawPayments(this.$store.state.accounts[0]).send({ from: this.$store.state.accounts[0] })
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
.smartname-input {
  width: 50%;
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
</style>
