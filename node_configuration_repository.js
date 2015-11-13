var knex = require('knex')( require('./knexfile') );
var bookshelf = require('bookshelf')(knex);

var NodeConfiguration = bookshelf.Model.extend({
  tableName: 'node_configuration',
  hasTimestamps: true
});

module.exports = function createNodeConfigurationRepository(){
    function recordNodeConfiguration(nodeConfigurationParams){
        return NodeConfiguration.forge(nodeConfigurationParams).save();
    }

    function createOrUpdateNodeConfiguration(nodeConfigurationParams) {
        return new NodeConfiguration({'nodeId': nodeConfigurationParams.nodeId})
          .fetch()
          .then(function(model) {
            if (model) {
                new NodeConfiguration({id: model.get('id')}).save(nodeConfigurationParams);
            }
            else {
                recordNodeConfiguration(nodeConfigurationParams);
            }
          });
    }

    function getAllNodeConfigurations(){
        return NodeConfiguration.fetchAll({'columns': ['nodeId', 'boxId', 'color', 'created_at']});
    }

    function getTypeForNode(nodeId) {
        return new NodeConfiguration({'nodeId': nodeId})
        .fetch({'columns': ['color']});
    }

    return {
        createOrUpdateNodeConfiguration: createOrUpdateNodeConfiguration,
        getAllNodeConfigurations: getAllNodeConfigurations,
        getTypeForNode: getTypeForNode
    };
}
