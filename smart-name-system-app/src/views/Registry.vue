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
          <input  id="smartNameInput" v-model="smartNameInput" type="text" class="smartname-input" placeholder="Enter a smart name">
          <small class="form-text text-muted">example : myname.com</small>
        </div>
        <button type="submit" class="btn btn-secondary">Register</button>
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
            <div class="card-header bg-success text-white">{{ smartName.name }}.{{ smartName.ext }} is registered</div>
            <div class="card-body smartname-info">
                <p><b>Id: </b>{{ smartName.id }}</p>
                <p><b>Address: </b>{{ smartName.address }}</p>
                <p><b>Administrator: </b>{{ smartName.administrator }}</p>
                <p><b>Record: </b>{{ smartName.record }}</p>
            </div>
          </div>
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
      smartName: {
        id: null,
        address: null,
        name: null,
        ext: null,
        administrator: null,
        record: null
      },
      smartNameInput: null
    }
  },
  methods: {
    toBytes: function (input) { return this.$store.state.web3.utils.fromAscii(input) },
    registerSmartName: async function (e) {
      this.errors = []
      this.success = false
      this.smartNameInfo = {
        id: null,
        address: null,
        name: null,
        ext: null,
        administrator: null,
        record: null
      }

      // Check if smart name is null
      if (!this.smartNameInput) {
        this.errors.push('The smart name is null.')
        return false
      }

      const data = this.smartNameInput.split('.')
      const name = data[0]
      const ext = data[1]

      // Check format
      if (data.length === 2 && name.length > 0 && name.length <= 16 && ext.length > 0 && ext.length <= 4) {
        try {
          // Register
          await this.$store.state.smartNameRegistry.methods.register(this.toBytes(name), this.toBytes(ext)).send({ from: this.$store.state.accounts[0] })

          // Get Id
          let id = await this.$store.state.smartNameRegistry.methods.getIdOf(this.toBytes(name), this.toBytes(ext)).call({ from: this.$store.state.accounts[0] })

          // Get info
          let smartNameInfo = await this.$store.state.smartNameRegistry.methods.getSmartName(id).call({ from: this.$store.state.accounts[0] })

          // Store smart name
          this.smartName.id = id
          this.smartName.address = smartNameInfo[1]
          this.smartName.name = name
          this.smartName.ext = ext
          this.smartName.administrator = smartNameInfo[4]
          this.smartName.record = smartNameInfo[5]

          this.success = true
          return true
        } catch (error) {
          this.errors.push('This smart is already registered.')
          // this.errors.push(error)
          return false
        }
      } else {
        this.errors.push('The format of the smart name is not correct.')
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
