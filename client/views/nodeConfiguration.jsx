'use strict';
var React = require('react');
var nodeConfiguration = React.createClass({

  render: function() {
    return (
      <div id="nodeForm">
        <form id="nodeConfiguration" method="post" action="/configure">
          <div>
            <label>Box ID *</label>
            <input name="groupId" required type="text" />
          </div>
          <div>
            <label>Node ID *</label>
            <input name="nodeId" required type="text" />
          </div>
          <div>
            <label>Node Type</label>
            <input name="nodeType" required type="text" />
          </div>

          <div>
            <button className="btn btn-primary" type="submit">Save Config</button>
          </div>
        </form>
      </div>
    );
  }
});

module.exports = nodeConfiguration;