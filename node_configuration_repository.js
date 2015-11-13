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

    function updateNodeConfiguration(nodeConfigurationParams){
        return NodeConfiguration.query({where: {nodeId: nodeConfigurationParams.nodeId}})
        .fetch()
        .then(function(model){
          model.set('boxId', nodeConfigurationParams.boxId);
          model.set('color', nodeConfigurationParams.color);
          model.save({'boxId': true}, {patch: true});
          return model;
        });
    }

    function isNodeIdPresent(nodeId) {
      NodeConfiguration.where('nodeId', nodeId).count('nodeId')
          .then(function(count){
              return count;
          });

          // return NodeConfiguration.where('nodeId', nodeId).count(nodeId);
          // Select * from table where nodeId=nodeID;
          // NodeConfiguration.forge({nodeId:nodeId})
          //   .count()
          //   .then(function(count) {
          //     console.log
          //   });

    }

    function getAllNodeConfigurations(){
        return NodeConfiguration.fetchAll({'columns': ['nodeId', 'boxId', 'color', 'created_at']});
    }

    return {
        recordNodeConfiguration: recordNodeConfiguration,
        updateNodeConfiguration: updateNodeConfiguration,
        isNodeIdPresent: isNodeIdPresent,
        getAllNodeConfigurations: getAllNodeConfigurations
    };
}
