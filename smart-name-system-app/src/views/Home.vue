<template>
  <div class="home">
      <div class="hello">
      <h1>Smart Name System</h1>
        <p>Smart Name System is a decentralized application that allows to register and manage smart names.</p>
        <p> A smart name is a name with the same form that a traditionnal domain name (name.extension).</p>
        <p>This application offers several services</p>
        <li>Registry</li>
        <li>Resolver</li>
        <li>Banking</li>
        <li>Market</li>
    </div>
    <br>
    <div class='metamask-info'>
      <p>Network: {{ networkId }}</p>
      <p>Coinbase: {{ coinbase }} </p>
      <p>Balance: {{ balance }} ETH</p>
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
</style>
