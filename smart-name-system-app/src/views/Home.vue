<template>
  <div class="home">
    <div class="hello">
      <h1>Smart Name System</h1>
        <p>Smart Name System is a decentralized application that allows to register and manage smart names.</p>
        <p>A smart name is a name with the same form that a traditionnal domain name (name.extension).</p>
        <p>This application offers several services</p>
        <li><b>Registry</b></li>
        <li><b>Resolver</b></li>
        <li><b>Banking</b></li>
        <li><b>Market</b></li>
    </div>
    <br>
      <div class="card smartname-card">
        <div class="card-header bg-secondary text-white">Informations</div>
        <div class="card-body smartname-info">
          <p><b>Network id : </b>{{ networkId }}</p>
          <p><b>Account: </b>{{ accounts[0] }}</p>
          <p><b>Balance: </b>{{ balance }} ETH</p>
        </div>
      </div>
      <div class="card smartname-card">
        <div class="card-header bg-secondary text-white">Contracts</div>
        <div class="card-body smartname-info">
          <p><b>SmartNameRegistry : </b>{{ smartNameRegistry.options.address }}</p>
          <p><b>SmartNameResolver : </b>{{ smartNameResolver.options.address }}</p>
          <p><b>SmartNameBanking : </b>{{ smartNameBanking.options.address }}</p>
          <p><b>SmartNameMarket : </b>{{ smartNameMarket.options.address }}</p>
          <p><b>SmartNameLibrary : </b>{{ smartNameLibrary.options.address }}</p>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  beforeCreate () {
    console.log('registerWeb3 Action dispatched from Home.vue')
    this.$store.dispatch('registerWeb3')
  },
  components: {},
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
    },
    smartNameRegistry () {
      console.log(this.$store.state.smartNameRegistry)
      return this.$store.state.smartNameRegistry
    },
    smartNameResolver () {
      return this.$store.state.smartNameResolver
    },
    smartNameBanking () {
      return this.$store.state.smartNameBanking
    },
    smartNameMarket () {
      return this.$store.state.smartNameMarket
    },
    smartNameLibrary () {
      console.log(this.$store.state.smartNameLibrary)
      return this.$store.state.smartNameLibrary
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
</style>
