<template>
  <div class="registry">
      <div class="hello">
      <h1>Registry</h1>
        <p>You can register a smart name. A Smart name is composed of a name (1-16 characters) and an extension (1-4 characters), separated by a dot : "name"."ext"</p>
    </div>
    <br>
    <div>
      <form id="registry-form" @submit="registerSmartName">
        <div class="form-group">
          <input  id="smartName" v-model="smartName" type="text" class="smartname-input" aria-describedby="emailHelp" placeholder="Enter a smart name">
          <small class="form-text text-muted">example : myname.com</small>
        </div>
        <button type="submit" class="btn btn-secondary">Submit</button>
        <div v-if="errors.length">
           <p v-for="error in errors" v-bind:key="error"> Error : {{ error }}</p>
        </div>
        <div v-if="success">
           <p>Success</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'registry',
  beforeCreate () {
    console.log('registerWeb3 Action dispatched from Home.vue')
    this.$store.dispatch('registerWeb3')
  },
  components: {},
  data: function () {
    return {
      errors: [],
      success: false,
      smartName: null
    }
  },
  computed: {
    web3 () {
      return this.$store.state.web3
    },
    accounts () {
      return this.$store.state.accounts
    },
    contract () {
      return this.$store.state.contract
    },
    networkId () {
      return this.$store.state.networkId
    },
    coinbase () {
      return this.$store.state.coinbase
    },
    balance () {
      return this.$store.state.balance / Math.pow(10, 18)
    }
  },
  methods: {
    registerSmartName: function (e) {
      this.errors = []
      if (!this.smartName) {
        this.errors.push('The smart name is null.')
        return false
      }

      const data = this.smartName.split('.')
      const name = data[0]
      const ext = data[1]

      if (data.length === 2 && name.length > 0 && name.length <= 16 && ext.length > 0 && ext.length <= 4) {
        this.success = true
        return true
      } else {
        this.errors.push('The format of the smart name is not correct')
        return false
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
.smartname-input {
  width: 50%;
}
</style>
