import DataModel from '../../../core/dist/node/models'

// Example of model with migration
// For more info, read 

export default DataModel({
  first_name: String,
  last_name: String,
  display_name: String
}, {}, {
  '1.0.1': {
    // upgrades your data from the previous model to the 1.0.1 model
    up: (data) => {
      // fill display name with first name and last name by default
      data.display_name = `${data.first_name} ${data.last_name}`
      
      // return upgraded object
      return data
     },
    // downgrades your data from 1.0.1 to the previous version
    down: (data) => {
      // previous one didn't have display_name, so let's just delete that
      delete data.display_name

      // return downgraded object
      return data
    }
  }
})